// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external services before tests
jest.mock('./services/emailService', () => ({
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  },
}));

jest.mock('./config/redis', () => ({
  redisClient: {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    isReady: true,
  },
}));

// Global test teardown
afterAll(async () => {
  // Clean up any remaining mocks
  jest.clearAllMocks();
});
