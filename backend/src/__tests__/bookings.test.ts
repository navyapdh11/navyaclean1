import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Bookings API', () => {
  const testUser = {
    email: 'booking-test@example.com',
    password: 'TestPass123',
    firstName: 'Booking',
    lastName: 'Tester',
  };

  let accessToken: string;
  let userId: string;
  let serviceId: string;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'CUSTOMER',
      },
    });
    userId = user.id;

    await prisma.customer.create({
      data: { userId: user.id, address: '123 Test St', city: 'Sydney', state: 'NSW', zipCode: '2000' },
    });

    // Create test service
    const service = await prisma.service.create({
      data: {
        name: 'Test Cleaning',
        slug: 'test-cleaning',
        description: 'Test service',
        basePrice: 150,
        duration: 120,
        isActive: true,
        type: 'RESIDENTIAL',
      },
    });
    serviceId = service.id;

    // Login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const cookies = (loginRes.headers['set-cookie'] as unknown as string[]) | undefined;
    accessToken = cookies?.find((c: string) => c.includes('accessToken'))?.split(';')[0].split('=')[1] || '';
  });

  afterAll(async () => {
    await prisma.booking.deleteMany().catch(() => {});
    await prisma.customer.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.service.deleteMany().catch(() => {});
    await prisma.$disconnect();
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking successfully', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          serviceId,
          date: futureDate,
          address: '123 Test St, Sydney NSW 2000',
          notes: 'Test booking',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.totalPrice).toBe(150);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should reject booking with date in the past', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          serviceId,
          date: pastDate,
          address: '123 Test St, Sydney NSW 2000',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('past');
    });

    it('should reject booking with non-existent service', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          serviceId: '00000000-0000-0000-0000-000000000000',
          date: futureDate,
          address: '123 Test St',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject booking without authentication', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/bookings')
        .send({
          serviceId,
          date: futureDate,
          address: '123 Test St',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should get user bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const res = await request(app).get('/api/v1/bookings');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    let bookingId: string;

    beforeEach(async () => {
      const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const booking = await prisma.booking.create({
        data: {
          customerId: userId,
          serviceId,
          date: futureDate,
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
          address: '123 Test St',
          totalPrice: 150,
          status: 'PENDING',
        },
      });
      bookingId = booking.id;
    });

    it('should get booking by id', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', bookingId);
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/bookings/:id/cancel', () => {
    let bookingId: string;

    beforeEach(async () => {
      const futureDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
      const booking = await prisma.booking.create({
        data: {
          customerId: userId,
          serviceId,
          date: futureDate,
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
          address: '123 Test St',
          totalPrice: 150,
          status: 'CONFIRMED',
        },
      });
      bookingId = booking.id;
    });

    it('should cancel a booking', async () => {
      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should not cancel already cancelled booking', async () => {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });

      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(400);
    });
  });
});

// ===== ADMIN BOOKING TESTS =====

describe('Admin Bookings API', () => {
  const adminUser = {
    email: 'admin-booking@test.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'Booking',
    role: 'ADMIN' as const,
  };

  let adminToken: string;
  let bookingId: string;
  let serviceId: string;

  beforeAll(async () => {
    // Create admin
    await prisma.user.create({
      data: {
        email: adminUser.email,
        password: await bcrypt.hash(adminUser.password, 12),
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      },
    });

    // Login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    const cookies = (loginRes.headers['set-cookie'] as unknown as string[]) | undefined;
    adminToken = cookies?.find((c: string) => c.includes('accessToken'))?.split(';')[0].split('=')[1] || '';

    // Create service
    const service = await prisma.service.create({
      data: {
        name: 'Admin Test Cleaning',
        slug: 'admin-test-cleaning',
        description: 'Test',
        basePrice: 200,
        duration: 180,
        isActive: true,
        type: 'DEEP_CLEAN',
      },
    });
    serviceId = service.id;

    // Create customer + booking
    const customerUser = await prisma.user.create({
      data: {
        email: 'admin-booking-customer@test.com',
        password: await bcrypt.hash('TestPass123', 12),
        firstName: 'Customer',
        lastName: 'AdminTest',
        role: 'CUSTOMER',
      },
    });
    const customer = await prisma.customer.create({
      data: {
        userId: customerUser.id,
        address: '456 Admin St',
        city: 'Melbourne',
        state: 'VIC',
        zipCode: '3000',
      },
    });

    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId,
        date: futureDate,
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3 * 60 * 60 * 1000),
        address: '456 Admin St, Melbourne VIC 3000',
        totalPrice: 200,
        status: 'PENDING',
        notes: 'Admin test booking',
      },
    });
    bookingId = booking.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany().catch(() => {});
    await prisma.customer.deleteMany().catch(() => {});
    await prisma.staff.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.service.deleteMany().catch(() => {});
    await prisma.$disconnect();
  });

  describe('GET /api/v1/bookings/admin/:id', () => {
    it('should get booking details as admin', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/admin/${bookingId}`)
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', bookingId);
      expect(res.body.data).toHaveProperty('customer');
      expect(res.body.data).toHaveProperty('service');
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/admin/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/bookings/admin/:id', () => {
    it('should update booking status as admin', async () => {
      const res = await request(app)
        .put(`/api/v1/bookings/admin/${bookingId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('should update booking address', async () => {
      const res = await request(app)
        .put(`/api/v1/bookings/admin/${bookingId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ address: '789 Updated Ave, Melbourne VIC 3000' });

      expect(res.status).toBe(200);
      expect(res.body.data.address).toBe('789 Updated Ave, Melbourne VIC 3000');
    });
  });

  describe('DELETE /api/v1/bookings/admin/:id', () => {
    it('should delete a pending booking', async () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const customer = await prisma.customer.findFirst();
      const deleteBooking = await prisma.booking.create({
        data: {
          customerId: customer!.id,
          serviceId,
          date: futureDate,
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
          address: 'Delete Test St',
          totalPrice: 100,
          status: 'PENDING',
        },
      });

      const res = await request(app)
        .delete(`/api/v1/bookings/admin/${deleteBooking.id}`)
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await prisma.booking.findUnique({ where: { id: deleteBooking.id } });
      expect(deleted).toBeNull();
    });

    it('should not delete a completed booking', async () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const customer = await prisma.customer.findFirst();
      const completedBooking = await prisma.booking.create({
        data: {
          customerId: customer!.id,
          serviceId,
          date: futureDate,
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
          address: 'Completed Test St',
          totalPrice: 100,
          status: 'COMPLETED',
        },
      });

      const res = await request(app)
        .delete(`/api/v1/bookings/admin/${completedBooking.id}`)
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/bookings/admin/bulk-confirm', () => {
    it('should bulk confirm pending bookings', async () => {
      const customer = await prisma.customer.findFirst();
      const date = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      const b1 = await prisma.booking.create({
        data: { customerId: customer!.id, serviceId, date, startTime: date, endTime: new Date(date.getTime() + 60 * 60 * 1000), address: 'Bulk1 St', totalPrice: 50, status: 'PENDING' },
      });
      const b2 = await prisma.booking.create({
        data: { customerId: customer!.id, serviceId, date, startTime: date, endTime: new Date(date.getTime() + 60 * 60 * 1000), address: 'Bulk2 St', totalPrice: 50, status: 'PENDING' },
      });

      const res = await request(app)
        .post('/api/v1/bookings/admin/bulk-confirm')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ bookingIds: [b1.id, b2.id] });

      expect(res.status).toBe(200);
      expect(res.body.data.confirmed).toBe(2);
    });
  });

  describe('POST /api/v1/bookings/admin/bulk-cancel', () => {
    it('should bulk cancel pending bookings', async () => {
      const customer = await prisma.customer.findFirst();
      const date = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
      const b1 = await prisma.booking.create({
        data: { customerId: customer!.id, serviceId, date, startTime: date, endTime: new Date(date.getTime() + 60 * 60 * 1000), address: 'Cancel1 St', totalPrice: 50, status: 'PENDING' },
      });
      const b2 = await prisma.booking.create({
        data: { customerId: customer!.id, serviceId, date, startTime: date, endTime: new Date(date.getTime() + 60 * 60 * 1000), address: 'Cancel2 St', totalPrice: 50, status: 'CONFIRMED' },
      });

      const res = await request(app)
        .post('/api/v1/bookings/admin/bulk-cancel')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ bookingIds: [b1.id, b2.id] });

      expect(res.status).toBe(200);
      expect(res.body.data.cancelled).toBe(2);
    });
  });
});
