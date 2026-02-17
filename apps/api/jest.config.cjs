/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^@monolenz/types/api$': '<rootDir>/../../packages/types/src/api/index.ts',
    '^@monolenz/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
  },
};
