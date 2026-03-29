# TypeScript Type Reference

Complete type definitions for the Bluvo SDK (`@bluvo/sdk-ts`).

## Machine Core Types

Generic state machine primitives used throughout the SDK.

```typescript
type Listener<TState> = (state: TState) => void;
```

```typescript
type Unsubscribe = () => void;
```

```typescript
interface Machine<TState, TAction> {
  getState(): TState;
  send(action: TAction): void;
  subscribe(listener: Listener<TState>): Unsubscribe;
  dispose(): void;
}
```

```typescript
interface StateValue<TStateType extends string = string> {
  type: TStateType;
  context: Record<string, any>;
  error?: Error | null;
}
```

```typescript
type StateTransition<TState, TAction> = (state: TState, action: TAction) => TState;
```

## Flow State Types

State and context types for the top-level withdrawal flow machine.

```typescript
type FlowStateType =
    | "idle"
    | "exchanges:loading" | "exchanges:ready" | "exchanges:error"
    | "oauth:waiting" | "oauth:processing" | "oauth:completed" | "oauth:error" | "oauth:fatal" | "oauth:window_closed_by_user"
    | "qrcode:waiting" | "qrcode:displaying" | "qrcode:scanning" | "qrcode:error" | "qrcode:timeout" | "qrcode:fatal"
    | "wallet:loading" | "wallet:ready" | "wallet:error"
    | "quote:requesting" | "quote:ready" | "quote:expired" | "quote:error"
    | "withdraw:idle" | "withdraw:processing" | "withdraw:error2FA" | "withdraw:error2FAMultiStep"
    | "withdraw:errorSMS" | "withdraw:errorKYC" | "withdraw:errorBalance" | "withdraw:retrying"
    | "withdraw:readyToConfirm" | "withdraw:completed" | "withdraw:blocked" | "withdraw:fatal"
    | "flow:cancelled";
```

Full context carried by the flow machine across all states.

```typescript
interface FlowContext {
    orgId: string;
    projectId: string;
    autoRefreshQuotation?: boolean;
    lastQuoteRequest?: {
        asset: string;
        amount: string;
        destinationAddress: string;
        network?: string;
        tag?: string;
        includeFee?: boolean;
    };
    exchanges?: Array<{
        id: string;
        name: string;
        logoUrl: string;
        status: string;
    }>;
    exchange?: string;
    walletId?: string;
    walletBalances?: Array<{
        asset: string;
        balance: string;
        balanceInFiat?: string;
        networks?: Array<{
            id: string;
            name: string;
            displayName: string;
            minWithdrawal: string;
            maxWithdrawal?: string;
            assetName: string;
            addressRegex?: string | null;
        }>;
        extra?: {
            slug?: string;
            assetId?: string;
        };
    }>;
    quote?: {
        id: string;
        asset: string;
        amount: string;
        estimatedFee: string;
        estimatedTotal: string;
        amountWithFeeInFiat: string;
        amountNoFeeInFiat: string;
        estimatedFeeInFiat: string;
        additionalInfo: {
            minWithdrawal: string | null;
            maxWithdrawal?: string | null;
        };
        expiresAt: number;
    };
    withdrawal?: {
        id: string;
        status: string;
        transactionId?: string;
    };
    retryAttempts: number;
    maxRetryAttempts: number;
    idempotencyKey?: string;
    topicName?: string;
    invalid2FAAttempts?: number;
    oauthErrorType?: 'recoverable' | 'fatal';
    errorDetails?: {
        valid2FAMethods?: string[];
    };
    qrCodeUrl?: string;
    qrCodeExpiresAt?: number;
    qrCodeStatus?: QRCodeStatus;
    isQRCodeFlow?: boolean;
    multiStep2FA?: {
        bizNo: string;
        steps: Array<{
            type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
            status: 'pending' | 'success' | 'failed';
            required: boolean;
            metadata?: {
                email?: string;
                emailSent?: boolean;
                qrCodeUrl?: string;
                qrCodeValidSeconds?: number;
            };
        }>;
        relation: 'AND' | 'OR';
        collectedCodes?: {
            twofa?: string;
            emailCode?: string;
            smsCode?: string;
        };
        faceQrCodeUrl?: string;
        faceQrCodeExpiresAt?: number;
        mfa?: {
            verified: {
                GOOGLE?: boolean;
                EMAIL?: boolean;
                FACE?: boolean;
                SMS?: boolean;
            };
        };
    };
}
```

Composite flow state combining state type with context.

```typescript
type FlowState = StateValue<FlowStateType> & {
    context: FlowContext;
};
```

## Flow Action Types

Discriminated union of all actions the flow machine can process.

```typescript
type FlowActionType =
    | { type: "LOAD_EXCHANGES" }
    | {
        type: "EXCHANGES_LOADED";
        exchanges: Array<{
            id: string;
            name: string;
            logoUrl: string;
            status: string;
        }>;
    }
    | { type: "EXCHANGES_FAILED"; error: Error }
    | { type: "START_OAUTH"; exchange: string; walletId: string; idem: string }
    | { type: "OAUTH_WINDOW_OPENED" }
    | { type: "OAUTH_COMPLETED"; walletId: string; exchange: string }
    | { type: "OAUTH_FAILED"; error: Error }
    | { type: "OAUTH_FATAL"; error: Error }
    | { type: "OAUTH_WINDOW_CLOSED_BY_USER"; error: Error }
    | { type: "LOAD_WALLET" }
    | {
        type: "WALLET_LOADED";
        balances: Array<{
            asset: string;
            balance: string;
            balanceInFiat?: string;
            networks?: Array<{
                id: string;
                name: string;
                displayName: string;
                minWithdrawal: string;
                maxWithdrawal?: string | undefined;
                assetName: string;
                addressRegex?: string;
                chainId?: string | null;
                tokenAddress?: string | null;
                contractAddress?: string | null;
                contractAddressVerified?: boolean | null;
            }>;
            extra?: {
                slug?: string;
                assetId?: string;
            };
        }>;
    }
    | { type: "WALLET_FAILED"; error: Error }
    | {
        type: "REQUEST_QUOTE";
        asset: string;
        amount: string;
        destinationAddress: string;
        network?: string;
    }
    | { type: "QUOTE_RECEIVED"; quote: FlowContext["quote"] }
    | { type: "QUOTE_EXPIRED" }
    | { type: "QUOTE_FAILED"; error: Error }
    | { type: "START_WITHDRAWAL"; quoteId: string }
    | { type: "WITHDRAWAL_PROGRESS"; message: string }
    | { type: "WITHDRAWAL_REQUIRES_2FA" }
    | { type: "WITHDRAWAL_REQUIRES_SMS" }
    | { type: "WITHDRAWAL_REQUIRES_KYC" }
    | { type: "WITHDRAWAL_2FA_INVALID" }
    | { type: "WITHDRAWAL_INSUFFICIENT_BALANCE" }
    | {
        type: "WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED";
        result?: { valid2FAMethods?: string[] };
    }
    | { type: "SUBMIT_2FA"; code: string }
    | { type: "SUBMIT_SMS"; code: string }
    | { type: "RETRY_WITHDRAWAL" }
    | { type: "WITHDRAWAL_SUCCESS"; transactionId?: string }
    | { type: "WITHDRAWAL_COMPLETED"; transactionId: string }
    | { type: "WITHDRAWAL_BLOCKED"; reason: string }
    | { type: "WITHDRAWAL_FATAL"; error: Error }
    | { type: "CANCEL_FLOW" }
    | { type: "START_QRCODE"; exchange: string; walletId: string; idem: string }
    | { type: "QRCODE_URL_RECEIVED"; qrCodeUrl: string; expiresAt?: number }
    | { type: "QRCODE_STATUS_UPDATED"; qrCodeStatus: QRCodeStatus; qrCodeExpiresAt?: number }
    | { type: "QRCODE_SCANNED" }
    | { type: "QRCODE_COMPLETED"; walletId: string; exchange: string }
    | { type: "QRCODE_FAILED"; error: Error }
    | { type: "QRCODE_TIMEOUT" }
    | { type: "QRCODE_FATAL"; error: Error }
    | { type: "REFRESH_QRCODE" }
    | {
        type: "WITHDRAWAL_REQUIRES_2FA_MULTI_STEPS";
        result: {
            bizNo: string;
            steps: Array<{
                type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
                status: 'pending' | 'success' | 'failed';
                required: boolean;
                metadata?: {
                    email?: string;
                    emailSent?: boolean;
                    qrCodeUrl?: string;
                    qrCodeValidSeconds?: number;
                };
            }>;
            relation: 'AND' | 'OR';
            mfa?: {
                verified: {
                    GOOGLE?: boolean;
                    EMAIL?: boolean;
                    FACE?: boolean;
                    SMS?: boolean;
                };
            };
        };
    }
    | {
        type: "WITHDRAWAL_DRY_RUN_COMPLETE";
        result: {
            bizNo?: string;
            steps?: Array<{
                type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
                status: 'pending' | 'success' | 'failed';
                required: boolean;
                metadata?: {
                    email?: string;
                    emailSent?: boolean;
                    qrCodeUrl?: string;
                    qrCodeValidSeconds?: number;
                };
            }>;
            relation?: 'AND' | 'OR';
            mfa?: {
                verified: {
                    GOOGLE?: boolean;
                    EMAIL?: boolean;
                    FACE?: boolean;
                    SMS?: boolean;
                };
            };
        };
    }
    | { type: "CONFIRM_WITHDRAWAL" }
    | {
        type: "SUBMIT_2FA_MULTI_STEP";
        stepType: 'GOOGLE' | 'EMAIL' | 'SMS';
        code: string;
    }
    | { type: "POLL_FACE_VERIFICATION" }
    | {
        type: "WITHDRAWAL_2FA_INCOMPLETE";
        result: {
            bizNo: string;
            steps: Array<{
                type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
                status: 'pending' | 'success' | 'failed';
                required: boolean;
                metadata?: {
                    email?: string;
                    emailSent?: boolean;
                    qrCodeUrl?: string;
                    qrCodeValidSeconds?: number;
                };
            }>;
            relation: 'AND' | 'OR';
            mfa?: {
                verified: {
                    GOOGLE?: boolean;
                    EMAIL?: boolean;
                    FACE?: boolean;
                    SMS?: boolean;
                };
            };
        };
    };
```

## Withdrawal Machine Types

State, context, and action types for the nested withdrawal state machine.

```typescript
type WithdrawalStateType =
    | 'idle'
    | 'processing'
    | 'waitingFor2FA'
    | 'waitingForSMS'
    | 'waitingForKYC'
    | 'retrying'
    | 'completed'
    | 'blocked'
    | 'failed';
```

```typescript
interface WithdrawalContext {
    quoteId: string;
    walletId: string;
    idempotencyKey: string;
    retryCount: number;
    maxRetries: number;
    lastError?: Error;
    transactionId?: string;
    requiredActions?: Array<'2fa' | 'sms' | 'kyc'>;
    twoFactorCode?: string;
    smsCode?: string;
}
```

```typescript
type WithdrawalState = StateValue<WithdrawalStateType> & {
    context: WithdrawalContext;
};
```

```typescript
type WithdrawalActionType =
    | { type: 'EXECUTE'; quoteId: string; walletId: string }
    | { type: 'REQUIRES_2FA' }
    | { type: 'REQUIRES_SMS' }
    | { type: 'REQUIRES_KYC' }
    | { type: 'SUBMIT_2FA'; code: string }
    | { type: 'SUBMIT_SMS'; code: string }
    | { type: 'RETRY' }
    | { type: 'SUCCESS'; transactionId?: string }
    | { type: 'BLOCKED'; reason: string }
    | { type: 'FAIL'; error: Error };
```

## QR Code Types

Status values for QR-code-based authentication flows (e.g., Binance Web).

```typescript
type QRCodeStatus = 'available' | 'acquired' | 'scanned' | 'confirmed' | 'used' | 'expired';
```

## Flow Client Options

Configuration for BluvoFlowClient, the high-level flow orchestrator.

```typescript
interface BluvoFlowClientOptions {
    orgId: string;
    projectId: string;
    listExchangesFn: BluvoClient["oauth2"]["listExchanges"];
    fetchWithdrawableBalanceFn: BluvoClient["wallet"]["withdrawals"]["getWithdrawableBalance"];
    requestQuotationFn: BluvoClient["wallet"]["withdrawals"]["requestQuotation"];
    executeWithdrawalFn: BluvoClient["wallet"]["withdrawals"]["executeWithdrawal"];
    getWalletByIdFn: BluvoClient["wallet"]["get"];
    pingWalletByIdFn: BluvoClient["wallet"]["ping"];
    mkUUIDFn?: () => string;
    onWalletConnectedFn?: (walletId: string, exchange: string) => any;
    options?: {
        sandbox?: boolean;
        dev?: boolean;
        maxRetryAttempts?: number;
        autoRefreshQuotation?: boolean;
        customDomain?:
            | string
            | "api-bluvo.com"
            | {
                api: string;
                ws: string;
            };
    };
    cache?: BluvoCacheOptions;
}
```

Options for starting a new withdrawal flow with OAuth popup.

```typescript
interface WithdrawalFlowOptions {
    exchange: string;
    walletId: string;
    popupOptions?: {
        title?: string;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
    };
}
```

Options for resuming an existing withdrawal flow.

```typescript
interface ResumeWithdrawalFlowOptions {
    exchange: string;
    walletId: string;
}
```

Options for silently resuming a flow with preloaded balance data.

```typescript
interface SilentResumeWithdrawalFlowOptions {
    walletId: string;
    exchange: string;
    preloadedBalances?: Array<{
        asset: string;
        balance: string;
        balanceInFiat?: string;
        networks?: Array<{
            id: string;
            name: string;
            displayName: string;
            minWithdrawal: string;
            maxWithdrawal?: string;
            assetName: string;
            addressRegex?: string;
        }>;
        extra?: {
            slug?: string;
            assetId?: string;
        };
    }>;
    onWalletNotFound?: (walletId: string) => void;
    onWalletInvalidApiCredentials?: (walletId: string) => void;
    onWalletBalance?: (walletId: string, balances: any[]) => void;
}
```

Options for requesting a withdrawal quote.

```typescript
interface QuoteRequestOptions {
    asset: string;
    amount: string;
    destinationAddress: string;
    network?: string;
    tag?: string;
    includeFee?: boolean;
}
```

## Error Types

Structured error codes and error-handling types used across the SDK.

```typescript
type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

All known error code values as a const object.

```typescript
const ERROR_CODES = {
    // Generic errors
    GENERIC_NOT_FOUND: 'GENERIC_NOT_FOUND',
    GENERIC_UNAUTHORIZED: 'GENERIC_UNAUTHORIZED',
    GENERIC_INTERNAL_SERVER_ERROR: 'GENERIC_INTERNAL_SERVER_ERROR',
    GENERIC_VALIDATION_ERROR: 'GENERIC_VALIDATION_ERROR',
    GENERIC_INVALID_REQUEST: 'GENERIC_INVALID_REQUEST',

    // API Key errors
    APIKEY_INSUFFICIENT_PERMISSIONS: 'APIKEY_INSUFFICIENT_PERMISSIONS',

    // Wallet errors
    WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
    WALLET_INVALID_CREDENTIALS: 'WALLET_INVALID_CREDENTIALS',

    // Quote errors
    QUOTE_NOT_FOUND: 'QUOTE_NOT_FOUND',
    QUOTE_EXPIRED: 'QUOTE_EXPIRED',

    // Withdrawal errors - Balance
    WITHDRAWAL_INSUFFICIENT_BALANCE: 'WITHDRAWAL_INSUFFICIENT_BALANCE',
    WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE: 'WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE',

    // Withdrawal errors - Address
    WITHDRAWAL_INVALID_ADDRESS: 'WITHDRAWAL_INVALID_ADDRESS',
    WITHDRAWAL_NETWORK_NOT_SUPPORTED: 'WITHDRAWAL_NETWORK_NOT_SUPPORTED',
    WITHDRAWAL_TOO_MANY_ADDRESSES: 'WITHDRAWAL_TOO_MANY_ADDRESSES',

    // Withdrawal errors - Amount
    WITHDRAWAL_AMOUNT_BELOW_MINIMUM: 'WITHDRAWAL_AMOUNT_BELOW_MINIMUM',
    WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM: 'WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM',

    // Withdrawal errors - Asset
    WITHDRAWAL_ASSET_NOT_SUPPORTED: 'WITHDRAWAL_ASSET_NOT_SUPPORTED',

    // Withdrawal errors - Provider
    WITHDRAWAL_PROVIDER_ERROR: 'WITHDRAWAL_PROVIDER_ERROR',

    // Withdrawal errors - 2FA
    WITHDRAWAL_2FA_REQUIRED_TOTP: 'WITHDRAWAL_2FA_REQUIRED_TOTP',
    WITHDRAWAL_2FA_REQUIRED_SMS: 'WITHDRAWAL_2FA_REQUIRED_SMS',
    WITHDRAWAL_2FA_REQUIRED_FACE_RECOGNITION: 'WITHDRAWAL_2FA_REQUIRED_FACE_RECOGNITION',
    WITHDRAWAL_2FA_REQUIRED_EMAIL: 'WITHDRAWAL_2FA_REQUIRED_EMAIL',
    WITHDRAWAL_2FA_REQUIRED_YUBIKEY: 'WITHDRAWAL_2FA_REQUIRED_YUBIKEY',
    WITHDRAWAL_2FA_REQUIRED_PASSPHRASE: 'WITHDRAWAL_2FA_REQUIRED_PASSPHRASE',
    WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS: 'WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS',
    WITHDRAWAL_2FA_INCOMPLETE: 'WITHDRAWAL_2FA_INCOMPLETE',
    WITHDRAWAL_2FA_INVALID: 'WITHDRAWAL_2FA_INVALID',
    WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',

    // Withdrawal errors - Verification
    WITHDRAWAL_KYC_REQUIRED: 'WITHDRAWAL_KYC_REQUIRED',
    WITHDRAWAL_EMAIL_UNVERIFIED: 'WITHDRAWAL_EMAIL_UNVERIFIED',

    // Withdrawal errors - Rate Limiting
    WITHDRAWAL_RATE_LIMIT_EXCEEDED: 'WITHDRAWAL_RATE_LIMIT_EXCEEDED',

    // OAuth errors
    OAUTH_AUTHORIZATION_FAILED: 'OAUTH_AUTHORIZATION_FAILED',
    OAUTH_TOKEN_EXCHANGE_FAILED: 'OAUTH_TOKEN_EXCHANGE_FAILED',
    OAUTH_INVALID_STATE: 'OAUTH_INVALID_STATE',
    OAUTH_INSUFFICIENT_SCOPE: 'OAUTH_INSUFFICIENT_SCOPE',

    // Webhook errors
    WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
    WEBHOOK_MISSING_HEADERS: 'WEBHOOK_MISSING_HEADERS',
    WEBHOOK_INVALID_TIMESTAMP: 'WEBHOOK_INVALID_TIMESTAMP',

    // Cache errors
    CACHE_MISS: 'CACHE_MISS',
    CACHE_EXPIRED: 'CACHE_EXPIRED',
    CACHE_INVALID_PATH: 'CACHE_INVALID_PATH',

    // Withdrawal - Dry Run (success signal, not a real error)
    WITHDRAWAL_DRY_RUN_COMPLETE: 'WITHDRAWAL_DRY_RUN_COMPLETE',
} as const;
```

Serializable error format that preserves all error information through workflows.

```typescript
interface SerializedError {
    code: ErrorCode;
    message: string;
    timestamp: string;
    originalError?: unknown;
}
```

API error response format returned by the Bluvo API.

```typescript
interface ApiErrorResponse {
    error?: string | { error?: string; type?: ErrorCode; errorCode?: ErrorCode };
    type?: ErrorCode;
    errorCode?: ErrorCode;
    code?: ErrorCode;
    result?: unknown;
    message?: string;
}
```

Union type representing all possible error formats the SDK may encounter.

```typescript
type BluvoError =
    | SerializedError
    | ApiErrorResponse
    | LegacyAxiosError
    | Error
    | unknown;
```

Comprehensive error type information with both validated codes and raw strings.

```typescript
interface ErrorTypeInfo {
    knownCode: ErrorCode | null;
    rawType: string | null;
}
```

## Preview Types

Types for displaying wallet balance previews without full OAuth flows.

```typescript
type PreviewStatus =
    | 'idle'
    | 'loading'
    | 'ready'
    | 'error_not_found'
    | 'error_invalid_credentials'
    | 'error_unknown';
```

Balance information for a single asset in preview mode.

```typescript
interface PreviewWalletBalance {
    asset: string;
    balance: string;
    balanceInFiat?: string;
    extra?: {
        slug?: string;
        assetId?: string;
    };
}
```

Complete state of a wallet preview.

```typescript
interface WalletPreviewState {
    walletId: string;
    exchange: string;
    status: PreviewStatus;
    balances?: Array<PreviewWalletBalance>;
    error?: Error;
    lastUpdated?: number;
}
```

Input for loading a wallet preview.

```typescript
interface PreviewWalletInput {
    id: string;
    exchange: string;
}
```

Callbacks for wallet preview events.

```typescript
interface PreviewCallbacks {
    onWalletBalance?: (walletId: string, balances: Array<PreviewWalletBalance>) => void;
    onWalletNotFound?: (walletId: string) => void;
    onWalletInvalidApiCredentials?: (walletId: string) => void;
}
```

Options for creating a BluvoPreviewManager.

```typescript
type BluvoPreviewManagerOptions = Pick<
    BluvoFlowClientOptions,
    "fetchWithdrawableBalanceFn" | "pingWalletByIdFn"
>;
```

## Cache Types

Cache adapter and configuration for persisting data (e.g., QR codes) across page reloads.

```typescript
interface BluvoCacheAdapter {
    get: (key: string) => Promise<string | null> | string | null;
    set: (key: string, value: string) => Promise<void> | void;
    remove: (key: string) => Promise<void> | void;
}
```

```typescript
interface BluvoCacheOptions {
    adapter?: BluvoCacheAdapter;
    prefix?: string;
    minRemainingLifetimeSec?: number;
    disabled?: boolean;
}
```

## Flow Machine Instance Types

Internal types for the flow machine with nested withdrawal machine.

```typescript
interface FlowMachineInstance {
    machine: Machine<FlowState, FlowActionType>;
    withdrawalMachine?: Machine<WithdrawalState, WithdrawalActionType>;
}
```

```typescript
interface FlowMachineOptions {
    orgId: string;
    projectId: string;
    maxRetryAttempts?: number;
    autoRefreshQuotation?: boolean;
}
```
