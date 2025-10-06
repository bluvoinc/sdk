# Browser Test Setup Guide

## Quick Start

```bash
# 1. Install dependencies (if not already installed)
cd packages/ts
pnpm install

# 2. Install Playwright browsers
pnpm exec playwright install

# 3. Run browser tests
pnpm test:browser
```

## Installation Steps

### 1. Install Vitest Browser Dependencies

The required dependencies should be added to `package.json`:

```json
{
  "devDependencies": {
    "@vitest/browser": "latest",
    "playwright": "latest",
    "vitest": "latest"
  }
}
```

Install them:
```bash
pnpm add -D @vitest/browser playwright
```

### 2. Install Playwright Browsers

Playwright needs to download browser binaries:

```bash
# Install all browsers (Chrome, Firefox, Safari)
pnpm exec playwright install

# Or install specific browsers
pnpm exec playwright install chromium
pnpm exec playwright install firefox
pnpm exec playwright install webkit
```

This downloads ~500MB of browser binaries to `~/.cache/ms-playwright/`.

### 3. Safari Setup (macOS only)

For Safari/Webkit testing on macOS:

```bash
sudo safaridriver --enable
```

## Verify Installation

```bash
# Check if Playwright browsers are installed
pnpm exec playwright --version

# List installed browsers
ls ~/.cache/ms-playwright/
```

You should see directories like:
- `chromium-1234`
- `firefox-1234`
- `webkit-1234`

## Running Tests

### All Browsers (Headless)
```bash
pnpm test:browser
```

### Specific Browser
```bash
# Chrome
pnpm test:browser:chromium

# Firefox
pnpm test:browser:firefox

# Safari
pnpm test:browser:webkit
```

### With UI (Development Mode)
```bash
pnpm test:browser:ui
```

### Watch Mode
```bash
pnpm test:browser -- --watch
```

## Troubleshooting

### Error: "Browser not found"

**Solution**: Install Playwright browsers
```bash
pnpm exec playwright install
```

### Error: "safaridriver not enabled" (macOS)

**Solution**: Enable Safari driver
```bash
sudo safaridriver --enable
```

### Error: "Cannot find module @vitest/browser"

**Solution**: Install the dependency
```bash
pnpm add -D @vitest/browser
```

### Tests Timeout

**Solution**: Increase timeout in `vitest.browser.config.ts`:
```typescript
test: {
  testTimeout: 30000, // Increase from 10000 to 30000
}
```

### Multiple Browser Instances Fail

**Solution**: Ensure headless mode is enabled in config:
```typescript
browser: {
  headless: true, // Required for running multiple browsers
}
```

## CI/CD Setup

### GitHub Actions

```yaml
name: Browser Tests

on: [push, pull_request]

jobs:
  browser-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run browser tests
        run: pnpm test:browser
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Run tests
CMD ["pnpm", "test:browser"]
```

## Development Workflow

### 1. Write a New Browser Test

```typescript
// test/browser/myFeature.browser.test.ts
/// <reference types="@vitest/browser/matchers" />

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('My Feature', () => {
  let mockWindow: Window | null;

  beforeEach(() => {
    mockWindow = {
      closed: false,
      close: vi.fn()
    } as unknown as Window;

    vi.stubGlobal('open', vi.fn(() => mockWindow));
  });

  it('should work in browser', () => {
    expect(window).toBeDefined();
  });
});
```

### 2. Run the Test

```bash
# Run in watch mode for development
pnpm test:browser -- --watch

# Or run with UI
pnpm test:browser:ui
```

### 3. Debug

```bash
# Run with verbose logging
pnpm test:browser -- --reporter=verbose

# Run specific test
pnpm test:browser -- -t "should work in browser"
```

## File Structure

```
packages/ts/
├── test/
│   └── browser/
│       ├── startWithdrawalFlow.browser.test.ts  # OAuth flow tests
│       ├── crossBrowser.browser.test.ts          # Cross-browser compatibility
│       ├── README.md                              # Test documentation
│       └── SETUP.md                               # This file
├── vitest.browser.config.ts                       # Browser test configuration
└── package.json                                   # Scripts and dependencies
```

## Best Practices

1. **Always use headless mode in CI** to run multiple browsers in parallel
2. **Clean up mocks** in `afterEach` to prevent test pollution
3. **Test in all browsers** to catch browser-specific issues
4. **Use realistic timeouts** (browser operations are slower than unit tests)
5. **Mock external dependencies** (API calls, Momento cache)
6. **Verify browser APIs** are available before using them
7. **Keep tests focused** on browser-specific behavior

## Resources

- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Playwright Documentation](https://playwright.dev/)
- [Browser Testing Best Practices](https://web.dev/articles/cross-browser-testing)

## Need Help?

- Check the [main README](./README.md) for test documentation
- Review existing tests for examples
- Run tests with `--reporter=verbose` for detailed output
- Check Vitest Browser Mode [GitHub issues](https://github.com/vitest-dev/vitest/issues?q=is%3Aissue+browser)
