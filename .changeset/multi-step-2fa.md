---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

## Multi-Step 2FA Support for Binance Withdrawals

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
