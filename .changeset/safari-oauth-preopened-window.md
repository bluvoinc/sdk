---
"@bluvo/sdk-ts": minor
---

Add an optional `preOpenedWindow` to `WithdrawalFlowOptions` / `oauth2.openWindow`, plus a `popupOptions.showLoadingScreen` toggle, so a browser caller can open the OAuth popup **synchronously inside the click gesture** and hand it to the SDK to navigate.

Safari/iOS only honor `window.open()` during a user gesture's activation. Because `startWithdrawalFlow` awaits `getWalletByIdFn` and `listen` before reaching `openWindow`, the SDK opening the popup itself is blocked there. Callers can now open `about:blank` on click, pass it as `preOpenedWindow`, and render their own loader; the SDK navigates that window once it resolves the OAuth URL, and closes it on every path that doesn't use it — resume, QR, or any error thrown before the popup is navigated.

`showLoadingScreen` defaults to `false` when a `preOpenedWindow` is supplied (the caller usually rendered its own loader there, which the SDK must not overwrite) and `true` otherwise. When it is off, the built-in error page is suppressed too: on a failed OAuth-URL fetch the popup is closed instead of being overwritten.

Purely additive and backward-compatible — callers that don't pass these options keep the existing behavior.
