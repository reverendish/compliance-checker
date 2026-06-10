/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  // Jest ESM support — run with: NODE_OPTIONS=--experimental-vm-modules jest
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    '!jest.config.mjs',
  ],
};
