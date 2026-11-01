import type { Config } from 'jest';

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/cypress/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  collectCoverageFrom: ['lib/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
    },
    './lib/engines/': {
      lines: 95,
      statements: 95,
      functions: 95,
    },
    './lib/': {
      lines: 80,
      statements: 80,
      functions: 80,
    },
  },
};

export default config;
