# Error Handling Implementation Summary

## What Was Implemented

A centralized error handling transformation system that automatically modifies the generated OpenAPI SDK code to:

1. **Return error objects** for 3xx/4xx HTTP status codes instead of throwing exceptions
2. **Throw exceptions** only for 5xx HTTP status codes (server errors)
3. **Add metadata** to error responses (`success: false` and `_originalStatusCode`)

## Implementation Details

### 1. Transformation Script

**Location**: `/scripts/transform-error-handling.js`

This Node.js script automatically processes all generated API files and transforms error handling:

- Finds all `throw new ApiException` statements for status codes 300-499
- Replaces them with `return new HttpInfo` statements
- Adds `success: false` flag and `_originalStatusCode` to error responses
- Keeps 5xx errors as throws for unexpected server failures

### 2. Integration with Build Pipeline

**Modified**: `/package.json`

Added a new step to the SDK generation pipeline:

```json
"generate-sdk": "pnpm sync-sdk-from-openapi && pnpm sync-sdk-from-openapi-cleanup && pnpm sync-sdk-from-openapi-transform-errors && pnpm sync-sdk-from-openapi-inc-version"
```

The transformation runs automatically after OpenAPI generation and cleanup, ensuring all generated code follows the new error handling pattern.

### 3. Type Definitions

**New File**: `/packages/ts/src/types/api-errors.types.ts`

Comprehensive type definitions and utilities:

- `ApiErrorResponse` - Error response structure
- `ApiSuccessResponse<T>` - Success response wrapper
- `ApiResponse<T>` - Union type for responses
- Type guards: `isApiError()`, `isApiSuccess()`, `isForbidden()`, etc.
- Helpers: `getErrorMessage()`, `isStatusCode()`, etc.

### 4. Exports

**Modified**: `/packages/ts/index.ts`

Exported all error handling types and utilities:

```typescript
export * from './src/types/api-errors.types';
```

### 5. Documentation

Created comprehensive documentation:

- **ERROR_HANDLING.md** - Complete guide with examples
- **EXAMPLE_ERROR_HANDLING.ts** - Working code examples
- **IMPLEMENTATION_SUMMARY.md** - This file

## Key Features

### ✅ Centralized Solution

- **Single point of modification**: Only one script needs to be maintained
- **Automatic application**: Runs on every SDK regeneration
- **Zero manual intervention**: No need to modify individual API methods

### ✅ Type-Safe

- Full TypeScript support with proper type narrowing
- Type guards for safe error checking
- Generic types that work with any API response

### ✅ Developer-Friendly

- Cleaner error handling without try-catch for expected errors
- Easy-to-use type guards (`isApiError`, `isForbidden`, etc.)
- Helper functions for common operations

### ✅ State Machine Compatible

- Errors can be returned from callback functions
- State machines can check for `success: false`
- No need for try-catch in state machine transitions

### ✅ Backward Compatible Exceptions

- Server errors (5xx) still throw exceptions
- Critical/unexpected errors are not silently swallowed
- Maintains traditional error behavior where appropriate

## Files Modified/Created

### Created Files

1. `/scripts/transform-error-handling.js` - Transformation script
2. `/packages/ts/src/types/api-errors.types.ts` - Type definitions
3. `/ERROR_HANDLING.md` - User documentation
4. `/EXAMPLE_ERROR_HANDLING.ts` - Code examples
5. `/IMPLEMENTATION_SUMMARY.md` - This summary

### Modified Files

1. `/package.json` - Added transformation step to pipeline
2. `/packages/ts/index.ts` - Added error type exports
3. **All API files in `/packages/ts/generated/apis/*.ts`** - Transformed by script

### Modified API Files (Transformed)

- `APIKeysApi.ts`
- `BasicApi.ts`
- `OAuth2Api.ts`
- `OAuth2WithdrawalsApi.ts`
- `OneTimeTokenApi.ts`
- `PricesApi.ts`
- `TransactionsApi.ts`
- `WalletsApi.ts`
- `WithdrawalsApi.ts`
- `WorkflowApi.ts`

## How It Works

### Before (Old Behavior)

```typescript
// 400 errors throw exceptions
if (isCodeInRange("400", response.httpStatusCode)) {
    const body = ObjectSerializer.deserialize(...);
    throw new ApiException<...>(response.httpStatusCode, "Bad Request", body, response.headers);
}
```

### After (New Behavior)

```typescript
// 400 errors return with success: false
if (isCodeInRange("400", response.httpStatusCode)) {
    const body = ObjectSerializer.deserialize(...);
    return new HttpInfo(200, response.headers, response.body, {
        ...body,
        success: false,
        _originalStatusCode: response.httpStatusCode
    } as any);
}
```

### Unknown Errors (Before)

```typescript
throw new ApiException<string | Blob | undefined>(
    response.httpStatusCode,
    "Unknown API Status Code!",
    await response.getBodyAsAny(),
    response.headers
);
```

### Unknown Errors (After)

```typescript
// Only throw for 5xx errors, otherwise return error response
if (response.httpStatusCode >= 500) {
    throw new ApiException<string | Blob | undefined>(
        response.httpStatusCode,
        "Server Error",
        await response.getBodyAsAny(),
        response.headers
    );
} else {
    // For 3xx/4xx errors not explicitly handled, return as error response
    return new HttpInfo(200, response.headers, response.body, {
        error: "Client Error",
        success: false,
        _originalStatusCode: response.httpStatusCode,
        _body: await response.getBodyAsAny()
    } as any);
}
```

## Usage Examples

### Basic Error Checking

```typescript
const result = await client.wallet.get(walletId);

if (isApiError(result)) {
    console.error(`Error: ${result.error}`);
    return;
}

console.log('Wallet:', result.walletId);
```

### Specific Error Handling

```typescript
const quote = await client.wallet.withdrawals.requestQuotation(walletId, params);

if (isApiError(quote)) {
    if (isBadRequest(quote)) {
        // Invalid parameters
    } else if (isForbidden(quote)) {
        // Insufficient permissions
    }
    return;
}

console.log('Quote ID:', quote.quoteId);
```

### Server Error Handling

```typescript
try {
    const result = await client.wallet.ping(walletId);

    if (isApiError(result)) {
        // Handle 3xx/4xx errors
    }

    // Success
} catch (error) {
    // Only 5xx errors reach here
    console.error('Server error:', error);
}
```

## Benefits

1. **Cleaner Code**: No try-catch blocks for expected client errors
2. **Type Safety**: TypeScript correctly narrows types after error checks
3. **Easier Debugging**: Error details in response objects, not exceptions
4. **State Machine Friendly**: Errors can be returned in state transitions
5. **Still Safe**: Server errors still throw to alert unexpected issues

## Testing

The implementation was tested by:

1. Running the transformation script on existing generated code
2. Building the TypeScript SDK successfully
3. Verifying all 10 API files were transformed correctly
4. Confirming no TypeScript compilation errors

## Future Maintenance

The transformation script is:

- **Automatic**: Runs on every `pnpm generate-sdk`
- **Centralized**: One script to maintain
- **Resilient**: Works with any OpenAPI-generated TypeScript code
- **Safe**: Doesn't modify request logic, only response handling

## Next Steps

You can now:

1. Use the new error handling in your state machines
2. Remove try-catch blocks around expected client errors
3. Use type guards for cleaner error checking
4. Benefit from improved TypeScript type inference

The implementation is complete and ready for use! 🎉
