# Browser Tests for Bluvo SDK

## Overview

These tests run in **REAL browsers** (Chrome, Firefox, Safari) using Vitest Browser Mode to verify the OAuth window flow and cross-browser compatibility.

## Test Files

### `startWithdrawalFlow.browser.test.ts`
Comprehensive tests for the OAuth window flow:
- ✅ `window.open` is called with correct parameters
- ✅ OAuth window opens correctly
- ✅ State machine transitions (oauth:waiting → oauth:processing → oauth:completed)
- ✅ Momento cache message simulation
- ✅ Window close detection
- ✅ Error scenarios (popup blocked, window closed by user, OAuth failure)
- ✅ Complete flow from OAuth to wallet loading
- ✅ Context preservation through transitions

### `crossBrowser.browser.test.ts`
Cross-browser compatibility verification:
- ✅ Browser environment detection
- ✅ Chrome/Chromium-specific behavior
- ✅ Firefox-specific behavior
- ✅ Safari/Webkit-specific behavior
- ✅ Consistent behavior across all browsers
- ✅ Popup blocker handling
- ✅ Browser API availability
- ✅ Modern JavaScript feature support

## Running the Tests

### All Browsers (Headless)
```bash
cd packages/ts
pnpm vitest --config vitest.browser.config.ts
```

### Specific Browser
```bash
# Chrome/Chromium
pnpm vitest --config vitest.browser.config.ts --browser=chromium

# Firefox
pnpm vitest --config vitest.browser.config.ts --browser=firefox

# Safari/Webkit
pnpm vitest --config vitest.browser.config.ts --browser=webkit
```

### With UI (Development)
```bash
pnpm vitest --config vitest.browser.config.ts --ui
```

### Watch Mode
```bash
pnpm vitest --config vitest.browser.config.ts --watch
```

## Prerequisites

### Install Browsers
```bash
# Install Playwright browsers (recommended)
pnpm exec playwright install

# Or install specific browsers
pnpm exec playwright install chromium
pnpm exec playwright install firefox
pnpm exec playwright install webkit
```

### For Safari Testing (macOS only)
```bash
# Enable safaridriver (required for Safari testing)
sudo safaridriver --enable
```

## Test Configuration

The tests use `vitest.browser.config.ts` which configures:
- **Provider**: Playwright (better cross-browser support)
- **Headless**: True (required for parallel execution and CI)
- **Browsers**: Chromium (Chrome), Firefox, Webkit (Safari)
- **Isolation**: True (each test file runs in isolation)
- **Timeout**: 10000ms (longer timeout for browser operations)

## What Gets Tested

### 1. Window Opening
- `window.open` is called with correct URL
- URL contains exchange name and wallet ID
- Target is `_blank` or `popup`
- Popup dimensions are specified

### 2. State Machine Transitions
```
idle
  ↓ startWithdrawalFlow()
oauth:waiting
  ↓ OAUTH_WINDOW_OPENED
oauth:processing
  ↓ OAUTH_COMPLETED (from Momento)
oauth:completed
  ↓ LOAD_WALLET
wallet:loading
```

### 3. Error Scenarios
- Popup blocker (window.open returns null)
- User closes window (OAUTH_WINDOW_CLOSED_BY_USER)
- OAuth failure (OAUTH_FAILED)
- Network errors during wallet loading

### 4. Cross-Browser Consistency
- Same state transitions in all browsers
- Same context preservation
- Same error handling
- Consistent popup behavior

## Debugging

### View Test Output
```bash
# Run with verbose logging
pnpm vitest --config vitest.browser.config.ts --reporter=verbose

# Run specific test
pnpm vitest --config vitest.browser.config.ts -t "should open OAuth window"
```

### Browser Screenshots
Vitest Browser Mode can capture screenshots on failure (configure in vitest.browser.config.ts):
```typescript
browser: {
  screenshotFailures: true,
}
```

### Browser DevTools
When running with `--ui`, you can inspect the browser and use DevTools.

## Common Issues

### "Browser not installed"
```bash
# Install Playwright browsers
pnpm exec playwright install
```

### Safari not working
```bash
# Enable safaridriver (macOS only)
sudo safaridriver --enable
```

### Tests timing out
- Increase timeout in vitest.browser.config.ts
- Check if async operations are properly awaited
- Verify mock responses are resolving

### window.open not mocked
- Ensure `vi.stubGlobal('open', mockFn)` is in `beforeEach`
- Verify `vi.unstubAllGlobals()` is in `afterEach`
- Check mock is defined before test runs

## CI Integration

For CI environments, the tests run in headless mode automatically:

```yaml
# Example GitHub Actions
- name: Run Browser Tests
  run: pnpm vitest --config vitest.browser.config.ts --run
```

## Best Practices

1. **Always clean up mocks** in `afterEach` to prevent test pollution
2. **Use realistic mock data** that matches actual API responses
3. **Test error scenarios** in addition to happy paths
4. **Verify state transitions** explicitly with `expect(state.type).toBe(...)`
5. **Test all browsers** to catch browser-specific issues
6. **Keep tests focused** on browser-specific behavior
7. **Use descriptive test names** that explain what's being tested

## Maintenance

### Adding New Tests
1. Create test file with `.browser.test.ts` suffix
2. Include TypeScript references at the top
3. Follow the existing pattern for mocks and setup
4. Test across all browsers
5. Document what the test verifies

### Updating Browser Versions
```bash
# Update Playwright browsers
pnpm exec playwright install --force
```

### Checking Coverage
```bash
# Run with coverage
pnpm vitest --config vitest.browser.config.ts --coverage
```

## Resources

- [Vitest Browser Mode Docs](https://vitest.dev/guide/browser/)
- [Playwright Browsers](https://playwright.dev/docs/browsers)
- [Cross-Browser Testing Guide](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing)
