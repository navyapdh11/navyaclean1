import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { successResponse, paginatedResponse } from '../utils/apiResponse';
import { AuthRequest, authenticate } from '../middleware/auth';
import { paginate } from '../utils/helpers';
import { PaymentStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) : null;

// Webhook event deduplication - in-memory cache with TTL
const processedEvents = new Map<string, number>();
const EVENT_TTL = 24 * 60 * 60 * 1000; // 24 hours

router.post('/create-intent', authenticate,
  [body('bookingId').isUUID()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!stripe) throw new AppError(500, 'Payment provider not configured');
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');

      const booking = await prisma.booking.findFirst({ where: { id: req.body.bookingId, customerId: req.user!.id } });
      if (!booking) throw new AppError(404, 'Booking not found');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100),
        currency: 'usd',
        metadata: { bookingId: booking.id, customerId: req.user!.id },
      });

      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        create: { bookingId: booking.id, payerId: req.user!.id, amount: booking.totalPrice, method: 'stripe', stripePaymentId: paymentIntent.id, status: 'PENDING' },
        update: { stripePaymentId: paymentIntent.id, status: 'PENDING' },
      });

      return successResponse(res, { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }, 'Payment intent created');
    } catch (error) { next(error); }
  }
);

router.post('/webhook', async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return res.status(400).send('Webhook not configured');
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    // req.body is raw Buffer from bodyParser.raw()
    try { event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET); }
    catch (err: any) { 
      logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`); 
    }

    logger.info(`Processing Stripe webhook event: ${event.type} (ID: ${event.id})`);

    // Clean old events from cache
    const now = Date.now();
    for (const [eventId, timestamp] of processedEvents) {
      if (now - timestamp > EVENT_TTL) processedEvents.delete(eventId);
    }

    // Idempotency: Check if event was already processed (by event ID, not payment intent ID)
    if (processedEvents.has(event.id)) {
      logger.warn(`Duplicate webhook event ignored: ${event.id}`);
      return res.json({ received: true, duplicate: true });
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.bookingId;

      if (!bookingId) {
        logger.error('Webhook payment_intent.succeeded missing bookingId metadata');
        return res.status(400).send('Missing bookingId');
      }

      // Verify payment amount matches booking amount
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { totalPrice: true, status: true },
      });

      if (!booking) {
        logger.error(`Booking ${bookingId} not found for webhook event`);
        return res.status(404).send('Booking not found');
      }

      // Verify amount (Stripe amount is in cents)
      const expectedAmount = Math.round(booking.totalPrice * 100);
      if (pi.amount !== expectedAmount) {
        logger.error(`Amount mismatch for booking ${bookingId}: expected ${expectedAmount}, got ${pi.amount}`);
        return res.status(400).send('Amount mismatch');
      }

      // Only update if not already confirmed (idempotency guard)
      if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { stripePaymentId: pi.id },
            data: { status: 'COMPLETED', paidAt: new Date() },
          }),
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
          }),
        ]);
        logger.info(`Booking ${bookingId} confirmed via webhook`);
      } else {
        logger.info(`Booking ${bookingId} already in status ${booking.status}, skipping update`);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentId: pi.id },
        data: { status: 'FAILED' },
      });
      logger.warn(`Payment failed for intent: ${pi.id}`);
    }

    res.json({ received: true });

    // Mark event as processed after successful response
    processedEvents.set(event.id, Date.now());
  } catch (error) {
    logger.error(`Webhook processing error: ${error}`);
    next(error);
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { skip, take } = paginate(page, limit);
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ where: { payerId: req.user!.id }, skip, take, include: { booking: { include: { service: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.payment.count({ where: { payerId: req.user!.id } }),
    ]);
    return paginatedResponse(res, payments, page, limit, total);
  } catch (error) { next(error); }
});

export default router;
