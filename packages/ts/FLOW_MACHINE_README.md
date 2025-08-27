# Bluvo Flow Machine Documentation

## Overview

The Bluvo Flow Machine provides a framework-agnostic, event-driven state machine for orchestrating cryptocurrency withdrawal flows. It handles the complete journey from OAuth authentication through wallet loading, quote generation, and withdrawal execution with built-in error recovery.

## Architecture

### Core Components

1. **Flow Machine** (`flowMachine.ts`) - Parent state machine that orchestrates the entire flow
2. **Withdrawal Machine** (`withdrawalMachine.ts`) - Nested state machine for handling withdrawal lifecycle
3. **BluvoFlowClient** (`BluvoFlowClient.ts`) - High-level client that integrates with Bluvo APIs
4. **React Adapters** (`adapters/react/`) - React hooks for easy integration

### State Flow

```
idle
  ↓
oauth:waiting → oauth:processing → oauth:completed
                                       ↓
                                  wallet:loading → wallet:ready
                                                      ↓
                                                 quote:requesting → quote:ready
                                                                      ↓
                                                                 withdraw:processing
                                                                      ↓
                                                        [Various withdrawal states]
                                                                      ↓
                                                             withdraw:completed
```

## States

### Flow States

- `idle` - Initial state
- `oauth:waiting` - Waiting for OAuth window to open
- `oauth:processing` - OAuth in progress
- `oauth:completed` - OAuth successful
- `oauth:error` - OAuth failed
- `wallet:loading` - Loading wallet balances
- `wallet:ready` - Wallet loaded successfully
- `wallet:error` - Wallet loading failed
- `quote:requesting` - Requesting withdrawal quote
- `quote:ready` - Quote received and valid
- `quote:expired` - Quote has expired
- `quote:error` - Quote request failed
- `withdraw:idle` - Withdrawal not started
- `withdraw:processing` - Withdrawal in progress
- `withdraw:error2FA` - 2FA code required
- `withdraw:errorSMS` - SMS verification required
- `withdraw:errorKYC` - KYC verification required
- `withdraw:errorBalance` - Insufficient balance
- `withdraw:retrying` - Retrying after failure
- `withdraw:completed` - Withdrawal successful
- `withdraw:blocked` - Withdrawal blocked
- `withdraw:fatal` - Unrecoverable error
- `flow:cancelled` - Flow cancelled by user

### Withdrawal States (Nested)

- `idle` - Not started
- `processing` - Executing withdrawal
- `waitingFor2FA` - Awaiting 2FA code
- `waitingForSMS` - Awaiting SMS code
- `waitingForKYC` - Awaiting KYC completion
- `retrying` - Preparing to retry
- `completed` - Success
- `blocked` - Permanently blocked
- `failed` - Failed after max retries

## Usage

### Vanilla TypeScript

```typescript
import { BluvoFlowClient } from '@bluvo/sdk-ts';

const flowClient = new BluvoFlowClient({
  orgId: 'your-org-id',
  projectId: 'your-project-id',
  maxRetryAttempts: 3,
  topicToken: 'your-topic-token',
  
  // Provide callback functions for API calls (secure for browser use)
  fetchWithdrawableBalanceFn: async (walletId: string) => {
    const response = await fetch(`/api/wallets/${walletId}/balances`);
    const data = await response.json();
    return data.balances;
  },
  
  requestQuotationFn: async (walletId: string, params) => {
    const response = await fetch(`/api/wallets/${walletId}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    return data.quote;
  },
  
  executeWithdrawalFn: async (walletId: string, idem: string, quoteId: string, params) => {
    const response = await fetch(`/api/wallets/${walletId}/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idem, quoteId, ...params })
    });
    const data = await response.json();
    return data;
  }
});

// Subscribe to state changes
const unsubscribe = flowClient.subscribe((state) => {
  console.log('State:', state.type);
  
  if (state.type === 'withdraw:error2FA') {
    // Prompt for 2FA code
    const code = prompt('Enter 2FA code:');
    flowClient.submit2FA(code);
  }
});

// Start the flow
await flowClient.startWithdrawalFlow({
  exchange: 'coinbase',
  walletId: 'wallet-123',
  asset: 'BTC',
  amount: '0.001',
  destinationAddress: '1A1zP...',
  network: 'bitcoin'
});

// Clean up when done
flowClient.dispose();
```

### React

```typescript
import { useBluvoFlow } from '@bluvo/sdk-ts/react';

function WithdrawalComponent() {
  const flow = useBluvoFlow({
    orgId: 'your-org-id',
    projectId: 'your-project-id',
    maxRetryAttempts: 3
  });

  const handleStart = () => {
    flow.startWithdrawalFlow({
      exchange: 'coinbase',
      walletId: 'wallet-123',
      asset: 'BTC',
      amount: '0.001',
      destinationAddress: '1A1zP...'
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

## Extending for New Errors

To add a new recoverable error type (e.g., device approval):

### 1. Add Error Type to Flow Types

```typescript
// flow.types.ts
export type FlowStateType = 
  | ... existing states ...
  | 'withdraw:errorDeviceApproval';

export type FlowActionType =
  | ... existing actions ...
  | { type: 'WITHDRAWAL_REQUIRES_DEVICE_APPROVAL' }
  | { type: 'SUBMIT_DEVICE_APPROVAL'; deviceId: string };
```

### 2. Add to Withdrawal Types

```typescript
// withdrawal.types.ts
export type WithdrawalStateType =
  | ... existing states ...
  | 'waitingForDeviceApproval';

export type WithdrawalActionType =
  | ... existing actions ...
  | { type: 'REQUIRES_DEVICE_APPROVAL' }
  | { type: 'SUBMIT_DEVICE_APPROVAL'; deviceId: string };
```

### 3. Update Withdrawal Machine Transitions

```typescript
// withdrawalMachine.ts
case 'processing':
  switch (action.type) {
    // ... existing cases ...
    case 'REQUIRES_DEVICE_APPROVAL':
      return {
        type: 'waitingForDeviceApproval',
        context: {
          ...state.context,
          requiredActions: ['deviceApproval']
        },
        error: null
      };
  }

case 'waitingForDeviceApproval':
  if (action.type === 'SUBMIT_DEVICE_APPROVAL') {
    return {
      type: 'processing',
      context: {
        ...state.context,
        deviceId: action.deviceId,
        requiredActions: undefined
      },
      error: null
    };
  }
```

### 4. Update Flow Machine

```typescript
// flowMachine.ts
// Add mapping from withdrawal state to flow state
case 'waitingForDeviceApproval':
  if (state.type !== 'withdraw:errorDeviceApproval') {
    return {
      type: 'withdraw:errorDeviceApproval',
      context: state.context,
      error: null
    };
  }
  break;

// Handle the submission action
case 'SUBMIT_DEVICE_APPROVAL':
  if (instance.withdrawalMachine && state.type === 'withdraw:errorDeviceApproval') {
    instance.withdrawalMachine.send({
      type: 'SUBMIT_DEVICE_APPROVAL',
      deviceId: action.deviceId
    });
    return {
      type: 'withdraw:processing',
      context: state.context,
      error: null
    };
  }
  break;
```

### 5. Update BluvoFlowClient

```typescript
// BluvoFlowClient.ts
async submitDeviceApproval(deviceId: string) {
  if (!this.flowMachine) return;
  
  const state = this.flowMachine.getState();
  if (state.type !== 'withdraw:errorDeviceApproval') return;

  this.flowMachine.send({
    type: 'SUBMIT_DEVICE_APPROVAL',
    deviceId
  });

  // Re-execute withdrawal with device approval
  // ... implementation ...
}

// In error handler
case 'DEVICE_APPROVAL_REQUIRED':
  this.flowMachine.send({ type: 'WITHDRAWAL_REQUIRES_DEVICE_APPROVAL' });
  break;
```

### 6. Update React Hook

```typescript
// useBluvoFlow.ts
const submitDeviceApproval = useCallback(async (deviceId: string) => {
  await flowClient.submitDeviceApproval(deviceId);
}, [flowClient]);

return {
  // ... existing returns ...
  requiresDeviceApproval: flow.state?.type === 'withdraw:errorDeviceApproval',
  submitDeviceApproval,
};
```

## Best Practices

1. **State Subscriptions**: Always unsubscribe when done to prevent memory leaks
2. **Error Handling**: Check `state.error` for detailed error information
3. **Idempotency**: The system automatically generates new idempotency keys for retries
4. **Cancellation**: Use `cancel()` to stop the flow and clean up resources
5. **Type Safety**: Leverage TypeScript types for compile-time safety

## Testing

The state machines are fully unit tested. Run tests with:

```bash
pnpm test
```

See `test/machines/` for examples of testing state transitions and error scenarios.