# API Client Reference

## Authentication

Headers used:
- `x-bluvo-api-key` — Server-side only (BluvoClient)
- `x-bluvo-org-id` — Both clients
- `x-bluvo-project-id` — Both clients
- `x-bluvo-wallet-id` — Wallet-scoped REST calls, including withdrawals and trading

## Base URLs

| Environment | API Base | WS Base |
|---|---|---|
| Production | `https://api-bluvo.com` | `wss://api-bluvo.com` |
| Sandbox | `https://test.api-bluvo.com` | `wss://test.api-bluvo.com` |
| Dev | `http://localhost:8787` | `ws://localhost:8787` |
| Custom domain (string) | `https://{domain}` | `wss://{domain}` |
| Custom domain (object) | `https://{api}` | `wss://{ws}` |

## Factory Functions

```typescript
// Production
createClient({ orgId, projectId, apiKey, customDomain? })
createWebClient({ orgId, projectId, customDomain? })

// Sandbox
createSandboxClient({ orgId, projectId, apiKey, customDomain? })
createSandboxWebClient({ orgId, projectId, customDomain? })

// Development
createDevClient({ orgId, projectId, apiKey, customDomain? })
createDevWebClient({ orgId, projectId, customDomain? })
```

customDomain type: `string | "api-bluvo.com" | { api: string; ws: string }`

## BluvoClient API Surface (Server-side)

Requires `apiKey`. Never use in browser.

### Wallet Operations
- `wallet.get(walletId: string)` — Get wallet details including balances, connection status
- `wallet.ping(walletId: string)` — Ping/validate wallet connection. Returns `{ status: "SUCCESS" | "INVALID_API_CREDENTIALS" }`
- `wallet.delete(walletId: string)` — Permanently delete a wallet connection
- `wallet.list(page?, limit?, exchange?)` — List all connected wallets with pagination
- `wallet.transaction.list(walletId?, page?, limit?, sinceDate?)` — List wallet transactions

### Withdrawal Operations
- `wallet.withdrawals.getWithdrawableBalance(walletId, query?)` — Get withdrawable balances with network info
- `wallet.withdrawals.requestQuotation(walletId, body)` — Request a withdrawal quote. Body: `{ asset, amount, address, network?, tag?, includeFee? }`
- `wallet.withdrawals.executeWithdrawal(walletId, idem, quotationId, body)` — Execute a withdrawal. Body: `{ twofa?, emailCode?, smsCode?, bizNo?, tag?, params?: { dryRun? } }`

### Trading Operations
- `wallet.trading.getTradableAssets(walletId)` — Get normalized tradable assets and routes for the wallet exchange. Calls `GET /v0/wallet/trade/tradable-assets` with `x-bluvo-wallet-id`.
- `wallet.trading.placeOrder(walletId, body)` — Place a single trade order. Calls `POST /v0/wallet/trade/order` with body `{ routeId, side, type, volume, price? }`.
- `wallet.trading.getOrder(walletId, orderId)` — Query normalized order status. Calls `GET /v0/wallet/trade/order/{orderId}` and returns status plus execution details.

`getTradableAssets()` is wallet-scoped in the high-level client. The generated low-level endpoint also supports exchange-only lookup and filtering query params: `exchange`, `sources`, and `destinations`. `sources` and `destinations` are comma-separated asset symbols, for example `sources=DOGE,USDC&destinations=USDT,BTC`.

The current auto-swap flow uses these operations in order:

1. Load wallet balances with `wallet.withdrawals.getWithdrawableBalance(walletId)`.
2. Load tradable routes with `wallet.trading.getTradableAssets(walletId)`.
3. Place the desired order once with `wallet.trading.placeOrder(walletId, body)`.
4. Poll `wallet.trading.getOrder(walletId, orderId)` until status is `filled`.
5. Reload wallet balances so the destination asset can be quoted.
6. Continue with `requestQuotation()` and `executeWithdrawal()`.

Trade order response shape:

```typescript
type PlaceOrderResponse = {
  orderId: string;
  txid: string[];
  exchange: string;
  routeId: string;
  description: string;
  rawResponse?: unknown;
};
```

Order status response shape:

```typescript
type GetOrderResponse = {
  orderId: string;
  exchange: string;
  status: "open" | "filled" | "canceled" | "expired" | "unknown";
  rawStatus: string;
  volume?: string;
  executedVolume?: string;
  cost?: string;
  averagePrice?: string;
  fee?: string;
  openedAt?: number;
  closedAt?: number;
  description?: { pair?: string; side?: string; type?: string };
  rawResponse?: unknown;
};
```

### OAuth2 Operations
- `oauth2.getLink(exchange, walletId, idem)` — Get OAuth2 URL for an exchange
- `oauth2.listExchanges(status?)` — List available exchanges. Returns array of `{ id, name, logoUrl, status }`

## BluvoWebClient API Surface (Browser)

No API key needed. Safe for client-side use.

### OAuth2
- `oauth2.openWindow(exchange, options, hooks?, popupOptions?, windowRef?)` — Opens OAuth popup. Returns cleanup function.
  - options: `{ walletId: string; idem: string }`
  - hooks: `{ onWindowClose?: () => void }`
  - popupOptions: `{ title?, width?, height?, left?, top? }`
- `oauth2.getURL(exchange, { walletId, idem })` — Get OAuth URL without opening window. Returns `{ url, data, success, error }`

### WebSocket / Real-time
- `listen(topicName, options)` — Subscribe to real-time updates via WebSocket
  - For OAuth: `{ onOAuth2Complete, onError?, onStep?, onQRCodeReceived?, onQRCodeComplete?, onQRCodeError? }`
  - For Withdrawals: `{ onWithdrawComplete, onError?, onStep? }`
- `unsubscribe(topicName)` — Unsubscribe from a topic
- `unsubscribeAll()` — Unsubscribe from all topics
- `isSubscribed(topicName)` — Check subscription status
- `getActiveSubscriptionCount()` — Get number of active subscriptions

## Error Codes

All error codes from ERROR_CODES constant:

| Category | Code | Description |
|---|---|---|
| Generic | `GENERIC_NOT_FOUND` | Resource not found |
| Generic | `GENERIC_UNAUTHORIZED` | Unauthorized access |
| Generic | `GENERIC_INTERNAL_SERVER_ERROR` | Internal server error |
| Generic | `GENERIC_VALIDATION_ERROR` | Validation error |
| Generic | `GENERIC_INVALID_REQUEST` | Invalid request |
| API Key | `APIKEY_INSUFFICIENT_PERMISSIONS` | API key lacks required permissions |
| Wallet | `WALLET_NOT_FOUND` | Wallet not found |
| Wallet | `WALLET_INVALID_CREDENTIALS` | Invalid wallet credentials |
| Trading | `APIKEY_INSUFFICIENT_PERMISSIONS` | Project API key lacks trading permissions |
| Trading | `GENERIC_VALIDATION_ERROR` | Invalid route, side, type, volume, or filter |
| Trading | `GENERIC_INVALID_REQUEST` | Exchange rejected or could not normalize the trade request |
| Quote | `QUOTE_NOT_FOUND` | Quote not found |
| Quote | `QUOTE_EXPIRED` | Quote has expired |
| Withdrawal - Balance | `WITHDRAWAL_INSUFFICIENT_BALANCE` | Insufficient balance |
| Withdrawal - Balance | `WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE` | Can't cover fee |
| Withdrawal - Address | `WITHDRAWAL_INVALID_ADDRESS` | Invalid withdrawal address |
| Withdrawal - Address | `WITHDRAWAL_NETWORK_NOT_SUPPORTED` | Network not supported |
| Withdrawal - Address | `WITHDRAWAL_TOO_MANY_ADDRESSES` | Too many addresses |
| Withdrawal - Amount | `WITHDRAWAL_AMOUNT_BELOW_MINIMUM` | Amount below minimum |
| Withdrawal - Amount | `WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM` | Amount above maximum |
| Withdrawal - Asset | `WITHDRAWAL_ASSET_NOT_SUPPORTED` | Asset not supported |
| Withdrawal - Provider | `WITHDRAWAL_PROVIDER_ERROR` | Provider error |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_TOTP` | TOTP 2FA required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_SMS` | SMS 2FA required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_FACE_RECOGNITION` | Face recognition required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_EMAIL` | Email verification required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_YUBIKEY` | Yubikey required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_PASSPHRASE` | Passphrase required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS` | Multi-step 2FA required |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_INCOMPLETE` | Multi-step 2FA incomplete |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_INVALID` | Invalid 2FA code |
| Withdrawal - 2FA | `WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED` | 2FA method not supported |
| Withdrawal - Verification | `WITHDRAWAL_KYC_REQUIRED` | KYC required |
| Withdrawal - Verification | `WITHDRAWAL_EMAIL_UNVERIFIED` | Email not verified |
| Withdrawal - Rate Limit | `WITHDRAWAL_RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| OAuth | `OAUTH_AUTHORIZATION_FAILED` | OAuth authorization failed (recoverable) |
| OAuth | `OAUTH_TOKEN_EXCHANGE_FAILED` | OAuth token exchange failed (FATAL) |
| OAuth | `OAUTH_INVALID_STATE` | OAuth state mismatch |
| OAuth | `OAUTH_INSUFFICIENT_SCOPE` | Insufficient OAuth scope |
| Webhook | `WEBHOOK_SIGNATURE_INVALID` | Invalid webhook signature |
| Webhook | `WEBHOOK_MISSING_HEADERS` | Missing webhook headers |
| Webhook | `WEBHOOK_INVALID_TIMESTAMP` | Invalid webhook timestamp |
| Cache | `CACHE_MISS` | Cache miss |
| Cache | `CACHE_EXPIRED` | Cache expired |
| Cache | `CACHE_INVALID_PATH` | Invalid cache path |
| Special | `WITHDRAWAL_DRY_RUN_COMPLETE` | NOT an error — success signal for multi-step 2FA dry run |

## Error Extraction Utilities

```typescript
extractErrorCode(error: BluvoError): ErrorCode | null
// Checks: errorCode → type → code → serialized → legacy axios format

extractErrorTypeInfo(error: BluvoError): ErrorTypeInfo
// Returns { knownCode: ErrorCode | null, rawType: string | null }
// Use when you need the raw type even if it's not in ERROR_CODES

extractErrorResult(error: BluvoError): unknown
// Extracts the `result` payload from error objects (used for multi-step 2FA data)
```
