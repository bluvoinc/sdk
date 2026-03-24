---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

## QR Code Cache & Session Reuse

QR codes now persist across page refreshes — returning users see their QR code instantly without a network round-trip.

### What Changed

- **Exchange-only cache key**: The QR code cache is now keyed by exchange name alone (instead of exchange + walletId), so the cached QR code is found even before a new walletId is assigned on refresh.
- **Automatic walletId reuse**: When a cached QR code entry includes a walletId from a previous session, that walletId is automatically reused. This keeps the backend session valid and avoids orphaned wallet records.
- **Instant QR display on refresh**: Because the cache hit happens before any API call, the QR code renders immediately while the flow reconnects in the background.

### Migration Notes

No breaking changes. The `BluvoCacheOptions` and `BluvoCacheAdapter` interfaces are unchanged. Caching behavior improves automatically for users who already have caching enabled.
