import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-min-32-characters-long',
  },
}));

describe('Auth Middleware', () => {
  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    role: 'CUSTOMER',
    isActive: true,
  };

  const mockRequest = () => ({
    headers: {},
    cookies: {},
  } as any);

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token in Authorization header', async () => {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        env.JWT_SECRET
      );

      const req = {
        ...mockRequest(),
        headers: { authorization: `Bearer ${token}` },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req, mockResponse(), mockNext);

      expect(req.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authenticate user with valid token in cookie', async () => {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        env.JWT_SECRET
      );

      const req = {
        ...mockRequest(),
        cookies: { accessToken: token },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req, mockResponse(), mockNext);

      expect(req.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext.mock.calls[0] as any[])[0];
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const req = {
        ...mockRequest(),
        headers: { authorization: 'Bearer invalid-token' },
      };

      await authenticate(req, mockResponse(), mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid token',
        statusCode: 401,
      }));
    });

    it('should reject request for deactivated user', async () => {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        env.JWT_SECRET
      );

      const req = {
        ...mockRequest(),
        headers: { authorization: `Bearer ${token}` },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await authenticate(req, mockResponse(), mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or deactivated user',
        statusCode: 401,
      }));
    });

    it('should reject request for non-existent user', async () => {
      const token = jwt.sign(
        { id: 'non-existent-id', email: 'ghost@example.com', role: 'CUSTOMER' },
        env.JWT_SECRET
      );

      const req = {
        ...mockRequest(),
        headers: { authorization: `Bearer ${token}` },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authenticate(req, mockResponse(), mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or deactivated user',
        statusCode: 401,
      }));
    });
  });

  describe('authorize', () => {
    it('should allow access for user with correct role', async () => {
      const req = { ...mockRequest(), user: { ...mockUser, role: 'ADMIN' } };
      const res = mockResponse();

      const authorizeMiddleware = authorize('ADMIN', 'MANAGER');
      authorizeMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user with incorrect role', async () => {
      const req = { ...mockRequest(), user: { ...mockUser, role: 'CUSTOMER' } };
      const res = mockResponse();

      const authorizeMiddleware = authorize('ADMIN', 'MANAGER');
      authorizeMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Insufficient permissions',
        statusCode: 403,
      }));
    });

    it('should deny access when user is not authenticated', async () => {
      const req = { ...mockRequest(), user: undefined };
      const res = mockResponse();

      const authorizeMiddleware = authorize('ADMIN');
      authorizeMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required',
        statusCode: 401,
      }));
    });
  });
});
