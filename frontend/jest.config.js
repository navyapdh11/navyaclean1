/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/link$': '<rootDir>/src/__tests__/__mocks__/next-link.tsx',
    '^next/image$': '<rootDir>/src/__tests__/__mocks__/next-image.tsx',
    '^next/navigation$': '<rootDir>/src/__tests__/__mocks__/next-navigation.ts',
    '^lucide-react$': '<rootDir>/src/__tests__/__mocks__/lucide-react.tsx',
  },
};
