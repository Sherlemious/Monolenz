export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@monolenz/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
