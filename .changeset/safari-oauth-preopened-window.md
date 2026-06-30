---
"@bluvo/sdk-ts": minor
---

Add an optional `preOpenedWindow` to `WithdrawalFlowOptions` / `oauth2.openWindow`, plus a `popupOptions.showLoadingScreen` toggle, so a browser caller can open the OAuth popup **synchronously inside the click gesture** and hand it to the SDK to navigate.

Safari/iOS only honor `window.open()` during a user gesture's activation. Because `startWithdrawalFlow` awaits `getWalletByIdFn` and `listen` before reaching `openWindow`, the SDK opening the popup itself is blocked there. Callers can now open `about:blank` on click, pass it as `preOpenedWindow`, and render their own loader (with `showLoadingScreen: false`); the SDK navigates that window once it resolves the OAuth URL, and closes it on the resume / QR paths.

Purely additive and backward-compatible — callers that don't pass these options keep the existing behavior.
