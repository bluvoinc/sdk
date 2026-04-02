# @bluvo/react

## 4.0.0

### Minor Changes

- 8265ce6: ## Fix QR Code Cache walletId Mismatch

  Fixed a bug where `startQRCodeFlow` would silently override the caller's `flowOptions.walletId` with a stale walletId stored in the cached QR code entry. This caused `walletNotFound` errors when the cached wallet had expired or belonged to a different session.

  ### What Changed

  - **walletId is never overridden from cache**: `flowOptions.walletId` is now always authoritative — the cache can only provide display data (the QR code image), never substitute identity.
  - **walletId-aware cache validation**: Cached QR codes are only replayed when their stored walletId matches the caller's current walletId. Mismatched entries are evicted immediately.
  - **Same-wallet refresh still instant**: When the walletId matches (e.g. page refresh with the same session), the cached QR code is still replayed instantly with no network round-trip — the fast-path behavior is preserved.

  ### Migration Notes

  No breaking changes. The fix is purely internal to `BluvoFlowClient.startQRCodeFlow`. Caching behavior improves automatically — no configuration or code changes needed by consumers.

- 8265ce6: ## Multi-Step 2FA Support for Binance Withdrawals

  Added comprehensive support for exchanges (like Binance) that require multiple verification factors during withdrawals.

  ### New Features

  **State Machine:**

  - New `withdraw:error2FAMultiStep` state when multi-factor verification is required
  - New `withdraw:readyToConfirm` state when all verification steps are completed
  - Automatic handling of GOOGLE (TOTP), EMAIL, SMS, and FACE verification steps
  - Support for `AND` (all required) and `OR` (any one) verification relations

  **React Hook (`useBluvoFlow`):**

  - `requires2FAMultiStep` - Boolean indicating multi-step 2FA is needed
  - `isReadyToConfirm` - Boolean indicating all steps verified
  - `multiStep2FASteps` - Array of verification steps with status
  - `mfaVerified` - Primary source of truth for step verification status
  - `submit2FAMultiStep(stepType, code)` - Submit code for GOOGLE/EMAIL/SMS steps
  - `pollFaceVerification()` - Poll for FACE verification completion
  - `confirmWithdrawal()` - Execute final withdrawal after all steps verified
  - Helper booleans: `hasGoogleStep`, `hasEmailStep`, `hasFaceStep`, `hasSmsStep`
  - Verification status: `isGoogleStepVerified`, `isEmailStepVerified`, etc.

  **TypeScript SDK (`BluvoFlowClient`):**

  - Same state machine and methods available for non-React implementations
  - Full TypeScript types for `MultiStep2FAContext` and related interfaces

  ### Migration Notes

  No breaking changes. Existing withdrawal flows continue to work. Multi-step 2FA UI is only needed when `requires2FAMultiStep` becomes true.

- 8265ce6: ## QR Code Cache & Session Reuse

  QR codes now persist across page refreshes — returning users see their QR code instantly without a network round-trip.

  ### What Changed

  - **Exchange-only cache key**: The QR code cache is now keyed by exchange name alone (instead of exchange + walletId), so the cached QR code is found even before a new walletId is assigned on refresh.
  - **Automatic walletId reuse**: When a cached QR code entry includes a walletId from a previous session, that walletId is automatically reused. This keeps the backend session valid and avoids orphaned wallet records.
  - **Instant QR display on refresh**: Because the cache hit happens before any API call, the QR code renders immediately while the flow reconnects in the background.

  ### Migration Notes

  No breaking changes. The `BluvoCacheOptions` and `BluvoCacheAdapter` interfaces are unchanged. Caching behavior improves automatically for users who already have caching enabled.

- 8265ce6: ## QR Code Status Tracking

  Added support for tracking QR code lifecycle status during OAuth flows for exchanges that use QR code authentication (e.g. Binance Web).

  ### New Features

  **State Machine & Flow Context:**

  - New `qrCodeStatus` field in flow context tracking the QR code lifecycle: `available`, `acquired`, `scanned`, `confirmed`, `used`, `expired`
  - New `qrCodeExpiresAt` field tracking QR code expiration timestamp
  - New `QRCODE_STATUS_UPDATED` event for real-time status transitions
  - Automatic QR code expiration handling with timeout timers

  **React Hook (`useBluvoFlow`):**

  - `qrCodeStatus` exposed in the hook return value for easy UI rendering based on QR code state

  **TypeScript SDK:**

  - `QRCodeStatus` type exported for type-safe status handling
  - `BluvoFlowClient` processes WebSocket messages to update QR code status in real-time
  - Handles all status transitions: new/available → scanned → confirmed, with expiration support

- 6d24e40: ## ROAMING_FIDO MFA Step Support

  Added support for ROAMING_FIDO as a verification step in multi-step 2FA flows (Binance).

  ### New Features

  **State Machine:**

  - New `ROAMING_FIDO` step type in multi-step 2FA flows
  - `pollRoamingFidoVerification()` method for background polling
  - Fixed: Polling (FACE and ROAMING_FIDO) no longer transitions to `withdraw:processing` — MFA UI stays visible during polling

  **React Hook (`useBluvoFlow`):**

  - `pollRoamingFidoVerification()` — poll for ROAMING_FIDO verification completion
  - `hasRoamingFidoStep` — boolean indicating ROAMING_FIDO step exists
  - `isRoamingFidoStepVerified` — verification status using mfa.verified as primary source

  **UI Behavior:**

  - ROAMING_FIDO shows "Complete the verification in your Binance App" message
  - Polling starts immediately (no initial delay, unlike FACE's 10s delay)
  - Polls every 5 seconds until verified
  - No QR code or code input — verification happens in the exchange's app

  ### Migration Notes

  No breaking changes. Existing multi-step 2FA flows continue to work. ROAMING_FIDO UI is only needed when `steps` array contains a step with `type: 'ROAMING_FIDO'`.

### Patch Changes

- Updated dependencies [8265ce6]
- Updated dependencies [8265ce6]
- Updated dependencies [8265ce6]
- Updated dependencies [8265ce6]
- Updated dependencies [6d24e40]
  - @bluvo/sdk-ts@4.0.0

## 3.0.0

### Minor Changes

- 670a274: ## Fix QR Code Cache walletId Mismatch

  Fixed a bug where `startQRCodeFlow` would silently override the caller's `flowOptions.walletId` with a stale walletId stored in the cached QR code entry. This caused `walletNotFound` errors when the cached wallet had expired or belonged to a different session.

  ### What Changed

  - **walletId is never overridden from cache**: `flowOptions.walletId` is now always authoritative — the cache can only provide display data (the QR code image), never substitute identity.
  - **walletId-aware cache validation**: Cached QR codes are only replayed when their stored walletId matches the caller's current walletId. Mismatched entries are evicted immediately.
  - **Same-wallet refresh still instant**: When the walletId matches (e.g. page refresh with the same session), the cached QR code is still replayed instantly with no network round-trip — the fast-path behavior is preserved.

  ### Migration Notes

  No breaking changes. The fix is purely internal to `BluvoFlowClient.startQRCodeFlow`. Caching behavior improves automatically — no configuration or code changes needed by consumers.

- 595827d: ## Multi-Step 2FA Support for Binance Withdrawals

  Added comprehensive support for exchanges (like Binance) that require multiple verification factors during withdrawals.

  ### New Features

  **State Machine:**

  - New `withdraw:error2FAMultiStep` state when multi-factor verification is required
  - New `withdraw:readyToConfirm` state when all verification steps are completed
  - Automatic handling of GOOGLE (TOTP), EMAIL, SMS, and FACE verification steps
  - Support for `AND` (all required) and `OR` (any one) verification relations

  **React Hook (`useBluvoFlow`):**

  - `requires2FAMultiStep` - Boolean indicating multi-step 2FA is needed
  - `isReadyToConfirm` - Boolean indicating all steps verified
  - `multiStep2FASteps` - Array of verification steps with status
  - `mfaVerified` - Primary source of truth for step verification status
  - `submit2FAMultiStep(stepType, code)` - Submit code for GOOGLE/EMAIL/SMS steps
  - `pollFaceVerification()` - Poll for FACE verification completion
  - `confirmWithdrawal()` - Execute final withdrawal after all steps verified
  - Helper booleans: `hasGoogleStep`, `hasEmailStep`, `hasFaceStep`, `hasSmsStep`
  - Verification status: `isGoogleStepVerified`, `isEmailStepVerified`, etc.

  **TypeScript SDK (`BluvoFlowClient`):**

  - Same state machine and methods available for non-React implementations
  - Full TypeScript types for `MultiStep2FAContext` and related interfaces

  ### Migration Notes

  No breaking changes. Existing withdrawal flows continue to work. Multi-step 2FA UI is only needed when `requires2FAMultiStep` becomes true.

- a4d86b4: ## QR Code Cache & Session Reuse

  QR codes now persist across page refreshes — returning users see their QR code instantly without a network round-trip.

  ### What Changed

  - **Exchange-only cache key**: The QR code cache is now keyed by exchange name alone (instead of exchange + walletId), so the cached QR code is found even before a new walletId is assigned on refresh.
  - **Automatic walletId reuse**: When a cached QR code entry includes a walletId from a previous session, that walletId is automatically reused. This keeps the backend session valid and avoids orphaned wallet records.
  - **Instant QR display on refresh**: Because the cache hit happens before any API call, the QR code renders immediately while the flow reconnects in the background.

  ### Migration Notes

  No breaking changes. The `BluvoCacheOptions` and `BluvoCacheAdapter` interfaces are unchanged. Caching behavior improves automatically for users who already have caching enabled.

- dca7807: ## QR Code Status Tracking

  Added support for tracking QR code lifecycle status during OAuth flows for exchanges that use QR code authentication (e.g. Binance Web).

  ### New Features

  **State Machine & Flow Context:**

  - New `qrCodeStatus` field in flow context tracking the QR code lifecycle: `available`, `acquired`, `scanned`, `confirmed`, `used`, `expired`
  - New `qrCodeExpiresAt` field tracking QR code expiration timestamp
  - New `QRCODE_STATUS_UPDATED` event for real-time status transitions
  - Automatic QR code expiration handling with timeout timers

  **React Hook (`useBluvoFlow`):**

  - `qrCodeStatus` exposed in the hook return value for easy UI rendering based on QR code state

  **TypeScript SDK:**

  - `QRCodeStatus` type exported for type-safe status handling
  - `BluvoFlowClient` processes WebSocket messages to update QR code status in real-time
  - Handles all status transitions: new/available → scanned → confirmed, with expiration support

### Patch Changes

- Updated dependencies [670a274]
- Updated dependencies [595827d]
- Updated dependencies [a4d86b4]
- Updated dependencies [dca7807]
  - @bluvo/sdk-ts@3.0.0

## 3.0.0-beta.2

### Minor Changes

- a4d86b4: ## QR Code Cache & Session Reuse

  QR codes now persist across page refreshes — returning users see their QR code instantly without a network round-trip.

  ### What Changed

  - **Exchange-only cache key**: The QR code cache is now keyed by exchange name alone (instead of exchange + walletId), so the cached QR code is found even before a new walletId is assigned on refresh.
  - **Automatic walletId reuse**: When a cached QR code entry includes a walletId from a previous session, that walletId is automatically reused. This keeps the backend session valid and avoids orphaned wallet records.
  - **Instant QR display on refresh**: Because the cache hit happens before any API call, the QR code renders immediately while the flow reconnects in the background.

  ### Migration Notes

  No breaking changes. The `BluvoCacheOptions` and `BluvoCacheAdapter` interfaces are unchanged. Caching behavior improves automatically for users who already have caching enabled.

### Patch Changes

- Updated dependencies [a4d86b4]
  - @bluvo/sdk-ts@3.0.0-beta.2

## 3.0.0-beta.1

### Minor Changes

- ## QR Code Status Tracking

  Added support for tracking QR code lifecycle status during OAuth flows for exchanges that use QR code authentication (e.g. Binance Web).

  ### New Features

  **State Machine & Flow Context:**

  - New `qrCodeStatus` field in flow context tracking the QR code lifecycle: `available`, `acquired`, `scanned`, `confirmed`, `used`, `expired`
  - New `qrCodeExpiresAt` field tracking QR code expiration timestamp
  - New `QRCODE_STATUS_UPDATED` event for real-time status transitions
  - Automatic QR code expiration handling with timeout timers

  **React Hook (`useBluvoFlow`):**

  - `qrCodeStatus` exposed in the hook return value for easy UI rendering based on QR code state

  **TypeScript SDK:**

  - `QRCodeStatus` type exported for type-safe status handling
  - `BluvoFlowClient` processes WebSocket messages to update QR code status in real-time
  - Handles all status transitions: new/available → scanned → confirmed, with expiration support

### Patch Changes

- Updated dependencies
  - @bluvo/sdk-ts@3.0.0-beta.1

## 2.2.0-beta.0

### Minor Changes

- ## Multi-Step 2FA Support for Binance Withdrawals

  Added comprehensive support for exchanges (like Binance) that require multiple verification factors during withdrawals.

  ### New Features

  **State Machine:**

  - New `withdraw:error2FAMultiStep` state when multi-factor verification is required
  - New `withdraw:readyToConfirm` state when all verification steps are completed
  - Automatic handling of GOOGLE (TOTP), EMAIL, SMS, and FACE verification steps
  - Support for `AND` (all required) and `OR` (any one) verification relations

  **React Hook (`useBluvoFlow`):**

  - `requires2FAMultiStep` - Boolean indicating multi-step 2FA is needed
  - `isReadyToConfirm` - Boolean indicating all steps verified
  - `multiStep2FASteps` - Array of verification steps with status
  - `mfaVerified` - Primary source of truth for step verification status
  - `submit2FAMultiStep(stepType, code)` - Submit code for GOOGLE/EMAIL/SMS steps
  - `pollFaceVerification()` - Poll for FACE verification completion
  - `confirmWithdrawal()` - Execute final withdrawal after all steps verified
  - Helper booleans: `hasGoogleStep`, `hasEmailStep`, `hasFaceStep`, `hasSmsStep`
  - Verification status: `isGoogleStepVerified`, `isEmailStepVerified`, etc.

  **TypeScript SDK (`BluvoFlowClient`):**

  - Same state machine and methods available for non-React implementations
  - Full TypeScript types for `MultiStep2FAContext` and related interfaces

  ### Migration Notes

  No breaking changes. Existing withdrawal flows continue to work. Multi-step 2FA UI is only needed when `requires2FAMultiStep` becomes true.

### Patch Changes

- Updated dependencies
  - @bluvo/sdk-ts@2.2.0-beta.0
