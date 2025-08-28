# @bluvo/react

React hooks for the Bluvo SDK - providing a framework-agnostic, event-driven state machine for cryptocurrency withdrawal flows.

## Installation

```bash
npm install @bluvo/react @bluvo/sdk-ts
# or
pnpm add @bluvo/react @bluvo/sdk-ts
# or
yarn add @bluvo/react @bluvo/sdk-ts
```

## Quick Start

```tsx
import React from 'react';
import { useBluvoFlow } from '@bluvo/react';

function WithdrawalComponent() {
    const flow = useBluvoFlow({
        orgId: "bluvo-org-id",
        projectId: "bluvo-project-id", // <- deprecated soon to be removed

        fetchWithdrawableBalanceFn: fetchWithdrawableBalances,
        requestQuotationFn: requestQuotation,
        executeWithdrawalFn: executeWithdrawal,

        onWalletConnectedFn: (walletId, exchange) => {
            // call server action store this walletId for the currently-logged in user
        }
    });

  const handleStart = () => {
    flow.startWithdrawalFlow({
      exchange: 'coinbase',
      walletId: 'wallet-123',
      asset: 'BTC',
      amount: '0.001',
      destinationAddress: 'bc1q...'
    });
  };

  if (flow.requires2FA) {
    return (
      <div>
        <input 
          placeholder="Enter 2FA code"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              flow.submit2FA(e.target.value);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleStart}>Start Withdrawal</button>
      <p>State: {flow.state?.type}</p>
    </div>
  );
}
```

## Available Hooks

### `useBluvoFlow(options)`

The main hook that manages the entire withdrawal flow state machine.

**Options:**
- `orgId` - Your Bluvo organization ID
- `projectId` - Your Bluvo project ID  
- `fetchWithdrawableBalanceFn` - Function to fetch wallet balances
- `requestQuotationFn` - Function to request withdrawal quotes
- `executeWithdrawalFn` - Function to execute withdrawals
- `maxRetryAttempts?` - Maximum retry attempts (default: 3)
- `topicToken?` - WebSocket topic token for real-time updates
- `cacheName?` - Cache name for WebSocket subscriptions
- `mkUUIDFn?` - Custom UUID generator function

**Returns:**
```tsx
{
  // State
  state: FlowState | null,
  error: Error | null,
  context: FlowContext,
  
  // Actions  
  startWithdrawalFlow: (options) => Promise<void>,
  executeWithdrawal: (quoteId) => Promise<void>,
  submit2FA: (code) => Promise<void>,
  submitSMS: (code) => Promise<void>,
  retryWithdrawal: () => Promise<void>,
  cancel: () => void,
  
  // State Helpers
  isOAuthPending: boolean,
  isWalletReady: boolean,
  isQuoteReady: boolean,
  requires2FA: boolean,
  requiresSMS: boolean,
  requiresKYC: boolean,
  isWithdrawalComplete: boolean,
  canRetry: boolean,
  
  // Data
  walletBalances: Array<{asset: string, balance: string}>,
  quote: Quote | null,
  withdrawal: Withdrawal | null
}
```

### `useFlowMachine(machine)`

Lower-level hook for direct state machine interaction.

### `useWithdrawMachine(machine)`

Hook for managing the withdrawal sub-state machine.

## Security

This library follows security best practices:

- **No API keys in browser**: Uses callback functions that call your secure server endpoints
- **Server-side operations**: All sensitive operations happen on your server
- **Type safety**: Full TypeScript support with proper error handling

## State Flow

```
idle → oauth:waiting → wallet:loading → quote:ready → withdraw:processing → completed
  ↓         ↓               ↓             ↓              ↓
cancel   cancel        error states    2FA/SMS/KYC    success/retry
```

## Framework Integration

Works seamlessly with:
- **Next.js** - Use with Server Actions
- **Remix** - Use with action functions  
- **SvelteKit** - Use with form actions
- **Any React app** - Use with your API layer

## Examples

See the [examples directory](https://github.com/bluvoinc/sdk/tree/main/packages/react/examples) for complete implementations with different frameworks.

## License

MIT © Bluvo Inc.