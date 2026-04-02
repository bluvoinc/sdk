# State Transition Reference

## Transition Map

### idle
| Action | Next State | Context Updates |
|---|---|---|
| `LOAD_EXCHANGES` | `exchanges:loading` | — |
| `START_OAUTH` | `oauth:waiting` | `exchange`, `walletId`, `idempotencyKey`, `topicName`, `isQRCodeFlow: false` |
| `START_QRCODE` | `qrcode:waiting` | `exchange`, `walletId`, `idempotencyKey`, `topicName`, `isQRCodeFlow: true` |

### exchanges:loading
| Action | Next State | Context Updates |
|---|---|---|
| `EXCHANGES_LOADED` | `exchanges:ready` | `exchanges` |
| `EXCHANGES_FAILED` | `exchanges:error` | error set |

### exchanges:ready
| Action | Next State | Context Updates |
|---|---|---|
| `START_OAUTH` | `oauth:waiting` | `exchange`, `walletId`, `idempotencyKey`, `topicName`, `isQRCodeFlow: false` |
| `START_QRCODE` | `qrcode:waiting` | `exchange`, `walletId`, `idempotencyKey`, `topicName`, `isQRCodeFlow: true` |

### oauth:waiting
| Action | Next State |
|---|---|
| `OAUTH_WINDOW_OPENED` | `oauth:processing` |

### oauth:processing
| Action | Next State | Notes |
|---|---|---|
| `OAUTH_COMPLETED` | `oauth:completed` | Sets `walletId` |
| `OAUTH_FAILED` | `oauth:error` | `oauthErrorType: 'recoverable'` |
| `OAUTH_FATAL` | `oauth:fatal` | `oauthErrorType: 'fatal'` |
| `OAUTH_WINDOW_CLOSED_BY_USER` | `oauth:window_closed_by_user` | — |

### oauth:completed
| Action | Next State |
|---|---|
| `LOAD_WALLET` | `wallet:loading` |

### qrcode:waiting
| Action | Next State | Notes |
|---|---|---|
| `QRCODE_URL_RECEIVED` | `qrcode:displaying` | Sets `qrCodeUrl`, `qrCodeExpiresAt`, `qrCodeStatus: 'available'` |
| `QRCODE_FAILED` | `qrcode:error` | — |
| `QRCODE_FATAL` | `qrcode:fatal` | — |

### qrcode:displaying
| Action | Next State | Notes |
|---|---|---|
| `QRCODE_STATUS_UPDATED` | `qrcode:displaying` | Updates status and expiresAt |
| `QRCODE_SCANNED` | `qrcode:scanning` | `qrCodeStatus: 'scanned'` |
| `QRCODE_COMPLETED` | `oauth:completed` | Reuses OAuth wallet loading flow |
| `QRCODE_TIMEOUT` | `qrcode:timeout` | — |
| `QRCODE_FAILED` | `qrcode:error` | — |
| `QRCODE_FATAL` | `qrcode:fatal` | — |

### qrcode:scanning
| Action | Next State |
|---|---|
| `QRCODE_STATUS_UPDATED` | `qrcode:scanning` |
| `QRCODE_COMPLETED` | `oauth:completed` |
| `QRCODE_FAILED` | `qrcode:error` |
| `QRCODE_FATAL` | `qrcode:fatal` |

### qrcode:error, qrcode:timeout
| Action | Next State | Notes |
|---|---|---|
| `REFRESH_QRCODE` | `qrcode:waiting` | Clears QR code context |

### wallet:loading
| Action | Next State |
|---|---|
| `WALLET_LOADED` | `wallet:ready` |
| `WALLET_FAILED` | `wallet:error` |

### wallet:ready
| Action | Next State | Notes |
|---|---|---|
| `REQUEST_QUOTE` | `quote:requesting` | Sets `lastQuoteRequest` |

### quote:requesting
| Action | Next State |
|---|---|
| `QUOTE_RECEIVED` | `quote:ready` |
| `QUOTE_FAILED` | `quote:error` |

### quote:ready
| Action | Next State | Notes |
|---|---|---|
| `REQUEST_QUOTE` | `quote:requesting` | Clears old quote, for auto-refresh |
| `QUOTE_EXPIRED` | `quote:expired` | — |
| `START_WITHDRAWAL` | `withdraw:processing` | Creates nested withdrawal machine |

### quote:expired
| Action | Next State |
|---|---|
| `REQUEST_QUOTE` | `quote:requesting` |

### Withdrawal States (all handled by handleWithdrawalStates)

Active withdrawal states: `withdraw:processing`, `withdraw:error2FA`, `withdraw:error2FAMultiStep`, `withdraw:errorSMS`, `withdraw:errorKYC`, `withdraw:errorBalance`, `withdraw:retrying`, `withdraw:readyToConfirm`

**Sync from nested withdrawal machine:**
- Withdrawal machine `waitingFor2FA` → flow `withdraw:error2FA`
- Withdrawal machine `waitingForSMS` → flow `withdraw:errorSMS`
- Withdrawal machine `waitingForKYC` → flow `withdraw:errorKYC`
- Withdrawal machine `completed` + `WITHDRAWAL_COMPLETED` → flow `withdraw:completed`
- Withdrawal machine `blocked` + `WITHDRAWAL_BLOCKED` → flow `withdraw:blocked`
- Withdrawal machine `failed` → flow `withdraw:fatal`
- Withdrawal machine `retrying` → flow `withdraw:retrying`

**Direct actions in withdrawal states:**

| Current State | Action | Next State | Notes |
|---|---|---|---|
| `withdraw:error2FA` | `SUBMIT_2FA` | `withdraw:processing` | Resets `invalid2FAAttempts` |
| `withdraw:errorSMS` | `SUBMIT_SMS` | `withdraw:processing` | — |
| `withdraw:retrying` | `RETRY_WITHDRAWAL` | `withdraw:processing` | — |
| any withdrawal | `WITHDRAWAL_2FA_INVALID` | `withdraw:error2FA` | Increments `invalid2FAAttempts` |
| any withdrawal | `WITHDRAWAL_INSUFFICIENT_BALANCE` | `withdraw:errorBalance` | — |
| any withdrawal | `WITHDRAWAL_REQUIRES_2FA` | `withdraw:error2FA` | Via withdrawal machine |
| any withdrawal | `WITHDRAWAL_REQUIRES_SMS` | `withdraw:errorSMS` | Via withdrawal machine |
| any withdrawal | `WITHDRAWAL_REQUIRES_KYC` | `withdraw:errorKYC` | Via withdrawal machine |
| any withdrawal | `WITHDRAWAL_REQUIRES_2FA_MULTI_STEPS` | `withdraw:error2FAMultiStep` | Sets `multiStep2FA` context |
| `withdraw:error2FAMultiStep` | `SUBMIT_2FA_MULTI_STEP` | `withdraw:processing` | Stores code in `collectedCodes` |
| `withdraw:error2FAMultiStep` | `POLL_FACE_VERIFICATION` | `withdraw:processing` | — |
| `withdraw:error2FAMultiStep` | `POLL_ROAMING_FIDO_VERIFICATION` | `withdraw:processing` | — |
| any withdrawal | `WITHDRAWAL_2FA_INCOMPLETE` | `withdraw:error2FAMultiStep` | Updates steps and MFA verified state |
| any withdrawal | `WITHDRAWAL_DRY_RUN_COMPLETE` | `withdraw:readyToConfirm` | All 2FA steps verified |
| any withdrawal | `CONFIRM_WITHDRAWAL` | `withdraw:processing` | — |
| any withdrawal | `WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED` | `withdraw:fatal` | Sets `errorDetails.valid2FAMethods` |
| any withdrawal | `WITHDRAWAL_SUCCESS` | (synced via machine) | — |
| any withdrawal | `WITHDRAWAL_FATAL` | `withdraw:fatal` | — |

### Global Action (from ANY state)
| Action | Next State | Notes |
|---|---|---|
| `CANCEL_FLOW` | `flow:cancelled` | Highest priority. Disposes withdrawal machine. |

## Sequence Diagrams

### Happy Path: OAuth → Withdrawal

```
idle
  │ LOAD_EXCHANGES
  ▼
exchanges:loading
  │ EXCHANGES_LOADED
  ▼
exchanges:ready
  │ START_OAUTH
  ▼
oauth:waiting
  │ OAUTH_WINDOW_OPENED
  ▼
oauth:processing
  │ OAUTH_COMPLETED (via WebSocket)
  ▼
oauth:completed
  │ LOAD_WALLET (auto)
  ▼
wallet:loading
  │ WALLET_LOADED
  ▼
wallet:ready
  │ REQUEST_QUOTE
  ▼
quote:requesting
  │ QUOTE_RECEIVED
  ▼
quote:ready
  │ START_WITHDRAWAL
  ▼
withdraw:processing
  │ WITHDRAWAL_SUCCESS + WITHDRAWAL_COMPLETED (via WebSocket)
  ▼
withdraw:completed
```

### QR Code Path

```
idle
  │ START_QRCODE (auto-detected for 'binance-web')
  ▼
qrcode:waiting
  │ QRCODE_URL_RECEIVED (via WebSocket)
  ▼
qrcode:displaying
  │ QRCODE_SCANNED
  ▼
qrcode:scanning
  │ QRCODE_COMPLETED (via WebSocket)
  ▼
oauth:completed  ← reuses existing wallet loading flow
  │ LOAD_WALLET (auto)
  ▼
wallet:loading → ... same as OAuth path
```

### 2FA Recovery

```
withdraw:processing
  │ WITHDRAWAL_REQUIRES_2FA (via error code WITHDRAWAL_2FA_REQUIRED_TOTP)
  ▼
withdraw:error2FA
  │ SUBMIT_2FA (user provides code)
  ▼
withdraw:processing
  │ WITHDRAWAL_SUCCESS + WITHDRAWAL_COMPLETED
  ▼
withdraw:completed
```

### Multi-step 2FA (Binance Web)

```
withdraw:processing
  │ WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS (via error)
  ▼
withdraw:error2FAMultiStep
  │ SUBMIT_2FA_MULTI_STEP (GOOGLE, code)
  ▼
withdraw:processing
  │ WITHDRAWAL_2FA_INCOMPLETE (returns updated steps)
  ▼
withdraw:error2FAMultiStep
  │ SUBMIT_2FA_MULTI_STEP (EMAIL, code)
  ▼
withdraw:processing
  │ WITHDRAWAL_DRY_RUN_COMPLETE (all steps verified)
  ▼
withdraw:readyToConfirm
  │ CONFIRM_WITHDRAWAL
  ▼
withdraw:processing
  │ WITHDRAWAL_SUCCESS + WITHDRAWAL_COMPLETED (via WebSocket)
  ▼
withdraw:completed
```

### Error Recovery

```
withdraw:processing
  │ FAIL (withdrawal machine)
  ▼
withdraw:retrying  (if retryCount < maxRetries)
  │ RETRY_WITHDRAWAL
  ▼
withdraw:processing
  │ ... success or fail again
```

### Quote Auto-Refresh

```
quote:ready
  │ (timer expires while in quote:ready)
  │ if autoRefreshQuotation === true (default):
  │   → calls requestQuote() automatically
  ▼
quote:requesting
  │ QUOTE_RECEIVED (new quote)
  ▼
quote:ready  ← seamless refresh

  │ if autoRefreshQuotation === false:
  │   → QUOTE_EXPIRED
  ▼
quote:expired
  │ REQUEST_QUOTE (manual)
  ▼
quote:requesting
```

## Important Notes

- **Polling methods skip state machine send**: `pollFaceVerification()` and `pollRoamingFidoVerification()` intentionally skip the state machine `send()` to avoid transitioning to `withdraw:processing` during background polling. The MFA UI stays visible throughout polling.
- **No-op transitions**: If an action is sent in a state where it's not handled, the state machine returns the current state unchanged. No error is thrown.
- **CANCEL_FLOW priority**: The `CANCEL_FLOW` action is checked before any state-specific handler and works from ANY state.
- **Nested withdrawal machine**: The flow machine creates a nested withdrawal machine when `START_WITHDRAWAL` is sent. The withdrawal machine manages retry logic and 2FA state.
- **QR code → OAuth completed**: The QR code flow transitions to `oauth:completed` when the QR code is scanned and confirmed, reusing the existing wallet loading path.
- **Auto-detected QR code**: `startWithdrawalFlow()` automatically detects `binance-web` exchange and routes to QR code flow instead of OAuth popup.
- **Cache replay**: Cached QR codes are replayed immediately on `startQRCodeFlow()` to avoid re-fetching. WebSocket still subscribes for status updates.
