---
name: bluvo
description: |
  Crypto exchange connectivity API for securely connecting user wallets to exchanges
  (Binance, Kraken, Coinbase), executing withdrawals, and managing credentials.
  Use when building exchange integrations, withdrawal UIs with 2FA/SMS/KYC,
  or multi-tenant crypto applications. SDKs: TypeScript state machine and React hooks.
license: MIT
compatibility: "TypeScript 4.7+. React 16.8+ (optional). Next.js 13+ App Router (optional). Node.js 18+ for server-side."
metadata:
  mintlify-proj: bluvo
  author: Bluvo Inc
  version: "3.0.0"
  docs: "https://docs.bluvo.dev"
  sdk-repo: "https://github.com/bluvoinc/sdk"
---

# Bluvo Skill Reference

## Product Overview

Bluvo is a crypto exchange connectivity API that securely manages exchange API credentials and enables wallet connections without exposing raw keys. It is **not** a REST wrapper — a state machine orchestrates the entire flow from OAuth authentication through wallet loading, quote generation, withdrawal execution, and 2FA challenge handling.

Security: AES-256-CBC encryption, tenant-specific encryption keys, dedicated database per organization.

| Resource | Location |
|----------|----------|
| REST API (OpenAPI) | `https://api-bluvo.com/api/v0/openapi` |
| TypeScript SDK | `@bluvo/sdk-ts` on npm |
| React SDK | `@bluvo/react` on npm |
| Portal (API keys) | `https://portal.bluvo.dev` |
| Documentation | `https://docs.bluvo.dev` |
| GitHub (SDK) | `https://github.com/bluvoinc/sdk` |

## Programming Model

### Three Client Tiers

| Client | Side | API Key? | Purpose |
|--------|------|----------|---------|
| `BluvoClient` | Server | Yes | Direct REST access — wallets, withdrawals, OAuth operations |
| `BluvoWebClient` | Browser | No | OAuth popups, WebSocket real-time updates |
| `BluvoFlowClient` | Browser | No (uses server callbacks) | State machine orchestrator for the complete withdrawal flow |

The SDK uses a **state machine paradigm**: you send events and the machine transitions through states. You do not call REST APIs directly — the `BluvoFlowClient` orchestrates all API calls internally and emits state changes you subscribe to.

The React SDK (`@bluvo/react`) wraps the state machine into hooks — `useBluvoFlow` is the primary hook for most use cases. No context providers needed.

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

## What You Can Build

- Exchange wallet connection flows (OAuth popup or QR code for Binance Web)
- Withdrawal UIs with real-time quote refresh and fee display
- Multi-step 2FA verification (TOTP, Email, SMS, Face recognition)
- Wallet dashboards with balance previews
- Server-side credential management and bulk wallet operations
- Multi-tenant SaaS with isolated crypto operations per customer

## Choose Your Integration Path

| Approach | Effort | Best For | Trade-offs |
|----------|--------|----------|-----------|
| **REST API** | 3-4 weeks | Full control, custom flows | Implement entire flow yourself |
| **Server SDK** | 3 weeks | Language-specific integration | Still need to build flow logic |
| **State Machine SDK + Server SDK** | 5 days | Abstracted flow with custom UI | Build only the widget UI |
| **React State Machine (`@bluvo/react`)** | 24 hours | React apps with minimal code | Limited to React framework |
| **Vanilla JS Widget** | 24 hours | Quick embeddable UI | Less customization |
| **Framework Widgets** | 24 hours | Pre-built UI for React/Vue/Angular | Least customization |

**Decision tree:**
- React or Next.js? → `@bluvo/react` (~24 hours)
- Custom UI framework? → `BluvoFlowClient` from `@bluvo/sdk-ts` (~5 days)
- Server-only / backend? → `BluvoClient` from `@bluvo/sdk-ts`
- Pre-built widget? → `@bluvo/widget-react`, `@bluvo/widget-vanjs`, `@bluvo/widget-svelte`

```bash
# React + Next.js
pnpm add @bluvo/react

# TypeScript only
pnpm add @bluvo/sdk-ts
```

## Quickstart — React + Next.js

### Server Actions

```typescript
// app/actions/flowActions.ts
'use server'

import { createClient, createSandboxClient, createDevClient } from "@bluvo/sdk-ts";

function loadBluvoClient() {
    const env = process.env.NEXT_PUBLIC_BLUVO_ENV;
    if (env === 'production') {
        return createClient({
            orgId: process.env.BLUVO_ORG_ID!,
            projectId: process.env.BLUVO_PROJECT_ID!,
            apiKey: process.env.BLUVO_API_KEY!,
        });
    } else if (env === 'staging') {
        return createSandboxClient({
            orgId: process.env.BLUVO_ORG_ID!,
            projectId: process.env.BLUVO_PROJECT_ID!,
            apiKey: process.env.BLUVO_API_KEY!,
        });
    } else {
        return createDevClient({
            orgId: process.env.BLUVO_ORG_ID!,
            projectId: process.env.BLUVO_PROJECT_ID!,
            apiKey: process.env.BLUVO_API_KEY!,
        });
    }
}

// CRITICAL: toPlain() required for Next.js server action serialization
function toPlain<T extends object>(o: T): T {
    return JSON.parse(JSON.stringify(o)) as T;
}

export async function listExchanges(status?: string) {
    return toPlain(await loadBluvoClient().oauth2.listExchanges(status as any));
}

export async function fetchWithdrawableBalances(walletId: string) {
    return toPlain(await loadBluvoClient().wallet.withdrawals.getWithdrawableBalance(walletId));
}

export async function executeWithdrawal(
    walletId: string, idem: string, quoteId: string,
    params?: { twofa?: string | null; emailCode?: string | null; smsCode?: string | null;
               bizNo?: string | null; tag?: string | null; params?: { dryRun?: boolean } | null; }
) {
    return toPlain(await loadBluvoClient().wallet.withdrawals.executeWithdrawal(walletId, idem, quoteId, params ?? {}));
}
```

> For the complete server actions file (including `requestQuotation`, `getWalletById`, `pingWalletById`), load the `nextjs-patterns.md` sub-skill referenced in the SDK Skill Files section below.

### Page Component

```typescript
// app/home/page.tsx
"use client";  // REQUIRED — hooks are browser-only

import { useBluvoFlow } from "@bluvo/react";
import {
    fetchWithdrawableBalances, listExchanges, executeWithdrawal,
    requestQuotation, getWalletById, pingWalletById
} from '../actions/flowActions';

export default function Home() {
    const flow = useBluvoFlow({
        orgId: process.env.NEXT_PUBLIC_BLUVO_ORG_ID!,
        projectId: process.env.NEXT_PUBLIC_BLUVO_PROJECT_ID!,
        listExchangesFn: listExchanges,
        fetchWithdrawableBalanceFn: fetchWithdrawableBalances,
        requestQuotationFn: requestQuotation,
        executeWithdrawalFn: executeWithdrawal,
        getWalletByIdFn: getWalletById,
        pingWalletByIdFn: pingWalletById,
        options: {
            sandbox: process.env.NEXT_PUBLIC_BLUVO_ENV === 'staging',
            dev: process.env.NEXT_PUBLIC_BLUVO_ENV === 'development',
        },
    });

    // State booleans: flow.isOAuthPending, flow.isWalletReady, flow.isQuoteReady, etc.
    // Actions: flow.startWithdrawalFlow(), flow.requestQuote(), flow.executeWithdrawal()
    // Challenges: flow.requires2FA, flow.requires2FAMultiStep, flow.requiresSMS
    // Terminal: flow.isWithdrawalComplete, flow.isFlowCancelled, flow.hasFatalError
}
```

## Required Setup

### Environment Variables

| Variable | Side | Required | Description |
|----------|------|----------|-------------|
| `BLUVO_ORG_ID` | Server | Yes | Organization ID for server actions |
| `BLUVO_PROJECT_ID` | Server | Yes | Project ID for server actions |
| `BLUVO_API_KEY` | Server | Yes | API key (NEVER expose to client) |
| `NEXT_PUBLIC_BLUVO_ORG_ID` | Client | Yes | Org ID for hooks |
| `NEXT_PUBLIC_BLUVO_PROJECT_ID` | Client | Yes | Project ID for hooks |
| `NEXT_PUBLIC_BLUVO_ENV` | Client | No | `production` / `staging` / `development` |

### Authentication

Obtain `orgId`, `projectId`, and `apiKey` from the [Bluvo Portal](https://portal.bluvo.dev) API Keys section.

| Scope | Purpose |
|-------|---------|
| `read` | View wallets, balances, and account info |
| `quote` | Generate withdrawal quotes |
| `withdrawal` | Execute withdrawals |
| `delete` | Remove connected wallets |

API key scopes must match the operations your server actions perform.

## Constraints

- **Supported exchanges**: Binance, Kraken, Coinbase, and others — verify current list via API or contact help@bluvo.co
- **React hooks are browser-only** — no SSR support. They use `useState`, `useEffect`, WebSocket, and `localStorage`.
- **`useBluvoFlow` captures options at mount** — the client is created in a `useState` initializer. Changing options after mount has no effect; remount the component to reinitialize.
- **API key scopes must match the operation** — e.g., `withdrawal` scope required for `executeWithdrawal`
- **Withdrawal quotes expire** — always get a fresh quote before executing. `autoRefreshQuotation` defaults to `true`.

## Common Workflows

### 1. OAuth → Withdrawal (happy path)

`idle → exchanges:ready → oauth:completed → wallet:ready → quote:ready → withdraw:completed`

Call `listExchanges()` → user selects exchange → `startWithdrawalFlow({ exchange, walletId })` → OAuth popup → wallet loads → `requestQuote({...})` → `executeWithdrawal(quoteId)` → done.

### 2. QR Code (binance-web)

Auto-detected by `startWithdrawalFlow()` when `exchange === 'binance-web'`. No manual routing needed.

`qrcode:waiting → qrcode:displaying → qrcode:scanning → oauth:completed → wallet:ready → ...`

Display `flow.qrCodeUrl` as a QR image. Monitor `flow.isQRCodeScanning` and `flow.isOAuthComplete`.

### 3. Wallet Resume

Skip OAuth if wallet already connected:
- `resumeWithdrawalFlow({ exchange, walletId })` — skips OAuth, loads wallet balance
- `silentResumeWithdrawalFlow({ walletId, exchange, preloadedBalances? })` — jumps directly to `wallet:ready`

`startWithdrawalFlow` automatically detects existing wallets via `getWalletByIdFn` and routes to resume.

### 4. 2FA Handling

**Single-step**: `flow.requires2FA` → `flow.submit2FA(code)` → `withdraw:completed`

**Multi-step** (e.g., Binance GOOGLE + EMAIL + FACE + SMS):
1. `flow.requires2FAMultiStep` — check `flow.multiStep2FASteps` for required steps
2. `flow.submit2FAMultiStep('GOOGLE', code)` — submit each step
3. `flow.pollFaceVerification()` — for FACE steps
4. When `flow.isReadyToConfirm` → `flow.confirmWithdrawal()` → `withdraw:completed`

Use `flow.mfaVerified` (not step.status) as the primary source of truth for verification state.

## When Things Go Wrong

1. **`toPlain()` required for every Next.js server action return** — without it: `"Classes or null prototypes are not supported"` serialization error.
2. **Invalid state transitions are silent no-ops** — check `getState().type` to verify a transition happened.
3. **`WITHDRAWAL_DRY_RUN_COMPLETE` is a success signal, not an error** — it means all multi-step 2FA steps are verified. The SDK transitions to `withdraw:readyToConfirm`.
4. **`mfa.verified` is primary truth for multi-step 2FA** — not `step.status`. The backend updates `mfa.verified`.
5. **`"use client"` required on all components using hooks** — Next.js App Router requirement.
6. **QR code flow auto-detected for `binance-web`** — don't route manually; `startWithdrawalFlow` handles it.
7. **`autoRefreshQuotation` defaults to `true`** — set `false` if you want a manual "expired" UI with `flow.isQuoteExpired`.
8. **Never log API keys** — Bluvo never logs key material; ensure your code doesn't either.
9. **OAuth window close detection has ~500ms polling delay** — slight lag between popup close and `oauth:window_closed_by_user`.

## SDK Skill Files — Conditional Loading Triggers

The SDK has detailed skill files for deep implementation guidance. Load these on demand based on what you're building.

### @bluvo/react (React Hooks)

> **Load when**: Building React or Next.js withdrawal UIs.

**Main skill**: `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/SKILL.md`

| Reference | Load when... | URL |
|-----------|-------------|-----|
| `hooks-complete.md` | Need full `useBluvoFlow` return signature (~80+ fields) | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/references/hooks-complete.md` |
| `nextjs-patterns.md` | Building Next.js App Router with server actions | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/references/nextjs-patterns.md` |
| `components.md` | Looking for exported React components | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/references/components.md` |
| `qrcode-binance-web.md` | Implementing QR code auth for binance-web | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/references/qrcode-binance-web.md` |
| `multistep-2fa.md` | Handling multi-step 2FA (Binance GOOGLE+EMAIL+FACE+SMS) | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/react/skill/references/multistep-2fa.md` |

### @bluvo/sdk-ts (Core TypeScript)

> **Load when**: Building non-React frontends, server-side integrations, or need state machine internals.

**Main skill**: `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/ts/skill/SKILL.md`

| Reference | Load when... | URL |
|-----------|-------------|-----|
| `api-client.md` | Need REST call details, auth headers, factory functions, error codes | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/ts/skill/references/api-client.md` |
| `types.md` | Need TypeScript type definitions for states, context, events | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/ts/skill/references/types.md` |
| `state-transitions.md` | Need full transition map, guard conditions, sequence diagrams | `https://raw.githubusercontent.com/bluvoinc/sdk/main/packages/ts/skill/references/state-transitions.md` |

## Documentation Index

| I need to know... | Go to |
|-|-|
| All API endpoints | `https://docs.bluvo.dev/api-reference` |
| How to get API keys | `https://docs.bluvo.dev/api-keys` |
| OAuth2 integration levels | `https://docs.bluvo.dev/learn/oauth2-integration` |
| Security architecture | `https://docs.bluvo.dev/learn/security` |
| Multi-tenancy setup | `https://docs.bluvo.dev/learn/multi-tenancy` |
| Supported exchanges | `https://docs.bluvo.dev/exchanges` |
| Full navigation for LLMs | `https://docs.bluvo.dev/llms.txt` |
| Code samples | `https://github.com/bluvoinc/awesome` |

## Verification Checklist

Before submitting work with Bluvo:

- [ ] `useBluvoFlow` or `BluvoFlowClient` initialized with all 6 callback functions
- [ ] Server actions wrapped with `toPlain()`
- [ ] Client components marked with `"use client"`
- [ ] Error/challenge states handled (`oauth:error`, `withdraw:error2FA`, `withdraw:fatal`, etc.)
- [ ] Terminal states handled (`withdraw:completed`, `flow:cancelled`, `withdraw:blocked`)
- [ ] API key has correct scopes for the operation
- [ ] Sensitive credentials never logged or exposed
