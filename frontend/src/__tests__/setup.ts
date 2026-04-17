import '@testing-library/jest-dom';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
  error: jest.fn(),
  success: jest.fn(),
  loading: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      response: { use: jest.fn(), eject: jest.fn() },
      request: { use: jest.fn(), eject: jest.fn() },
    },
    get: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    post: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    put: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    delete: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
  };
  return {
    __esModule: true,
    default: Object.assign(mockInstance, {
      create: () => mockInstance,
    }),
  };
});
