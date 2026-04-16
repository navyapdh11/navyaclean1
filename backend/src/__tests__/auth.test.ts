import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

describe('Auth Controller', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.customer.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.firstName).toBe(testUser.firstName);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.message).toBe('Registration successful');

      // Verify HTTP-only cookies are set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('accessToken'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...testUser,
        email: 'invalid-email',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...testUser,
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should require firstName and lastName', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: 'CUSTOMER',
        },
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
      expect(res.body.message).toBe('Login successful');

      // Verify HTTP-only cookies are set
      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c: string) => c.includes('accessToken'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'wrong@example.com',
        password: testUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPass123',
      });

      expect(res.status).toBe(401);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/v1/auth/login').send({
          email: testUser.email,
          password: 'WrongPass123',
        });
      }

      // 6th attempt should be locked
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(429);
      expect(res.body.error.message).toContain('locked');
    });

    it('should reject login for deactivated account', async () => {
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isActive: false },
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Login to get access token
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookies = res.headers['set-cookie'];
      accessToken = cookies.find((c: string) => c.includes('accessToken')).split(';')[0].split('=')[1];
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify cookies are cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookies = res.headers['set-cookie'];
      accessToken = cookies.find((c: string) => c.includes('accessToken')).split(';')[0].split('=')[1];
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('should reject profile access without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');

      expect(res.status).toBe(401);
    });

    it('should reject profile access with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Cookie', 'accessToken=invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        },
      });
    });

    it('should send reset link for existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not reveal if email exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If the email exists');
    });
  });
});
