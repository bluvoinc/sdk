# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Bluvo SDK is a TypeScript-based monorepo providing SDKs for cryptocurrency exchange integrations with OAuth2 authentication and withdrawal flows. The project is split into two packages:

- **@bluvo/sdk-ts**: Core framework-agnostic SDK for both browser (`BluvoWebClient`) and server (`BluvoClient`) environments
- **@bluvo/react**: React hooks wrapper around the core SDK for easy integration in React applications

## Monorepo Structure

```
packages/
├── ts/                  # @bluvo/sdk-ts - Core SDK
│   ├── src/            # Hand-written source code
│   │   ├── BluvoClient.ts       # Server-side client (requires API key)
│   │   ├── BluvoWebClient.ts    # Browser client (OAuth2 flows)
│   │   ├── WebSocketClient.ts   # Real-time messaging via Momento
│   │   └── machines/            # State machine implementation
│   │       ├── BluvoFlowClient.ts      # High-level flow orchestration
│   │       ├── flowMachine.ts          # Parent state machine
│   │       └── withdrawalMachine.ts    # Nested withdrawal state machine
│   ├── generated/      # Auto-generated from OpenAPI spec
│   └── index.ts        # Main entry point with factory functions
│
├── react/              # @bluvo/react - React hooks
│   ├── src/
│   │   ├── useBluvoFlow.ts       # Main hook for complete flow
│   │   ├── useFlowMachine.ts     # Lower-level flow machine hook
│   │   └── useWithdrawMachine.ts # Withdrawal machine hook
│   └── tests/
│
└── test-open-window/   # Internal test app (Next.js)
```

## Common Commands

### Build & Development
```bash
# Install dependencies
pnpm i

# Build all packages
pnpm build

# Build specific package
pnpm -F @bluvo/sdk-ts build
pnpm -F @bluvo/react build

# Watch mode for development
cd packages/ts && pnpm dev     # TypeScript package
cd packages/react && pnpm dev  # React package

# Run tests
pnpm -F @bluvo/sdk-ts test
pnpm -F @bluvo/react test

# Type checking
pnpm check-types

# Linting
pnpm lint

# Format code
pnpm format
```

### SDK Regeneration from OpenAPI

The TypeScript SDK's generated code (`packages/ts/generated/`) is auto-generated from the Bluvo API's OpenAPI spec:

```bash
# Complete sync: generate, cleanup, increment version
pnpm complete-sync

# Or run steps individually:
pnpm generate-sdk
pnpm sync-sdk-from-openapi          # Download & generate from OpenAPI
pnpm sync-sdk-from-openapi-cleanup  # Remove unwanted imports, fix types
pnpm sync-sdk-from-openapi-inc-version  # Bump patch version
```

**Important**: After regenerating, always build both packages in order:
```bash
pnpm -F @bluvo/sdk-ts build && pnpm -F @bluvo/react build
```

### Working with Tests

```bash
# Run all tests in a package
cd packages/ts && pnpm test
cd packages/react && pnpm test

# Run tests in watch mode (add to package.json if needed)
cd packages/ts && pnpm vitest
```

### Publishing

Packages are published via GitHub Actions workflow (`.github/workflows/release.yml`):
- Triggers on push to `main` or manual dispatch
- Builds both packages sequentially
- Publishes to npm with public access

Manual publish (if needed):
```bash
pnpm -F @bluvo/sdk-ts publish --no-git-checks --access public
pnpm -F @bluvo/react publish --no-git-checks --access public
```

## Architecture

### Dual Client Model

**BluvoClient (Server-side)**:
- Requires `orgId`, `projectId`, and `apiKey`
- Full API access for privileged operations
- Used in backend services, never in browser
- Provides methods for wallet management, withdrawals, OAuth2 operations

**BluvoWebClient (Browser)**:
- Only requires `orgId` and `projectId`
- Safe for client-side use (no API keys)
- Handles OAuth2 flows via popup windows
- Uses WebSocket (Momento) for real-time updates

### State Machine System

The SDK uses a nested state machine architecture for managing withdrawal flows:

**Flow Machine** (`flowMachine.ts`):
- Parent machine orchestrating the entire flow
- States: `idle`, `oauth:*`, `wallet:*`, `quote:*`, `withdraw:*`, `flow:cancelled`
- Handles OAuth authentication, wallet loading, quote generation
- Delegates withdrawal execution to the nested withdrawal machine

**Withdrawal Machine** (`withdrawalMachine.ts`):
- Child machine managing withdrawal lifecycle
- States: `idle`, `processing`, `waitingFor2FA`, `waitingForSMS`, `waitingForKYC`, `retrying`, `completed`, `blocked`, `failed`
- Handles retries, 2FA/SMS/KYC challenges, error recovery

**BluvoFlowClient** (`BluvoFlowClient.ts`):
- High-level client that wraps both machines
- Integrates with Bluvo API endpoints via callback functions
- Provides `subscribe()` for state updates and methods like `startWithdrawalFlow()`, `submit2FA()`, etc.

See `packages/ts/FLOW_MACHINE_README.md` for detailed documentation on extending the state machines.

### Exchange-Specific Behavior

Most exchange differences are handled by the backend, but two client-side lists in `packages/ts/src/machines/BluvoFlowClient.ts` change how the flow machine behaves per exchange:

- **`QR_CODE_EXCHANGES = ['binance-web', 'bybit-web']`** — these exchanges authenticate via QR code instead of an OAuth popup. `startWithdrawalFlow()` auto-detects them and routes to the QR code flow.
- **`BATCH_2FA_VALIDATION_EXCHANGES = new Set(['kucoin'])`** — KuCoin's broker withdrawal API validates **all** 2FA factors in a single call; there is no incremental per-factor verification. Re-executing the withdrawal with a partial factor set (e.g. only the Google code when EMAIL + GOOGLE are both required with relation `AND`) makes KuCoin answer `200000` with no ids, which kills the challenge server-side (historically surfaced as a fatal `KuCoin withdrawal failed: unexpected response shape`).

**KuCoin multi-step 2FA (withdrawal step):** when the exchange is in `BATCH_2FA_VALIDATION_EXCHANGES` and `multiStep2FA.relation === 'AND'`, `submit2FAMultiStep(stepType, code)` does NOT re-execute the withdrawal per code. Instead it dispatches the `COLLECT_2FA_MULTI_STEP` action (see `flowStateHandlers.ts`), which stores the code in `multiStep2FA.collectedCodes` (`GOOGLE` → `twofa`, `EMAIL` → `emailCode`, `SMS` → `smsCode`), marks that step's `status` as `'success'` locally so the UI advances, and stays in `withdraw:error2FAMultiStep`. Only when every required code-based step has a collected code (steps already `mfa.verified` count as satisfied; FACE/ROAMING_FIDO are excluded — they verify via polling) does the client call `executeWithdrawalFn` exactly once with `bizNo` + all collected codes. With relation `'OR'`, or for incremental-verification exchanges (binance-web, bybit-web), each submitted code still triggers an immediate re-execution. Behavior is specified in `packages/ts/test/machines/BluvoFlowClient.submit2FAMultiStep.test.ts`.

When changing exchange-specific behavior, keep the published skill docs in sync: `packages/ts/skill/` (SKILL.md + references) and `packages/react/skill/` (SKILL.md + `references/multistep-2fa.md`).

### React Integration

The `@bluvo/react` package provides three hooks:

- **`useBluvoFlow()`**: Main hook exposing the entire flow with helper booleans (`isOAuthPending`, `requires2FA`, etc.)
- **`useFlowMachine()`**: Lower-level hook for direct flow machine interaction
- **`useWithdrawMachine()`**: Direct withdrawal machine interaction

React hooks depend on `@bluvo/sdk-ts` via workspace dependency (`workspace:*`), so the TypeScript package must be built first.

### Security Model

- **No API keys in browser**: React hooks accept callback functions that call secure server endpoints
- **Idempotency**: All critical operations use `idem` keys for safe retries
- **OAuth2 flow**: Browser opens popup, backend handles token exchange
- **WebSocket auth**: Uses read-only topic tokens (Momento) for real-time updates

## Package Dependencies

- `@bluvo/sdk-ts`:
  - Depends on `@gomomento/sdk-web` for WebSocket functionality
  - Generated code depends on `typescript` and OpenAPI runtime utilities

- `@bluvo/react`:
  - Depends on `@bluvo/sdk-ts` via `workspace:*`
  - Peer dependency on `react` (^16.8.0 || ^17.0.0 || ^18.0.0)

## Migration Notes

The project recently migrated React functionality to a separate package (see `REACT_PACKAGE_MIGRATION.md`). Key changes:

- React hooks moved from `@bluvo/sdk-ts/react` to `@bluvo/react`
- Core SDK (`@bluvo/sdk-ts`) is now framework-agnostic
- Proper monorepo setup with pnpm workspaces and Turbo

## Development Workflow

1. **Make changes** to source files in `packages/ts/src/` or `packages/react/src/`
2. **Build packages** in order: `pnpm -F @bluvo/sdk-ts build && pnpm -F @bluvo/react build`
3. **Run tests** to verify: `pnpm -F @bluvo/sdk-ts test && pnpm -F @bluvo/react test`
4. **Test in demo app** if needed: `cd packages/test-open-window && pnpm dev`
5. **Commit changes** and push to trigger CI/CD pipeline

When modifying generated code structure:
1. Update `packages/ts/generated/` files as needed
2. Ensure cleanup script handles new patterns
3. Rebuild and test thoroughly before committing

## Key Files

- `packages/ts/index.ts`: Main export file with factory functions (`createClient`, `createWebClient`, etc.)
- `packages/react/src/index.ts`: React hooks exports
- `turbo.json`: Turbo build pipeline configuration
- `pnpm-workspace.yaml`: Workspace package configuration
- `.github/workflows/release.yml`: CI/CD pipeline for publishing
