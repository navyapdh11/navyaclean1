import { Router, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import { successResponse, paginatedResponse } from '../utils/apiResponse';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';
import { paginate, calculateEndTime } from '../utils/helpers';
import { BookingStatus, ServiceType } from '@prisma/client';

const router = Router();

// ===== ADMIN ROUTES (must be before parameterized routes) =====

router.get('/admin/all', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as BookingStatus | undefined;
    const { skip, take } = paginate(page, limit);
    const where: Record<string, any> = {};
    if (status) where.status = status;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, skip, take, include: { customer: { include: { user: true } }, service: true, staff: { include: { user: true } } }, orderBy: { date: 'desc' } }),
      prisma.booking.count({ where }),
    ]);
    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) { next(error); }
});

router.put('/admin/:id/assign', authenticate, authorize('ADMIN', 'MANAGER'),
  [body('staffId').isUUID()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');

      const { staffId } = req.body;
      const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { startTime: true, endTime: true, status: true },
      });

      if (!booking) throw new AppError(404, 'Booking not found');

      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      if (!staff || !staff.isActive) throw new AppError(400, 'Selected staff unavailable');

      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          staffId,
          id: { not: bookingId },
          status: { in: ['CONFIRMED', 'IN_PROGRESS', 'PENDING'] },
          OR: [
            { startTime: { lte: booking.startTime }, endTime: { gt: booking.startTime } },
            { startTime: { lt: booking.endTime }, endTime: { gte: booking.endTime } },
            { startTime: { gte: booking.startTime }, endTime: { lte: booking.endTime } },
          ],
        },
      });

      if (overlappingBooking) {
        throw new AppError(409, 'Staff member has a scheduling conflict. Please choose a different staff member', 'SCHEDULING_CONFLICT');
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { staffId, status: 'CONFIRMED' },
        include: { staff: { include: { user: true } } },
      });
      return successResponse(res, updated, 'Staff assigned successfully');
    } catch (error) { next(error); }
  }
);

// ===== PARAMETERIZED ROUTES =====

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as BookingStatus | undefined;
    const { skip, take } = paginate(page, limit);

    const where: Record<string, any> = { customerId: req.user!.id };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, skip, take, include: { service: true, staff: { include: { user: true } } }, orderBy: { date: 'desc' } }),
      prisma.booking.count({ where }),
    ]);
    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) { next(error); }
});

router.post('/', authenticate,
  [body('serviceId').isUUID(), body('date').isISO8601(), body('address').trim().isLength({ min: 5 })],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');

      const { serviceId, date, address, notes, staffId } = req.body;
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.isActive) throw new AppError(404, 'Service unavailable');

      // Date validation: prevent bookings in the past
      const requestedDate = new Date(date);
      const now = new Date();
      now.setMinutes(0, 0, 0); // Round down to current hour
      if (requestedDate < now) {
        throw new AppError(400, 'Cannot book dates in the past. Please select a future date', 'INVALID_DATE');
      }

      // Validate staff if provided
      if (staffId) {
        const staff = await prisma.staff.findUnique({ where: { id: staffId } });
        if (!staff || !staff.isActive) throw new AppError(400, 'Selected staff unavailable');
        
        // OVERLAP PREVENTION: Check if staff member is already booked during this time
        const startTime = new Date(date);
        const endTime = calculateEndTime(startTime, service.duration);
        
        const overlappingBooking = await prisma.booking.findFirst({
          where: {
            staffId,
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'PENDING'] },
            OR: [
              // New booking starts during existing booking
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              // New booking ends during existing booking
              { startTime: { lt: endTime }, endTime: { gte: endTime } },
              // New booking completely contains existing booking
              { startTime: { gte: startTime }, endTime: { lte: endTime } },
            ],
          },
        });

        if (overlappingBooking) {
          throw new AppError(409, 'Staff member is already booked during this time slot. Please choose a different time or staff member', 'SCHEDULING_CONFLICT');
        }
      } else {
        // If no staff selected, still validate the date is valid
        var startTime = new Date(date);
        var endTime = calculateEndTime(startTime, service.duration);
      }

      // Wrap booking + customer creation in transaction for data integrity
      const [booking] = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            customerId: req.user!.id,
            serviceId,
            staffId,
            date: startTime,
            startTime,
            endTime,
            address,
            notes,
            totalPrice: service.basePrice,
            status: 'PENDING',
          },
          include: { service: true },
        });

        await tx.customer.upsert({
          where: { userId: req.user!.id },
          create: { userId: req.user!.id, address, city: '', state: '', zipCode: '', totalBookings: 1 },
          update: { totalBookings: { increment: 1 } },
        });

        return [newBooking];
      });

      return successResponse(res, booking, 'Booking created', 201);
    } catch (error) { next(error); }
  }
);

router.put('/:id/cancel', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findFirst({ where: { id: req.params.id, customerId: req.user!.id } });
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new AppError(400, 'Cannot cancel this booking');
    }
    const updated = await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    return successResponse(res, updated, 'Booking cancelled');
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, customerId: req.user!.id },
      include: { service: true, staff: { include: { user: true } }, payment: true, reviews: true },
    });
    if (!booking) throw new AppError(404, 'Booking not found');
    return successResponse(res, booking);
  } catch (error) { next(error); }
});

export default router;
