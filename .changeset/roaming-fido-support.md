---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

## ROAMING_FIDO MFA Step Support

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
