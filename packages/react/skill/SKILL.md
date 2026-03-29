---
name: bluvo-react
description: "Use when building cryptocurrency exchange withdrawal UIs in React or Next.js. Provides hooks (useBluvoFlow, useFlowMachine, useWithdrawMachine, useWalletPreviews) that wrap the @bluvo/sdk-ts state machine. No context providers needed — just call the hook. Works with Next.js App Router (requires 'use client'). Choose this over the TS skill when building React applications."
license: MIT
compatibility: "React 16.8+. Next.js 13+ App Router supported. Requires @bluvo/sdk-ts@3.0.0 peer dependency."
metadata:
  version: "3.0.0"
---

# @bluvo/react

## What This Package Does

Wraps `BluvoFlowClient` and `BluvoPreviewManager` from `@bluvo/sdk-ts` in React hooks. No providers or context needed — hooks manage their own state via direct machine subscription. Each hook creates its client instance in a `useState` initializer and subscribes to state changes internally.

## Setup

```bash
pnpm add @bluvo/react @bluvo/sdk-ts
```

No `<Provider>` component is needed. Just import and call the hook:

```typescript
"use client";  // Required in Next.js App Router

import { useBluvoFlow } from "@bluvo/react";
```

## Core Hooks

### useBluvoFlow(options)

The main hook for the complete withdrawal flow. Creates a `BluvoFlowClient` internally and exposes ~80+ return fields covering state, actions, and computed helpers.

```typescript
const flow = useBluvoFlow({
  orgId: process.env.NEXT_PUBLIC_BLUVO_ORG_ID!,
  projectId: process.env.NEXT_PUBLIC_BLUVO_PROJECT_ID!,
  listExchangesFn: serverListExchanges,
  fetchWithdrawableBalanceFn: serverFetchBalances,
  requestQuotationFn: serverRequestQuote,
  executeWithdrawalFn: serverExecuteWithdrawal,
  getWalletByIdFn: serverGetWallet,
  pingWalletByIdFn: serverPingWallet,
  options: { sandbox: false, autoRefreshQuotation: true },
});
```

**When to use**: Building a complete withdrawal UI. This is the primary hook for most use cases.

### useFlowMachine(machine)

Lower-level hook that subscribes to a `Machine<FlowState, FlowActionType>` and re-renders on state changes.

```typescript
const { state, send, isInState, hasError, error, context } = useFlowMachine(machine);
```

**When to use**: When you have a machine instance from `BluvoFlowClient` and want to manage it directly without `useBluvoFlow`'s action wrappers.

### useWithdrawMachine(machine)

Direct subscription to the nested withdrawal machine.

```typescript
const { state, send, requires2FA, requiresSMS, isCompleted, canRetry } = useWithdrawMachine(machine);
```

**When to use**: When you need fine-grained control over the withdrawal subprocess.

### useWalletPreviews(options)

Manages preview states for multiple wallets (dashboard view).

```typescript
const { previews, isLoading, loadPreviews, allReady } = useWalletPreviews({
  wallets: [{ id: 'wallet-1', exchange: 'coinbase' }],
  pingWalletByIdFn: serverPingWallet,
  fetchWithdrawableBalanceFn: serverFetchBalances,
  autoLoad: true,
});
```

**When to use**: Displaying a dashboard of connected wallets with balance previews before entering the withdrawal flow.

## Driving the Flow

Typical usage pattern:

```typescript
// 1. Load exchanges
useEffect(() => { flow.listExchanges('live'); }, []);

// 2. User selects exchange → start flow
await flow.startWithdrawalFlow({ exchange: 'coinbase', walletId: generateId() });

// 3. OAuth/QR code completes → wallet loads automatically

// 4. User fills form → request quote
await flow.requestQuote({
  asset: 'BTC', amount: '0.001',
  destinationAddress: 'bc1q...', network: 'bitcoin',
});

// 5. User confirms → execute withdrawal
await flow.executeWithdrawal(flow.quote!.id);

// 6. Handle challenges
if (flow.requires2FA) await flow.submit2FA(userCode);
if (flow.requires2FAMultiStep) await flow.submit2FAMultiStep('GOOGLE', userCode);
if (flow.isReadyToConfirm) await flow.confirmWithdrawal();

// 7. Done
if (flow.isWithdrawalComplete) showSuccess(flow.withdrawal);
```

## Loading and Error States

### Loading States
- `flow.isExchangesLoading` — Loading exchange list
- `flow.isWalletLoading` — Loading wallet balances
- `flow.isQuoteLoading` — Requesting quote
- `flow.isWithdrawing` — Withdrawal actively processing (excludes completed/fatal/error)
- `flow.isWithdrawProcessing` — Specifically in `withdraw:processing`

### Challenge States
- `flow.requires2FA` — TOTP 2FA code needed
- `flow.requires2FAMultiStep` — Multi-step 2FA needed (Binance Web)
- `flow.requiresSMS` — SMS code needed
- `flow.requiresKYC` — KYC verification needed
- `flow.isReadyToConfirm` — All 2FA steps verified, ready for final confirmation

### Error Detection
- `flow.hasFatalError` — Non-recoverable error
- `flow.canRetry` — Withdrawal failed but retryable
- `flow.hasInsufficientBalance` — Balance too low
- `flow.hasAmountError` — Quote/fatal error about amount
- `flow.hasAddressError` — Quote/fatal error about address
- `flow.hasNetworkError` — Quote/fatal error about network
- `flow.hasWalletNotFoundError` — Wallet not found
- `flow.hasInvalidCredentialsError` — Invalid wallet credentials

### Terminal States
- `flow.isWithdrawalComplete` — Success. Access `flow.withdrawal.transactionId`.
- `flow.isFlowCancelled` — User cancelled.
- `flow.isWithdrawBlocked` — Withdrawal blocked by exchange.

## Next.js Specifics

### `'use client'` required
Both `useBluvoFlow` and `useWalletPreviews` have `"use client"` directives. Any component using these hooks must also be a client component.

### Server Actions Pattern
Create a `'use server'` file with functions that instantiate `BluvoClient` and wrap returns with `toPlain()`:

```typescript
// actions/flowActions.ts
'use server'
import { createClient } from '@bluvo/sdk-ts';

function toPlain<T extends object>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function fetchBalances(walletId: string) {
  return toPlain(await createClient({...}).wallet.withdrawals.getWithdrawableBalance(walletId));
}
```

### Environment Variables
- **Server-only**: `BLUVO_ORG_ID`, `BLUVO_PROJECT_ID`, `BLUVO_API_KEY`
- **Client-visible**: `NEXT_PUBLIC_BLUVO_ORG_ID`, `NEXT_PUBLIC_BLUVO_PROJECT_ID`, `NEXT_PUBLIC_BLUVO_ENV`

### No SSR Support
Hooks are browser-only. They use `useState`, `useEffect`, WebSocket subscriptions, and `localStorage`. They will not produce meaningful output during server-side rendering.

## Gotchas

1. **No context provider needed.** Unlike most React state libraries, there is no `<BluvoProvider>`. Each `useBluvoFlow` call creates its own `BluvoFlowClient` instance internally.

2. **`useBluvoFlow` captures options at mount only.** The client is created in a `useState` initializer: `useState(() => new BluvoFlowClient(options))`. Changing options after mount has no effect. If you need to reinitialize, remount the component.

3. **All action methods are `useCallback`-wrapped.** `startWithdrawalFlow`, `requestQuote`, `executeWithdrawal`, etc. are stable references. Safe to pass as props without memoization.

4. **`exchanges` state has dual source.** `flow.exchanges` checks both machine context (`flow.context?.exchanges`) and local React state. This is for backward compatibility — both sources should agree after `listExchanges()` completes.

5. **`flow.isWithdrawing` excludes completed/fatal/error states.** It means "actively processing right now" — specifically `withdraw:processing`, `withdraw:retrying`, `withdraw:readyToConfirm`. It does NOT include `withdraw:error2FA`, `withdraw:completed`, etc.

6. **`mfaVerified` from context is the PRIMARY truth for multi-step 2FA.** When checking if a step is verified, prefer `flow.mfaVerified?.GOOGLE === true` over `step.status === 'success'`. The `mfa.verified` object is the authoritative source from the backend.

7. **`testWithdrawalComplete()` is TEST-ONLY.** It simulates withdrawal completion without a real transaction. Do not use in production.

8. **Re-renders on every machine state change.** The hook subscribes to the machine and calls `setState` on every transition. For complex UIs, extract smaller components that receive only the data they need as props.

9. **`cancel()` also closes the OAuth popup window.** The hook maintains a ref to the OAuth window cleanup function and calls it on cancel.

## References

- Read `references/hooks-complete.md` for the full signature of every exported hook including all ~80+ return fields from `useBluvoFlow`.
- Read `references/nextjs-patterns.md` for complete Next.js App Router integration patterns including server actions, environment variables, and the `toPlain()` workaround.
- Read `references/components.md` if you're looking for exported React components.
- Read `../ts/skill/SKILL.md` if you need to understand the underlying state machine or need TypeScript-only (non-React) patterns.
- Read `references/qrcode-binance-web.md` for QR code authentication flow implementation — state machine states, QRCodeStatus lifecycle, caching, component rendering patterns, and refresh handling for `binance-web` exchange.
- Read `references/multistep-2fa.md` for multi-step 2FA implementation — handling GOOGLE, EMAIL, FACE, SMS verification steps, mfa.verified as primary truth, FACE polling, dryRun pattern, and confirmation flow.
