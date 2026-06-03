---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

Add beta support for Kraken-backed convert/trade flows before withdrawal.

This release exposes the new Trading API surface through the TypeScript SDK, the flow client state machine, and the React hook wrapper. Integrators can now build an auto-swap step that converts an available wallet asset into the asset they intend to withdraw, then continue through the existing quote and withdrawal flow once the order is filled.

The flow is:

1. Load wallet balances with the existing withdrawal balance flow.
2. Call `loadTradableAssets()` to invoke `GET /v0/wallet/trade/tradable-assets` for the active wallet. The response includes normalized assets, tradable routes, order types, status, and trading rules from refreshed exchange metadata.
3. Pick a route such as `kraken:spot:DOGE/USDC` and call `placeTradeOrder()` to invoke `POST /v0/wallet/trade/order`. The order request includes `routeId`, `side`, `type`, `volume`, and optional `price`. The API places one exchange order and returns the normalized `orderId` plus Kraken `txid`.
4. Call `pollTradeOrder(orderId)` to invoke `GET /v0/wallet/trade/order/{orderId}` until the normalized status becomes `filled`, `canceled`, or `expired`.
5. When the order is filled, the flow client refreshes the wallet balances by default, so the newly acquired asset is available for the normal `requestQuote()` and `executeWithdrawal()` steps.

The state machine now tracks dedicated trading states: `trade:assetsLoading`, `trade:assetsReady`, `trade:orderPlacing`, `trade:orderPlaced`, `trade:orderPolling`, `trade:orderFilled`, and `trade:orderError`. It also stores `tradableAssets`, the placed `tradeOrder`, the latest polled order status, and the last trade request in context.

React consumers using `useBluvoFlow()` get the same methods plus convenience flags such as `isTradableAssetsReady`, `isTradeOrderPlacing`, `isTradeOrderPolling`, `isTradeOrderFilled`, `isTradeOrderError`, and `isTrading`.
