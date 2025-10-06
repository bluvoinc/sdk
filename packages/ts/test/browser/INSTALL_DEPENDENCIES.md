# Installing Browser Test Dependencies

## Required Dependencies

To run browser tests, you need:

1. **@vitest/browser** - Vitest browser mode support
2. **playwright** - Browser automation (provides Chrome, Firefox, Safari)

## Installation

### Option 1: Automatic (Recommended)

```bash
cd packages/ts

# Install both dependencies
pnpm add -D @vitest/browser playwright

# Install browser binaries
pnpm exec playwright install
```

### Option 2: Manual

```bash
cd packages/ts

# Install @vitest/browser
pnpm add -D @vitest/browser

# Install playwright
pnpm add -D playwright

# Install browser binaries
pnpm exec playwright install
```

## Verify Installation

```bash
# Check versions
pnpm exec playwright --version
pnpm vitest --version

# List installed browsers
ls ~/.cache/ms-playwright/

# Should see:
# chromium-1234/
# firefox-1234/
# webkit-1234/
```

## Quick Test

```bash
# Run all browser tests
pnpm test:browser

# Should output something like:
# ✓ test/browser/startWithdrawalFlow.browser.test.ts (chromium)
# ✓ test/browser/startWithdrawalFlow.browser.test.ts (firefox)
# ✓ test/browser/startWithdrawalFlow.browser.test.ts (webkit)
```

## Disk Space Requirements

- **Playwright browsers**: ~500MB
  - Chromium: ~180MB
  - Firefox: ~90MB
  - Webkit: ~60MB
- **Node modules**: ~50MB

Total: ~550MB

## Troubleshooting

### "Cannot find module '@vitest/browser'"

**Missing**: @vitest/browser package

**Solution**:
```bash
pnpm add -D @vitest/browser
```

### "Browser not found" or "Executable doesn't exist"

**Missing**: Playwright browser binaries

**Solution**:
```bash
pnpm exec playwright install
```

### "safaridriver not enabled" (macOS only)

**Missing**: Safari WebDriver permission

**Solution**:
```bash
sudo safaridriver --enable
```

### Tests fail with timeout

**Issue**: Browser operations taking too long

**Solution**: Increase timeout in `vitest.browser.config.ts`:
```typescript
test: {
  testTimeout: 30000, // Increase to 30 seconds
}
```

## Next Steps

After installation:

1. ✅ **Verify tests run**: `pnpm test:browser`
2. 📖 **Read the test docs**: See `test/browser/README.md`
3. 🔧 **Configure for CI**: See `test/browser/SETUP.md`
4. 🧪 **Write new tests**: Follow existing patterns in `test/browser/`

## CI/CD Setup

For CI environments, install browsers with system dependencies:

```bash
# GitHub Actions
pnpm exec playwright install --with-deps

# Docker
# Use official Playwright image
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
```

## Uninstalling

If you need to remove browser test dependencies:

```bash
# Remove packages
pnpm remove @vitest/browser playwright

# Remove browser binaries
rm -rf ~/.cache/ms-playwright/
```

## Resources

- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Playwright Installation](https://playwright.dev/docs/intro)
- [Supported Browsers](https://playwright.dev/docs/browsers)
