import { Router, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import { successResponse, paginatedResponse } from '../utils/apiResponse';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';
import { paginate } from '../utils/helpers';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { strictLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

// User management
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as UserRole | undefined;
    const { skip, take } = paginate(page, limit);
    const where: Record<string, any> = {};
    if (role) where.role = role;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return paginatedResponse(res, users, page, limit, total);
  } catch (error) { next(error); }
});

router.put('/users/:id',
  [body('role').optional().isIn(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']), body('isActive').optional().isBoolean()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');
      const { role, isActive } = req.body;
      const data: Record<string, any> = {};
      if (role !== undefined) data.role = role;
      if (isActive !== undefined) data.isActive = isActive;
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, role: true, isActive: true } });
      return successResponse(res, user, 'User updated');
    } catch (error) { next(error); }
  }
);

router.post('/users', strictLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().isLength({ min: 1 }),
    body('lastName').trim().isLength({ min: 1 }),
    body('role').isIn(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');
      const { email, password, firstName, lastName, role, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({ data: { email, password: hashedPassword, firstName, lastName, role, phone }, select: { id: true, email: true, firstName: true, lastName: true, role: true } });
      return successResponse(res, user, 'User created', 201);
    } catch (error) { next(error); }
  }
);

// Staff management
router.get('/staff', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const staff = await prisma.staff.findMany({ include: { user: { select: { firstName: true, lastName: true, email: true } } } });
    return successResponse(res, staff);
  } catch (error) { next(error); }
});

router.post('/staff', [body('userId').isUUID(), body('specialization').isString(), body('hourlyRate').isFloat({ min: 0 })], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');
    const { userId, specialization, hourlyRate, certifications } = req.body;
    const existing = await prisma.staff.findUnique({ where: { userId } });
    if (existing) throw new AppError(409, 'Staff profile exists');
    const employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
    const staff = await prisma.staff.create({ data: { userId, employeeId, specialization, hourlyRate, certifications }, include: { user: true } });
    await prisma.user.update({ where: { id: userId }, data: { role: 'STAFF' } });
    return successResponse(res, staff, 'Staff created', 201);
  } catch (error) { next(error); }
});

// User delete
router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    // Prevent self-deletion
    if (userId === req.user!.id) throw new AppError(400, 'Cannot delete your own account');
    await prisma.user.delete({ where: { id: userId } });
    return successResponse(res, null, 'User deleted');
  } catch (error) { next(error); }
});

// Get user bookings (for CRM details modal)
router.get('/users/:id/bookings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // First get the customerId for this user
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      return paginatedResponse(res, [], page, limit, 0);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: customer.id },
        skip,
        take: limit,
        include: {
          service: { select: { name: true } },
          staff: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.booking.count({ where: { customerId: customer.id } }),
    ]);

    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) { next(error); }
});

// Staff update
router.put('/staff/:id',
  [
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('specialization').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('certifications').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');

      const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { hourlyRate, specialization, isActive, certifications } = req.body;
      const data: Record<string, any> = {};
      if (hourlyRate !== undefined) data.hourlyRate = hourlyRate;
      if (specialization !== undefined) data.specialization = specialization;
      if (isActive !== undefined) data.isActive = isActive;
      if (certifications !== undefined) data.certifications = certifications;

      const staff = await prisma.staff.update({
        where: { id: staffId },
        data,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      });
      return successResponse(res, staff, 'Staff updated');
    } catch (error) { next(error); }
  }
);

// Staff delete
router.delete('/staff/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if staff has active bookings
    const activeBookings = await prisma.booking.count({
      where: { staffId, status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
    });
    if (activeBookings > 0) {
      throw new AppError(400, 'Cannot delete staff with active bookings. Reassign bookings first.', 'STAFF_HAS_BOOKINGS');
    }

    const staff = await prisma.staff.findUnique({ where: { id: staffId }, include: { user: true } });
    if (!staff) throw new AppError(404, 'Staff not found');

    // Delete staff record and revert user role
    await prisma.staff.delete({ where: { id: staffId } });
    await prisma.user.update({ where: { id: staff.userId }, data: { role: 'CUSTOMER' } });

    return successResponse(res, null, 'Staff deleted and user role reverted to CUSTOMER');
  } catch (error) { next(error); }
});

// Staff availability update
router.put('/staff/:id/availability',
  [body('availability').isArray()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Validation failed');

      const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { availability } = req.body; // Array of day names

      const existingStaff = await prisma.staff.findUnique({ where: { id: staffId } });
      if (!existingStaff) throw new AppError(404, 'Staff not found');

      const staff = await prisma.staff.update({
        where: { id: staffId },
        data: { certifications: { set: [...existingStaff.certifications, ...availability.map((d: string) => `available:${d}`)] } },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      return successResponse(res, staff, 'Availability updated');
    } catch (error) { next(error); }
  }
);

// Analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalRevenue, totalBookings, avgRating, topServices] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.booking.count(),
      prisma.review.aggregate({ where: { isPublished: true }, _avg: { rating: true } }),
      prisma.booking.groupBy({ by: ['serviceId'], _count: { serviceId: true }, orderBy: { _count: { serviceId: 'desc' } }, take: 10 }),
    ]);

    // Calculate monthly revenue using raw SQL for proper date truncation
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "paidAt") as month,
        SUM(amount) as total
      FROM "Payment"
      WHERE status = 'COMPLETED' AND "paidAt" IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;

    return successResponse(res, { 
      totalRevenue: totalRevenue._sum.amount || 0, 
      totalBookings, 
      avgRating: avgRating._avg.rating || 0, 
      topServices,
      monthlyRevenue,
    });
  } catch (error) { next(error); }
});

export default router;
