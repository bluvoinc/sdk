---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

## QR Code Status Tracking

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
