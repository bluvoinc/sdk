# @bluvo/sdk-ts

## 5.1.0-beta.0

### Minor Changes

- 3452b96: Add beta support for Kraken-backed convert/trade flows before withdrawal.

  This release exposes the new Trading API surface through the TypeScript SDK, the flow client state machine, and the React hook wrapper. Integrators can now build an auto-swap step that converts an available wallet asset into the asset they intend to withdraw, then continue through the existing quote and withdrawal flow once the order is filled.

  The flow is:

  1. Load wallet balances with the existing withdrawal balance flow.
  2. Call `loadTradableAssets()` to invoke `GET /v0/wallet/trade/tradable-assets` for the active wallet. The response includes normalized assets, tradable routes, order types, status, and trading rules from refreshed exchange metadata.
  3. Pick a route such as `kraken:spot:DOGE/USDC` and call `placeTradeOrder()` to invoke `POST /v0/wallet/trade/order`. The order request includes `routeId`, `side`, `type`, `volume`, and optional `price`. The API places one exchange order and returns the normalized `orderId` plus Kraken `txid`.
  4. Call `pollTradeOrder(orderId)` to invoke `GET /v0/wallet/trade/order/{orderId}` until the normalized status becomes `filled`, `canceled`, or `expired`.
  5. When the order is filled, the flow client refreshes the wallet balances by default, so the newly acquired asset is available for the normal `requestQuote()` and `executeWithdrawal()` steps.

  The state machine now tracks dedicated trading states: `trade:assetsLoading`, `trade:assetsReady`, `trade:orderPlacing`, `trade:orderPlaced`, `trade:orderPolling`, `trade:orderFilled`, and `trade:orderError`. It also stores `tradableAssets`, the placed `tradeOrder`, the latest polled order status, and the last trade request in context.

  React consumers using `useBluvoFlow()` get the same methods plus convenience flags such as `isTradableAssetsReady`, `isTradeOrderPlacing`, `isTradeOrderPolling`, `isTradeOrderFilled`, `isTradeOrderError`, and `isTrading`.

- 3555d6c: Document the KuCoin integration in the agent skill docs (`packages/ts/skill/` and `packages/react/skill/`), with a focus on the withdrawal step.

  KuCoin's broker withdrawal API validates every 2FA factor in a single call — there is no incremental per-factor verification. Re-executing the withdrawal with a partial factor set (e.g. only the Google code when EMAIL + GOOGLE are required with relation `AND`) makes KuCoin answer `200000` with no ids and the challenge dies server-side. The SDK therefore batch-collects codes for exchanges in `BATCH_2FA_VALIDATION_EXCHANGES` (currently `['kucoin']`), and the skill docs previously did not explain this: an agent reading only the docs would conclude that every `submit2FAMultiStep()` call triggers an immediate dry-run round-trip, which is exactly backwards for KuCoin.

  What the docs now cover:

  - **`@bluvo/sdk-ts` skill** (`skill/SKILL.md`): the `submit2FAMultiStep()` action doc now distinguishes incremental exchanges (binance-web, bybit-web) from batch-validation exchanges (KuCoin), and a new Gotcha explains the `COLLECT_2FA_MULTI_STEP` action — codes are stored locally (`GOOGLE` → `twofa`, `EMAIL` → `emailCode`, `SMS` → `smsCode`), the step is marked `success` locally so the UI advances, and the withdrawal endpoint is called exactly once with `bizNo` + all collected codes after the last required code arrives. Steps already `mfa.verified` count as satisfied; FACE/ROAMING_FIDO are excluded (poll-verified); relation `OR` keeps immediate re-execution.
  - **`@bluvo/sdk-ts` skill reference** (`skill/references/state-transitions.md`): new `COLLECT_2FA_MULTI_STEP` transition-table row and a dedicated "Multi-step 2FA (KuCoin — batch factor validation)" sequence diagram showing the single `executeWithdrawal` call.
  - **`@bluvo/react` skill** (`skill/SKILL.md`): new Gotcha with the UI implications — do not render a locally-collected KuCoin step as "backend verified" (an invalid code only surfaces after the final batch call as `WITHDRAWAL_2FA_INVALID`), and do not expect `isWithdrawProcessing`/`mfaVerified` updates between KuCoin code submissions.
  - **`@bluvo/react` skill reference** (`skill/references/multistep-2fa.md`): new "Exchange Verification Models" section with an incremental-vs-batch comparison table, a KuCoin-specific state machine lifecycle diagram, the `{ collected: true, awaitingSteps }` return shape, and a UI labeling caveat ("Code entered" vs "Verified"). The existing lifecycle and dryRun sections are now explicitly scoped to incremental exchanges.
  - **`AGENTS.md`**: new "Exchange-Specific Behavior" architecture section covering `QR_CODE_EXCHANGES` and `BATCH_2FA_VALIDATION_EXCHANGES`, pointing at the spec test (`packages/ts/test/machines/BluvoFlowClient.submit2FAMultiStep.test.ts`) and requiring skill docs to be kept in sync with exchange-specific behavior changes.

  No runtime code changes — documentation only.

### Patch Changes

- 0b4203e: Collect all required 2FA codes before re-executing KuCoin withdrawals.

  KuCoin's broker withdrawal API validates every 2FA factor in a single call: re-executing with a partial factor set (e.g. only the Google code when email + Google are both required with relation AND) makes KuCoin answer `200000` with no ids and the challenge dies, which previously surfaced as a fatal `KuCoin withdrawal failed: unexpected response shape` error.

  `submit2FAMultiStep` now stores each code locally (new `COLLECT_2FA_MULTI_STEP` action, which marks the step done so the UI advances) and only calls the withdrawal endpoint once every required code-based step has a collected code. Exchanges with incremental server-side verification (binance-web, bybit-web) keep the existing per-step re-execution behavior.

## 5.0.0

### Minor Changes

- 614a498: Add Bybit Web exchange support and Roaming FIDO passkey MFA

  - Added `bybit-web` as a QR code exchange (schemas, types, and `QR_CODE_EXCHANGES`)
  - Added `ROAMING_FIDO` MFA method for passkey-based verification
  - Added `roamingFlowId` field to withdrawal response/error types
  - Added new OAuth error types: `OAUTH_COUNTRY_NOT_DETECTED`, `OAUTH_COUNTRY_NOT_SUPPORTED`, `OAUTH_COUNTRY_CODE_INVALID`

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
