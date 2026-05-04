---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

Add Bybit Web exchange support and Roaming FIDO passkey MFA

- Added `bybit-web` as a QR code exchange (schemas, types, and `QR_CODE_EXCHANGES`)
- Added `ROAMING_FIDO` MFA method for passkey-based verification
- Added `roamingFlowId` field to withdrawal response/error types
- Added new OAuth error types: `OAUTH_COUNTRY_NOT_DETECTED`, `OAUTH_COUNTRY_NOT_SUPPORTED`, `OAUTH_COUNTRY_CODE_INVALID`
