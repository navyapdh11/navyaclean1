import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Services API', () => {
  let adminToken: string;
  let customerToken: string;

  const adminUser = {
    email: 'admin@test.com',
    password: 'AdminPass123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  };

  const customerUser = {
    email: 'customer@test.com',
    password: 'CustomerPass123',
    firstName: 'Customer',
    lastName: 'User',
  };

  beforeAll(async () => {
    // Clean up
    await prisma.service.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});

    // Create admin user
    const adminHash = await bcrypt.hash(adminUser.password, 12);
    await prisma.user.create({
      data: {
        email: adminUser.email,
        password: adminHash,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      },
    });

    // Create customer user
    const customerHash = await bcrypt.hash(customerUser.password, 12);
    await prisma.user.create({
      data: {
        email: customerUser.email,
        password: customerHash,
        firstName: customerUser.firstName,
        lastName: customerUser.lastName,
        role: 'CUSTOMER',
      },
    });

    // Login to get tokens
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    const adminCookies = adminRes.headers['set-cookie'];
    adminToken = adminCookies.find((c: string) => c.includes('accessToken')).split(';')[0].split('=')[1];

    const customerRes = await request(app).post('/api/v1/auth/login').send({
      email: customerUser.email,
      password: customerUser.password,
    });
    const customerCookies = customerRes.headers['set-cookie'];
    customerToken = customerCookies.find((c: string) => c.includes('accessToken')).split(';')[0].split('=')[1];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/services', () => {
    it('should return all services without authentication', async () => {
      const res = await request(app).get('/api/v1/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/services', () => {
    const newService = {
      name: 'Deep Cleaning Service',
      description: 'Thorough deep cleaning for your home',
      price: 199.99,
      duration: 240,
      type: 'DEEP_CLEAN',
    };

    it('should create service as admin', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(newService);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(newService.name);
    });

    it('should deny service creation for non-admin', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Cookie', `accessToken=${customerToken}`)
        .send(newService);

      expect(res.status).toBe(403);
    });

    it('should deny service creation without authentication', async () => {
      const res = await request(app).post('/api/v1/services').send(newService);

      expect(res.status).toBe(401);
    });
  });
});
