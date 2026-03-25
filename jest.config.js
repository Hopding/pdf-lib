/*eslint no-undef: "off"*/
module.exports = {
  // Base configuration
  preset: 'ts-jest',
  testEnvironment: 'node',

  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Test pattern matching
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],

  // Source directories
  roots: ['src', 'tests'],

  // Module resolution
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Supported file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage reporting
  coverageReporters: ['html','lcov'],
};
