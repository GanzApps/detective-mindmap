import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^d3$': '<rootDir>/node_modules/.pnpm/d3@7.9.0/node_modules/d3/dist/d3.js',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.claude/worktrees/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.claude/worktrees/',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/.claude/worktrees/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(d3|d3-[^/]+)/)',
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        jsx: 'react-jsx',
        allowJs: true,
      },
    }],
  },
};

export default config;
