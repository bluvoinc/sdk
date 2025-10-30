# Error Handling in Bluvo SDK

## Overview

The Bluvo SDK has been configured with **smart error handling** that differentiates between client errors (3xx/4xx) and server errors (5xx+):

- **3xx/4xx errors**: Returned as error response objects with `success: false`
- **5xx errors**: Thrown as exceptions (traditional behavior)

This approach provides better developer experience by making client errors easier to handle in your application flow, while still throwing exceptions for unexpected server failures.

## Architecture

### Automatic Transformation

The SDK uses a post-generation script (`scripts/transform-error-handling.js`) that automatically modifies all generated API response processors to:

1. Return error objects for status codes 300-499 instead of throwing
2. Add `success: false` and `_originalStatusCode` fields to error responses
3. Keep throwing exceptions for status codes 500+

This transformation runs automatically as part of the SDK generation pipeline:
```bash
pnpm generate-sdk
```

Which executes:
1. `sync-sdk-from-openapi` - Generate SDK from OpenAPI spec
2. `sync-sdk-from-openapi-cleanup` - Clean up imports and fix types
3. **`sync-sdk-from-openapi-transform-errors`** - Transform error handling ⭐ NEW
4. `sync-sdk-from-openapi-inc-version` - Increment version

## Usage Examples

### Basic Error Checking

```typescript
import { createClient, isApiError } from '@bluvo/sdk-ts';

const client = createClient({
    orgId: 'your-org-id',
    projectId: 'your-project-id',
    apiKey: 'your-api-key'
});

// Example: Get withdrawable balance
const result = await client.wallet.withdrawals.getWithdrawableBalance(walletId);

if (isApiError(result)) {
    console.error(`Error ${result._originalStatusCode}: ${result.error}`);
    // Handle the error appropriately
    return;
}

// TypeScript knows this is a success response
console.log('Balances:', result.balances);
```

### Handling Specific Error Types

```typescript
import {
    isApiError,
    isForbidden,
    isNotFound,
    isBadRequest,
    getErrorMessage
} from '@bluvo/sdk-ts';

const result = await client.wallet.withdrawals.requestQuotation(walletId, {
    asset: 'BTC',
    amount: '0.1',
    address: 'bc1q...',
    network: 'bitcoin'
});

if (isApiError(result)) {
    if (isForbidden(result)) {
        // 403: Insufficient API key permissions
        console.error('Missing required API key scopes');
    } else if (isNotFound(result)) {
        // 404: Wallet not found
        console.error('Wallet does not exist');
    } else if (isBadRequest(result)) {
        // 400: Invalid request parameters
        console.error('Invalid withdrawal parameters:', result.error);
    } else {
        // Other client errors
        console.error(getErrorMessage(result));
    }
    return;
}

// Success - proceed with quotation
console.log('Quote ID:', result.quoteId);
console.log('Fee:', result.fee);
```

### Try-Catch for Server Errors Only

```typescript
try {
    const result = await client.wallet.withdrawals.executeWithdrawal(
        walletId,
        idem,
        quoteId,
        { twofa: '123456' }
    );

    if (isApiError(result)) {
        // Handle client errors (400, 403, 404, etc.)
        if (result._originalStatusCode === 400 && result.type === 'REQUIRES_2FA') {
            // Prompt user for 2FA
            return { requires2FA: true };
        }

        if (result._originalStatusCode === 400 && result.type === 'INVALID_2FA') {
            // Invalid 2FA code
            return { error: 'Invalid 2FA code, please try again' };
        }

        // Other client errors
        return { error: getErrorMessage(result) };
    }

    // Success
    return { withdrawalId: result.withdrawalId, status: result.status };

} catch (error) {
    // Only 5xx server errors will reach here
    console.error('Server error:', error);
    return { error: 'An unexpected server error occurred. Please try again later.' };
}
```

### State Machine Integration

The error handling integrates seamlessly with state machines:

```typescript
// In your callback functions for state machine
const fetchWithdrawableBalanceFn = async (walletId: string) => {
    const result = await client.wallet.withdrawals.getWithdrawableBalance(walletId);

    if (isApiError(result)) {
        // Return error object - state machine handles it
        return result;
    }

    // Return success response
    return result;
};

const requestQuotationFn = async (walletId: string, params: QuoteParams) => {
    const result = await client.wallet.withdrawals.requestQuotation(walletId, params);

    if (isApiError(result)) {
        // State machine transitions to error state
        return result;
    }

    // State machine transitions to next state with quote data
    return result;
};
```

## Type Definitions

### `ApiErrorResponse`

```typescript
interface ApiErrorResponse {
    success: false;                  // Always false for errors
    _originalStatusCode: number;     // HTTP status code (3xx or 4xx)
    error?: string;                  // Error message
    type?: string;                   // Error code for programmatic handling
    [key: string]: any;              // Additional error details
}
```

### `ApiSuccessResponse<T>`

```typescript
type ApiSuccessResponse<T> = Omit<T, 'success' | '_originalStatusCode'> & {
    success?: undefined;  // Undefined for success (truthy check)
};
```

### `ApiResponse<T>`

```typescript
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

## Type Guards

All type guards are exported from `@bluvo/sdk-ts`:

- `isApiError(response)` - Check if response is an error
- `isApiSuccess(response)` - Check if response is successful
- `isBadRequest(error)` - Check for 400 error
- `isUnauthorized(error)` - Check for 401 error
- `isForbidden(error)` - Check for 403 error
- `isNotFound(error)` - Check for 404 error
- `isConflict(error)` - Check for 409 error
- `isTooManyRequests(error)` - Check for 429 error
- `isStatusCode(error, code)` - Check for specific status code

## Helper Functions

- `getErrorMessage(error)` - Extract error message from any API error
- `isStatusCode(error, statusCode)` - Check if error matches specific status code

## Common Error Scenarios

### Wallet Operations

```typescript
// Get wallet
const wallet = await client.wallet.get(walletId);
if (isApiError(wallet)) {
    if (isNotFound(wallet)) {
        // Wallet doesn't exist
    } else if (isForbidden(wallet)) {
        // Insufficient permissions
    }
}

// Ping wallet
const ping = await client.wallet.ping(walletId);
if (isApiError(ping)) {
    // Wallet connection issue
}
```

### Withdrawal Flow

```typescript
// 1. Get withdrawable balance
const balance = await client.wallet.withdrawals.getWithdrawableBalance(walletId);
if (isApiError(balance)) {
    // Handle balance fetch error
    return;
}

// 2. Request quotation
const quote = await client.wallet.withdrawals.requestQuotation(walletId, params);
if (isApiError(quote)) {
    if (isBadRequest(quote)) {
        // Invalid parameters (address, amount, network, etc.)
    }
    return;
}

// 3. Execute withdrawal
const withdrawal = await client.wallet.withdrawals.executeWithdrawal(
    walletId, idem, quote.quoteId, { twofa }
);
if (isApiError(withdrawal)) {
    if (withdrawal.type === 'REQUIRES_2FA') {
        // Prompt for 2FA
    } else if (withdrawal.type === 'INVALID_2FA') {
        // Invalid 2FA code
    } else if (withdrawal.type === 'INSUFFICIENT_BALANCE') {
        // Not enough funds
    }
    return;
}

// Success
console.log('Withdrawal initiated:', withdrawal.withdrawalId);
```

## Migration Guide

If you're updating from a version that throws on all errors:

### Before (Old Behavior)

```typescript
try {
    const result = await client.wallet.get(walletId);
    console.log(result);
} catch (error) {
    // Catches both 4xx and 5xx errors
    if (error.code === 404) {
        console.error('Wallet not found');
    }
}
```

### After (New Behavior)

```typescript
const result = await client.wallet.get(walletId);

if (isApiError(result)) {
    // Handle 3xx/4xx errors
    if (isNotFound(result)) {
        console.error('Wallet not found');
    }
    return;
}

// Success - TypeScript knows the correct type
console.log(result);
```

## Benefits

1. **Cleaner Code**: No need for try-catch blocks for expected client errors
2. **Better Type Safety**: TypeScript narrows types correctly after error checks
3. **Easier Debugging**: Error details are in the response object, not thrown exceptions
4. **State Machine Friendly**: Errors can be returned and handled in state transitions
5. **Still Safe**: Server errors (5xx) still throw to alert you of unexpected issues

## Maintenance

The error transformation script is located at:
```
scripts/transform-error-handling.js
```

It's integrated into the SDK generation pipeline and runs automatically. You don't need to manually run it unless you're developing or testing the transformation logic.

### Manual Execution

If you need to run the transformation manually:

```bash
node scripts/transform-error-handling.js
```

This will transform all `*Api.ts` files in `packages/ts/generated/apis/`.
