# Next.js Integration Patterns

## Server Action File

Server actions must be in a `'use server'` file. They create a `BluvoClient` server-side and wrap responses with `toPlain()`.

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
        return createSandboxClient({ /* same params */ });
    } else {
        return createDevClient({ /* same params */ });
    }
}

// CRITICAL: toPlain() is required for Next.js server action serialization
// Classes and non-plain objects cannot be passed from Server to Client Components
function toPlain<T extends object>(o: T): T {
    return JSON.parse(JSON.stringify(o)) as T;
}

export async function fetchWithdrawableBalances(walletId: string) {
    return toPlain(await loadBluvoClient().wallet.withdrawals.getWithdrawableBalance(walletId));
}

export async function listExchanges(status?: string) {
    return toPlain(await loadBluvoClient().oauth2.listExchanges(status as any));
}

export async function requestQuotation(walletId: string, params: {
    asset: string; amount: string; address: string; network?: string; tag?: string; includeFee?: boolean;
}) {
    return toPlain(await loadBluvoClient().wallet.withdrawals.requestQuotation(walletId, params));
}

export async function executeWithdrawal(
    walletId: string, idem: string, quoteId: string,
    params?: { twofa?: string | null; emailCode?: string | null; smsCode?: string | null; bizNo?: string | null; tag?: string | null; params?: { dryRun?: boolean } | null; }
) {
    return toPlain(await loadBluvoClient().wallet.withdrawals.executeWithdrawal(walletId, idem, quoteId, params ?? {}));
}

export async function getWalletById(walletId: string) {
    return toPlain(await loadBluvoClient().wallet.get(walletId));
}

export async function pingWalletById(walletId: string) {
    return toPlain(await loadBluvoClient().wallet.ping(walletId));
}
```

## Page Component

```typescript
// app/home/page.tsx
"use client";  // REQUIRED — hooks are browser-only

import { useBluvoFlow } from "@bluvo/react";
import {
    fetchWithdrawableBalances, requestQuotation, executeWithdrawal,
    listExchanges, getWalletById, pingWalletById
} from '../actions/flowActions';

export default function Home() {
    const flow = useBluvoFlow({
        orgId: process.env.NEXT_PUBLIC_BLUVO_ORG_ID!,
        projectId: process.env.NEXT_PUBLIC_BLUVO_PROJECT_ID!,
        options: {
            autoRefreshQuotation: false,
            sandbox: process.env.NEXT_PUBLIC_BLUVO_ENV === 'staging',
            dev: process.env.NEXT_PUBLIC_BLUVO_ENV === 'development',
        },
        cache: {
            prefix: 'myapp:bluvo:',
            minRemainingLifetimeSec: 30,
        },
        listExchangesFn: listExchanges,
        fetchWithdrawableBalanceFn: fetchWithdrawableBalances,
        requestQuotationFn: requestQuotation,
        executeWithdrawalFn: executeWithdrawal,
        getWalletByIdFn: getWalletById,
        pingWalletByIdFn: pingWalletById,
        onWalletConnectedFn: (walletId, exchange) => {
            // Persist wallet connection for user
            localStorage.setItem('connectedWalletId', walletId);
        },
    });

    // Use flow.isOAuthPending, flow.isWalletReady, etc. to render UI
    // Use flow.startWithdrawalFlow(), flow.requestQuote(), etc. for actions
}
```

## Environment Variables

| Variable | Side | Required | Description |
|---|---|---|---|
| `BLUVO_ORG_ID` | Server | Yes | Organization ID for server actions |
| `BLUVO_PROJECT_ID` | Server | Yes | Project ID for server actions |
| `BLUVO_API_KEY` | Server | Yes | API key (NEVER expose to client) |
| `NEXT_PUBLIC_BLUVO_ORG_ID` | Client | Yes | Org ID for hooks |
| `NEXT_PUBLIC_BLUVO_PROJECT_ID` | Client | Yes | Project ID for hooks |
| `NEXT_PUBLIC_BLUVO_ENV` | Client | No | `production` / `staging` / `development` |

## toPlain() Workaround

Next.js server actions can only return plain objects. The Bluvo SDK returns class instances and objects with non-serializable prototypes. The `toPlain()` function (`JSON.parse(JSON.stringify(o))`) strips these.

**Every server action return value MUST be wrapped with `toPlain()`**. Without it you get:
```
Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
```

## Cache Configuration

QR code caching can use a custom adapter. The default uses `localStorage`. Example with custom prefix:

```typescript
cache: {
    prefix: 'myapp:bluvo:',
    minRemainingLifetimeSec: 30,
    disabled: false,
    adapter: {
        get: (key) => localStorage.getItem(key),
        set: (key, val) => localStorage.setItem(key, val),
        remove: (key) => localStorage.removeItem(key),
    },
}
```
