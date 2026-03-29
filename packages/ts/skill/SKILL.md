---
name: bluvo-sdk-ts
description: "Use when implementing cryptocurrency exchange withdrawal flows in TypeScript without React. Provides a state machine that orchestrates OAuth/QR-code wallet connection, balance loading, quote generation, withdrawal execution with 2FA/SMS/KYC challenges, and real-time WebSocket updates. Choose this over the React skill when building server-side integrations, non-React frontends, or custom UI frameworks."
license: MIT
compatibility: "TypeScript 4.7+. Node.js 18+ for server-side use. Browser for client-side OAuth/WebSocket flows."
metadata:
  version: "3.0.0"
---

# @bluvo/sdk-ts

## Mental Model

The Bluvo SDK uses a **state machine paradigm**: you send events and the machine transitions through states. You do not call REST APIs directly — the `BluvoFlowClient` orchestrates all API calls internally and emits state changes you subscribe to.

There are two client models: **`BluvoClient`** runs server-side (requires API key, never in browser) and provides direct REST access. **`BluvoWebClient`** runs in the browser (no API key, uses OAuth popups and WebSocket). **`BluvoFlowClient`** is the high-level orchestrator that wraps both — it accepts server-side callback functions and manages the complete withdrawal flow through a nested state machine.

The flow progresses through phases: **exchanges** → **oauth/qrcode** → **wallet** → **quote** → **withdraw**. Each phase has loading, ready, and error states. Invalid state transitions are silently ignored (return current state unchanged), not errors.

### State Diagram

```
idle ──→ exchanges:loading ──→ exchanges:ready ──→ oauth:waiting / qrcode:waiting
                │                                         │
          exchanges:error                          oauth:processing / qrcode:displaying
                                                          │
                                              oauth:completed ←─ qrcode:scanning
                                                          │
                                                   wallet:loading
                                                          │
                                                   wallet:ready
                                                          │
                                                  quote:requesting
                                                          │
                                                   quote:ready ←─ (auto-refresh)
                                                          │
                                                 withdraw:processing
                                                    │    │    │
                                          error2FA  │  errorSMS  errorKYC
                                          error2FAMultiStep │ errorBalance
                                                    │
                                    readyToConfirm  │  retrying
                                                    │
                                          withdraw:completed / fatal / blocked

                        CANCEL_FLOW → flow:cancelled (from ANY state)
```

## Initialization

### Server-side Client

```typescript
import { createClient, createSandboxClient, createDevClient } from '@bluvo/sdk-ts';

// Production
const client = createClient({ orgId: '...', projectId: '...', apiKey: '...' });

// Sandbox (test.api-bluvo.com)
const client = createSandboxClient({ orgId: '...', projectId: '...', apiKey: '...' });

// Local development (localhost:8787)
const client = createDevClient({ orgId: '...', projectId: '...', apiKey: '...' });

// Custom domain
const client = createClient({
  orgId: '...', projectId: '...', apiKey: '...',
  customDomain: 'api.mycompany.com'   // or { api: 'api.co', ws: 'ws.co' }
});
```

### Browser Flow Client

```typescript
import { BluvoFlowClient } from '@bluvo/sdk-ts';

const flowClient = new BluvoFlowClient({
  orgId: '...',
  projectId: '...',

  // All callbacks are server-side functions (e.g., Next.js server actions)
  listExchangesFn: serverListExchanges,
  fetchWithdrawableBalanceFn: serverFetchBalances,
  requestQuotationFn: serverRequestQuote,
  executeWithdrawalFn: serverExecuteWithdrawal,
  getWalletByIdFn: serverGetWallet,
  pingWalletByIdFn: serverPingWallet,

  // Optional
  onWalletConnectedFn: (walletId, exchange) => { /* persist */ },
  mkUUIDFn: () => crypto.randomUUID(),
  options: {
    sandbox: false,
    dev: false,
    maxRetryAttempts: 3,
    autoRefreshQuotation: true,  // default
    customDomain: undefined,
  },
  cache: {
    prefix: 'bluvo:',
    minRemainingLifetimeSec: 15,
    disabled: false,
  },
});
```

## State Reference

### idle
Starting state. No flow active. Transitions to `exchanges:loading` or directly to `oauth:waiting`/`qrcode:waiting`.

### exchanges:loading / exchanges:ready / exchanges:error
Exchange list loading phase. `exchanges:ready` makes the `exchanges` array available in context.

### oauth:waiting / oauth:processing / oauth:completed / oauth:error / oauth:fatal / oauth:window_closed_by_user
OAuth popup authentication phase. `oauth:error` is recoverable, `oauth:fatal` is not (e.g., `OAUTH_TOKEN_EXCHANGE_FAILED`).

### qrcode:waiting / qrcode:displaying / qrcode:scanning / qrcode:error / qrcode:timeout / qrcode:fatal
QR code authentication (for `binance-web`). Displays QR code, tracks scan status, handles expiration.

### wallet:loading / wallet:ready / wallet:error
Wallet balance loading phase. `wallet:ready` makes `walletBalances` available in context.

### quote:requesting / quote:ready / quote:expired / quote:error
Quote phase. `quote:ready` makes `quote` available (id, amount, fee, expiresAt). Auto-refreshes by default.

### withdraw:idle / withdraw:processing
Withdrawal execution phase. `withdraw:processing` means the withdrawal is being executed.

### withdraw:error2FA / withdraw:error2FAMultiStep / withdraw:errorSMS / withdraw:errorKYC / withdraw:errorBalance
Challenge states. User must provide 2FA code, SMS code, KYC verification, or has insufficient balance.

### withdraw:retrying / withdraw:readyToConfirm
`retrying` — withdrawal failed but can be retried. `readyToConfirm` — all multi-step 2FA verified, waiting for final confirmation.

### withdraw:completed / withdraw:blocked / withdraw:fatal
Terminal states. `completed` has `withdrawal.transactionId`. `fatal` has `error`. `blocked` has `error` with reason.

### flow:cancelled
Flow was cancelled via `cancel()`. Disposes withdrawal machine.

## Driving Transitions

### loadExchanges(status?)
**Valid from**: any (creates machine if needed). **Result**: `exchanges:loading` → `exchanges:ready` or `exchanges:error`.

### startWithdrawalFlow({ exchange, walletId, popupOptions? })
**Auto-detects** QR code exchanges (`binance-web`). Checks if wallet exists first — if yes, delegates to `resumeWithdrawalFlow`. Opens OAuth popup or starts QR code flow.

### resumeWithdrawalFlow({ exchange, walletId })
Skips OAuth. Transitions through OAuth states synthetically, then loads wallet balance.

### silentResumeWithdrawalFlow({ walletId, exchange, preloadedBalances?, callbacks... })
Jumps directly to `wallet:ready` with optional preloaded balance data. Used after wallet preview.

### requestQuote({ asset, amount, destinationAddress, network?, tag?, includeFee? })
**Valid from**: `wallet:ready`, `quote:ready` (refresh), `quote:expired`. Requests a quote from the backend. Sets up auto-refresh timer if `autoRefreshQuotation` is true.

### executeWithdrawal(quoteId)
**Valid from**: `quote:ready`. Starts withdrawal, subscribes to WebSocket for progress and completion.

### submit2FA(code)
**Valid from**: `withdraw:error2FA`. Re-executes withdrawal with TOTP code.

### submit2FAMultiStep(stepType, code)
**Valid from**: `withdraw:error2FAMultiStep`. Submits code for one step ('GOOGLE', 'EMAIL', or 'SMS'). Re-invokes withdrawal with all collected codes.

### pollFaceVerification()
**Valid from**: `withdraw:error2FAMultiStep`. Transitions to processing to check FACE step completion.

### confirmWithdrawal()
**Valid from**: `withdraw:readyToConfirm`. Sends final confirmation after all 2FA steps verified.

### retryWithdrawal()
**Valid from**: `withdraw:retrying`. Re-executes withdrawal with new idempotency key.

### refreshQRCode()
**Valid from**: `qrcode:error` or `qrcode:timeout`. Generates a new QR code.

### subscribe(listener), getState(), cancel(), dispose()
Standard machine operations. `cancel()` transitions to `flow:cancelled`. `dispose()` cleans up timers and subscriptions.

## Error Handling

### Error Codes

The `ERROR_CODES` constant contains 40+ error codes grouped by category:

- **Generic**: `GENERIC_NOT_FOUND`, `GENERIC_UNAUTHORIZED`, `GENERIC_INTERNAL_SERVER_ERROR`, etc.
- **Wallet**: `WALLET_NOT_FOUND`, `WALLET_INVALID_CREDENTIALS`
- **Quote**: `QUOTE_NOT_FOUND`, `QUOTE_EXPIRED`
- **Withdrawal Balance**: `WITHDRAWAL_INSUFFICIENT_BALANCE`, `WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE`
- **Withdrawal Address**: `WITHDRAWAL_INVALID_ADDRESS`, `WITHDRAWAL_NETWORK_NOT_SUPPORTED`
- **Withdrawal Amount**: `WITHDRAWAL_AMOUNT_BELOW_MINIMUM`, `WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM`
- **Withdrawal 2FA**: `WITHDRAWAL_2FA_REQUIRED_TOTP`, `WITHDRAWAL_2FA_REQUIRED_SMS`, `WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS`, `WITHDRAWAL_2FA_INVALID`, etc.
- **OAuth**: `OAUTH_AUTHORIZATION_FAILED`, `OAUTH_TOKEN_EXCHANGE_FAILED` (FATAL)
- **Special**: `WITHDRAWAL_DRY_RUN_COMPLETE` — NOT an error, it's a success signal

### Error Extraction

```typescript
import { extractErrorCode, extractErrorTypeInfo, extractErrorResult, ERROR_CODES } from '@bluvo/sdk-ts';

const code = extractErrorCode(error);        // ErrorCode | null
const info = extractErrorTypeInfo(error);     // { knownCode, rawType }
const result = extractErrorResult(error);     // unknown (multi-step 2FA data)

if (code === ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP) {
  // Show 2FA input
}
```

### Error States

- `oauth:error` — Recoverable OAuth error (user can retry)
- `oauth:fatal` — Non-recoverable OAuth error (wallet connection broken)
- `withdraw:error2FA` — 2FA required, user must submit code
- `withdraw:error2FAMultiStep` — Multi-step 2FA required
- `withdraw:fatal` — Non-recoverable withdrawal error
- `withdraw:errorBalance` — Insufficient balance

## Gotchas

1. **`toPlain()` needed for Next.js server actions.** The SDK returns class instances that Next.js cannot serialize. Wrap every server action return with `JSON.parse(JSON.stringify(result))`.

2. **QR code flow is auto-detected for `binance-web`.** When you call `startWithdrawalFlow({ exchange: 'binance-web', ... })`, it automatically routes to the QR code flow instead of opening an OAuth popup. The constant `QR_CODE_EXCHANGES = ['binance-web']` controls this.

3. **`autoRefreshQuotation` defaults to `true`.** Quotes auto-refresh when they expire. If you want manual control (showing an "expired" UI), set `autoRefreshQuotation: false` in options.

4. **Invalid state transitions are no-ops.** Sending an action in the wrong state returns the current state unchanged — no error is thrown. Check `getState().type` if you need to verify the transition happened.

5. **`multiStep2FA.mfa.verified` is the PRIMARY source of truth** for step verification status, not `step.status`. The `mfa.verified` object is updated by the backend and reflects the actual verification state.

6. **`WITHDRAWAL_DRY_RUN_COMPLETE` is NOT a real error.** It's a success signal indicating all multi-step 2FA steps are verified and the withdrawal is ready to be confirmed. The SDK handles it by transitioning to `withdraw:readyToConfirm`.

7. **OAuth window close detection uses 500ms polling interval.** There's a slight delay between the user closing the popup and the `oauth:window_closed_by_user` state transition.

8. **Cache has 15-second safety threshold.** QR code cache entries with less than 15 seconds remaining are treated as expired and ignored. Configurable via `cache.minRemainingLifetimeSec`.

9. **`startWithdrawalFlow` checks if wallet exists first.** If `getWalletByIdFn` returns a wallet, it automatically calls `resumeWithdrawalFlow` instead of opening OAuth.

## References

- Read `references/api-client.md` if you need to understand the underlying REST calls, error codes, or authentication configuration.
- Read `references/types.md` if you need the complete TypeScript type definitions for machine context, events, or state values.
- Read `references/state-transitions.md` if you need detailed guard conditions, async behavior, or sequence diagrams for specific flows.
