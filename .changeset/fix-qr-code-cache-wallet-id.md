---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

## Fix QR Code Cache walletId Mismatch

Fixed a bug where `startQRCodeFlow` would silently override the caller's `flowOptions.walletId` with a stale walletId stored in the cached QR code entry. This caused `walletNotFound` errors when the cached wallet had expired or belonged to a different session.

### What Changed

- **walletId is never overridden from cache**: `flowOptions.walletId` is now always authoritative — the cache can only provide display data (the QR code image), never substitute identity.
- **walletId-aware cache validation**: Cached QR codes are only replayed when their stored walletId matches the caller's current walletId. Mismatched entries are evicted immediately.
- **Same-wallet refresh still instant**: When the walletId matches (e.g. page refresh with the same session), the cached QR code is still replayed instantly with no network round-trip — the fast-path behavior is preserved.

### Migration Notes

No breaking changes. The fix is purely internal to `BluvoFlowClient.startQRCodeFlow`. Caching behavior improves automatically — no configuration or code changes needed by consumers.
