import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { successResponse } from '../utils/apiResponse';
import { AuthRequest, authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

const generateTokens = (user: { id: string; email: string; role: string }, version: number = 0) => {
  // @ts-expect-error - JWT library type inference issue with dynamic expiresIn
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
  // @ts-expect-error - JWT library type inference issue with dynamic expiresIn
  const refreshToken = jwt.sign(
    { id: user.id, version },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
};

const getPasswordResetSecret = (): string => (env as any).PASSWORD_RESET_SECRET || env.JWT_SECRET;

// POST /register
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstName').trim().isLength({ min: 1 }),
    body('lastName').trim().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
      const { email, password, firstName, lastName, phone } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new AppError(409, 'Email already registered');
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, firstName, lastName, phone, role: 'CUSTOMER' },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      });
      await prisma.customer.create({ data: { userId: user.id, address: '', city: '', state: '', zipCode: '' } });
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Set HTTP-only cookies for security
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      
      return res.status(201).json({ success: true, data: { user }, message: 'Registration successful' });
    } catch (error) { next(error); }
  }
);

// POST /login
router.post('/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new AppError(401, 'Invalid credentials');
      if (!user.isActive) throw new AppError(403, 'Account deactivated');
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        const remainingMin = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
        throw new AppError(429, `Account locked. Try again in ${remainingMin} minute(s)`, 'ACCOUNT_LOCKED');
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        const newAttempts = user.failedLoginAttempts + 1;
        if (newAttempts >= 5) {
          await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: newAttempts, lockoutUntil: new Date(Date.now() + 15 * 60 * 1000) } });
          throw new AppError(429, 'Account locked due to too many failed attempts. Try again in 15 minutes', 'ACCOUNT_LOCKED');
        }
        await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: newAttempts } });
        throw new AppError(401, `Invalid credentials. ${5 - newAttempts} attempt(s) remaining`);
      }
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockoutUntil: null } });
      const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role }, user.refreshTokenVersion);
      
      // Set HTTP-only cookies for security (prevents XSS token theft)
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });
      
      return successResponse(res, { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar } }, 'Login successful');
    } catch (error) { next(error); }
  }
);

// POST /refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new AppError(401, 'Refresh token required');
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; version: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive || user.refreshTokenVersion !== decoded.version) throw new AppError(401, 'Invalid refresh token');
    const newVersion = user.refreshTokenVersion + 1;
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenVersion: newVersion } });
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role }, newVersion);
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    
    return successResponse(res, null, 'Token refreshed');
  } catch (error) { next(error); }
});

// POST /logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.id) await prisma.user.update({ where: { id: req.user.id }, data: { lastLogoutAt: new Date(), refreshTokenVersion: { increment: 1 } } });
    
    // Clear HTTP-only cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) { next(error); }
});

// GET /profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { customer: true, staff: true } });
    return successResponse(res, user, 'Profile retrieved');
  } catch (error) { next(error); }
});

// PUT /profile
router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { firstName, lastName, phone, avatar }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, role: true } });
    return successResponse(res, user, 'Profile updated');
  } catch (error) { next(error); }
});

// POST /forgot-password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return successResponse(res, null, 'If the email exists, a reset link has been sent');
    const resetToken = jwt.sign({ id: user.id, type: 'password-reset' }, getPasswordResetSecret(), { expiresIn: '1h' });
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailService = (await import('../services/emailService')).emailService;
    await emailService.sendEmail(email, 'password_reset', { resetUrl, email });
    logger.info(`Password reset requested for user ${user.id}`);
    return successResponse(res, null, 'If the email exists, a reset link has been sent');
  } catch (error) { next(error); }
});

// POST /reset-password
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
    const { token, password } = req.body;
    const decoded = jwt.verify(token, getPasswordResetSecret()) as { id: string; type: string };
    if (decoded.type !== 'password-reset') throw new AppError(400, 'Invalid reset token');
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hashedPassword } });
    logger.info(`Password reset successful for user ${decoded.id}`);
    return successResponse(res, null, 'Password reset successful');
  } catch (error) { next(error); }
});

// GET /verify-email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw new AppError(400, 'Verification token required');
    const decoded = jwt.verify(token as string, getPasswordResetSecret()) as { id: string; type: string };
    if (decoded.type !== 'email-verification') throw new AppError(400, 'Invalid verification token');
    await prisma.user.update({ where: { id: decoded.id }, data: { emailVerified: true } });
    return successResponse(res, null, 'Email verified successfully');
  } catch (error) { next(error); }
});

export default router;
