import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Browser mode configuration
    browser: {
      enabled: true,
      provider: 'playwright', // Using Playwright for better cross-browser support
      headless: true, // Required for CI and parallel execution

      // Test in multiple browsers
      instances: [
        { browser: 'chromium' }, // Chrome/Edge
        { browser: 'firefox' },
        { browser: 'webkit' }, // Safari
      ],

      // Ensure tests run in isolation
      isolate: true,
    },

    // Only include browser-specific tests
    include: ['test/browser/**/*.browser.test.ts'],

    // Globals for easier testing
    globals: true,

    // Longer timeout for browser operations
    testTimeout: 10000,
  },
});
