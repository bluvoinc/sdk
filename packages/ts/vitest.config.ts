import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude browser-specific tests from regular test runs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.browser.test.ts',
    ],

    // Include all other test files
    include: ['test/**/*.test.ts'],

    // Globals for easier testing
    globals: true,

    // Standard timeout for unit tests
    testTimeout: 5000,
  },
});
