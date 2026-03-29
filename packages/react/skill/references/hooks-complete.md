# Hooks Complete Reference

## useBluvoFlow(options: UseBluvoFlowOptions)

The main hook. Creates a `BluvoFlowClient` internally and exposes the complete flow interface.

### Parameters

`UseBluvoFlowOptions` extends `BluvoFlowClientOptions`:

| Field | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | Organization ID |
| `projectId` | `string` | Yes | Project ID |
| `listExchangesFn` | `(status?) => Promise<Exchange[]>` | Yes | Server action to list exchanges |
| `fetchWithdrawableBalanceFn` | `(walletId) => Promise<...>` | Yes | Server action to fetch balances |
| `requestQuotationFn` | `(walletId, body) => Promise<...>` | Yes | Server action to request quote |
| `executeWithdrawalFn` | `(walletId, idem, quoteId, body) => Promise<...>` | Yes | Server action to execute withdrawal |
| `getWalletByIdFn` | `(walletId) => Promise<...>` | Yes | Server action to get wallet |
| `pingWalletByIdFn` | `(walletId) => Promise<...>` | Yes | Server action to ping wallet |
| `mkUUIDFn` | `() => string` | No | Custom UUID generator (default: `crypto.randomUUID()`) |
| `onWalletConnectedFn` | `(walletId, exchange) => any` | No | Called when wallet connection completes |
| `options` | `{ sandbox?, dev?, maxRetryAttempts?, autoRefreshQuotation?, customDomain? }` | No | Flow options |
| `cache` | `BluvoCacheOptions` | No | QR code cache config |

### Return Value

**State (from useFlowMachine):**

| Field | Type | Description |
|---|---|---|
| `state` | `FlowState \| null` | Current machine state |
| `send` | `(action: FlowActionType) => void` | Send action to machine |
| `isInState` | `(stateType) => boolean` | Check current state type |
| `hasError` | `boolean` | Whether current state has an error |
| `error` | `Error \| null \| undefined` | Current error |
| `context` | `FlowContext \| undefined` | Current flow context |

**Actions:**

| Field | Type | Description |
|---|---|---|
| `listExchanges` | `(status?) => Promise<Exchange[]>` | Load available exchanges |
| `startWithdrawalFlow` | `(options: WithdrawalFlowOptions) => Promise<...>` | Start a new withdrawal flow |
| `resumeWithdrawalFlow` | `(options: ResumeWithdrawalFlowOptions) => Promise<...>` | Resume with existing wallet |
| `silentResumeWithdrawalFlow` | `(options: SilentResumeWithdrawalFlowOptions) => Promise<...>` | Resume with preloaded data |
| `requestQuote` | `(options: QuoteRequestOptions) => Promise<...>` | Request a withdrawal quote |
| `executeWithdrawal` | `(quoteId: string) => Promise<...>` | Execute withdrawal |
| `submit2FA` | `(code: string) => Promise<...>` | Submit TOTP 2FA code |
| `submit2FAMultiStep` | `(stepType: 'GOOGLE'\|'EMAIL'\|'SMS', code: string) => Promise<...>` | Submit multi-step 2FA code |
| `pollFaceVerification` | `() => Promise<...>` | Poll for face verification status |
| `confirmWithdrawal` | `() => Promise<...>` | Confirm withdrawal after all 2FA steps verified |
| `retryWithdrawal` | `() => Promise<...>` | Retry a failed withdrawal |
| `cancel` | `() => void` | Cancel the flow |
| `refreshQRCode` | `() => Promise<...>` | Refresh expired QR code |
| `testWithdrawalComplete` | `(transactionId?) => void` | TEST ONLY — simulate completion |

**General Flow State:**

| Field | Type | Description |
|---|---|---|
| `isIdle` | `boolean` | State is `idle` |
| `isFlowCancelled` | `boolean` | State is `flow:cancelled` |

**Exchanges State:**

| Field | Type | Description |
|---|---|---|
| `isExchangesLoading` | `boolean` | Loading or `exchanges:loading` |
| `isExchangesReady` | `boolean` | `exchanges:ready` or exchanges loaded |
| `isExchangesError` | `boolean` | `exchanges:error` |
| `exchangesError` | `Error \| null` | Exchange loading error |

**OAuth State:**

| Field | Type | Description |
|---|---|---|
| `isOAuthPending` | `boolean` | `oauth:waiting` or `oauth:processing` |
| `isOAuthWaiting` | `boolean` | `oauth:waiting` |
| `isOAuthProcessing` | `boolean` | `oauth:processing` |
| `isOAuthError` | `boolean` | `oauth:error` or `oauth:fatal` |
| `isOAuthFatal` | `boolean` | `oauth:fatal` |
| `isWalletConnectionInvalid` | `boolean` | `oauth:fatal` or `qrcode:fatal` |
| `isOAuthComplete` | `boolean` | `oauth:completed` |
| `isOAuthWindowBeenClosedByTheUser` | `boolean` | `oauth:window_closed_by_user` |

**QR Code State:**

| Field | Type | Description |
|---|---|---|
| `isQRCodePending` | `boolean` | QR code in progress (not error/fatal/timeout) |
| `isQRCodeWaiting` | `boolean` | `qrcode:waiting` |
| `isQRCodeDisplaying` | `boolean` | `qrcode:displaying` |
| `isQRCodeScanning` | `boolean` | `qrcode:scanning` |
| `isQRCodeError` | `boolean` | `qrcode:error` or `qrcode:fatal` |
| `isQRCodeFatal` | `boolean` | `qrcode:fatal` |
| `isQRCodeTimeout` | `boolean` | `qrcode:timeout` |
| `qrCodeUrl` | `string \| undefined` | QR code URL to display |
| `qrCodeExpiresAt` | `number \| undefined` | QR code expiration timestamp |
| `qrCodeStatus` | `QRCodeStatus \| undefined` | Current QR code status |
| `isQRCodeFlow` | `boolean` | Whether current flow uses QR code auth |

**Wallet State:**

| Field | Type | Description |
|---|---|---|
| `isWalletLoading` | `boolean` | `wallet:loading` |
| `isWalletError` | `boolean` | `wallet:error` |
| `isWalletReady` | `boolean` | `wallet:ready` |

**Quote State:**

| Field | Type | Description |
|---|---|---|
| `isQuoteLoading` | `boolean` | `quote:requesting` |
| `isQuoteReady` | `boolean` | `quote:ready` |
| `isQuoteExpired` | `boolean` | `quote:expired` |
| `isQuoteError` | `boolean` | `quote:error` |

**Withdrawal State:**

| Field | Type | Description |
|---|---|---|
| `isWithdrawing` | `boolean` | Active withdrawal (excludes completed/fatal/error states) |
| `isWithdrawProcessing` | `boolean` | `withdraw:processing` |
| `isWithdrawalComplete` | `boolean` | `withdraw:completed` |
| `isWithdrawBlocked` | `boolean` | `withdraw:blocked` |
| `hasFatalError` | `boolean` | `withdraw:fatal` |

**Withdrawal Requirements & Errors:**

| Field | Type | Description |
|---|---|---|
| `requires2FA` | `boolean` | `withdraw:error2FA` |
| `requires2FAMultiStep` | `boolean` | `withdraw:error2FAMultiStep` |
| `isReadyToConfirm` | `boolean` | `withdraw:readyToConfirm` |
| `requiresSMS` | `boolean` | `withdraw:errorSMS` |
| `requiresKYC` | `boolean` | `withdraw:errorKYC` |
| `requiresValid2FAMethod` | `boolean` | Fatal with valid2FAMethods set |
| `requiresEmailVerification` | `boolean` | Fatal with email error |
| `hasInsufficientBalance` | `boolean` | `withdraw:errorBalance` |
| `canRetry` | `boolean` | `withdraw:retrying` |

**Error Detection Helpers:**

| Field | Type | Description |
|---|---|---|
| `hasAmountError` | `boolean` | Quote/fatal error mentioning amount/min/max |
| `hasAddressError` | `boolean` | Quote/fatal error mentioning address |
| `hasNetworkError` | `boolean` | Quote/fatal error mentioning network |
| `hasWalletNotFoundError` | `boolean` | Wallet error with "not found" |
| `hasInvalidCredentialsError` | `boolean` | Wallet error with "invalid credential" |

**Context Data:**

| Field | Type | Description |
|---|---|---|
| `invalid2FAAttempts` | `number` | Count of invalid 2FA attempts |
| `retryAttempts` | `number` | Current retry count |
| `maxRetryAttempts` | `number` | Maximum retries allowed |
| `exchanges` | `Exchange[]` | Available exchanges |
| `walletBalances` | `Balance[]` | Wallet balances |
| `quote` | `Quote \| undefined` | Current quote |
| `withdrawal` | `Withdrawal \| undefined` | Withdrawal result |
| `valid2FAMethods` | `string[] \| undefined` | Valid 2FA methods (when fatal) |

**Multi-step 2FA:**

| Field | Type | Description |
|---|---|---|
| `multiStep2FA` | `MultiStep2FA \| undefined` | Full multi-step 2FA context |
| `multiStep2FASteps` | `Step[]` | Steps array |
| `multiStep2FABizNo` | `string \| undefined` | Business number |
| `multiStep2FARelation` | `'AND' \| 'OR' \| undefined` | Step relation |
| `collectedMultiStep2FACodes` | `object \| undefined` | Collected codes |
| `hasGoogleStep` | `boolean` | Has GOOGLE step |
| `hasEmailStep` | `boolean` | Has EMAIL step |
| `hasFaceStep` | `boolean` | Has FACE step |
| `hasSmsStep` | `boolean` | Has SMS step |
| `isGoogleStepVerified` | `boolean` | GOOGLE step verified (mfa.verified PRIMARY) |
| `isEmailStepVerified` | `boolean` | EMAIL step verified |
| `isFaceStepVerified` | `boolean` | FACE step verified |
| `isSmsStepVerified` | `boolean` | SMS step verified |
| `mfaVerified` | `object \| undefined` | MFA verified object (PRIMARY truth) |
| `allMultiStep2FAStepsVerified` | `boolean` | All required steps verified |
| `faceQrCodeUrl` | `string \| undefined` | Face verification QR code URL |
| `faceQrCodeExpiresAt` | `number \| undefined` | Face QR code expiration |

**Client:**

| Field | Type | Description |
|---|---|---|
| `client` | `BluvoFlowClient` | The underlying client instance |

---

## useFlowMachine(machine: Machine<FlowState, FlowActionType> | null)

Lower-level hook for direct machine interaction.

### Return Value

| Field | Type | Description |
|---|---|---|
| `state` | `FlowState \| null` | Current state |
| `send` | `(action: FlowActionType) => void` | Send action |
| `isInState` | `(stateType) => boolean` | Check state |
| `hasError` | `boolean` | Has error |
| `error` | `Error \| null \| undefined` | Current error |
| `context` | `FlowContext \| undefined` | Current context |

---

## useWithdrawMachine(machine: Machine<WithdrawalState, WithdrawalActionType> | null)

Direct withdrawal machine interaction.

### Return Value

| Field | Type | Description |
|---|---|---|
| `state` | `WithdrawalState \| null` | Current state |
| `send` | `(action: WithdrawalActionType) => void` | Send action |
| `isInState` | `(stateType) => boolean` | Check state |
| `hasError` | `boolean` | Has error |
| `error` | `Error \| null \| undefined` | Current error |
| `context` | `WithdrawalContext \| undefined` | Current context |
| `requires2FA` | `boolean` | `waitingFor2FA` |
| `requiresSMS` | `boolean` | `waitingForSMS` |
| `requiresKYC` | `boolean` | `waitingForKYC` |
| `isCompleted` | `boolean` | `completed` |
| `isBlocked` | `boolean` | `blocked` |
| `canRetry` | `boolean` | `retrying` |

---

## useWalletPreviews(options: UseWalletPreviewsOptions)

Hook for managing wallet preview states (dashboard of connected wallets).

### Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `wallets` | `PreviewWalletInput[]` | Yes | Wallets to preview |
| `pingWalletByIdFn` | function | Yes | Server action to ping wallet |
| `fetchWithdrawableBalanceFn` | function | Yes | Server action to fetch balance |
| `callbacks` | `PreviewCallbacks` | No | Event callbacks |
| `autoLoad` | `boolean` | No | Auto-load on mount (default: true) |

### Return Value

| Field | Type | Description |
|---|---|---|
| `previews` | `Record<string, WalletPreviewState>` | All preview states |
| `isLoading` | `boolean` | Initial load in progress |
| `hasError` | `boolean` | Any preview has error |
| `isAnyLoading` | `boolean` | Any wallet currently loading |
| `allReady` | `boolean` | All wallets ready |
| `loadPreviews` | `() => Promise<void>` | Load all previews |
| `loadPreview` | `(walletId, exchange) => Promise<void>` | Load single preview |
| `getPreview` | `(walletId) => WalletPreviewState \| undefined` | Get specific preview |
| `clearPreview` | `(walletId) => void` | Clear specific preview |
| `clearAllPreviews` | `() => void` | Clear all previews |
| `manager` | `BluvoPreviewManager` | Underlying manager instance |
