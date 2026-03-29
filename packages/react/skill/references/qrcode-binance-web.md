# QR Code Authentication — `binance-web`

> Deep-dive reference for AI agents building QR code authentication UIs for the `binance-web` exchange.

---

## 1. Overview

Binance Web uses QR code authentication instead of OAuth popup windows. The user scans a QR code with the Binance mobile app to connect their wallet.

`QR_CODE_EXCHANGES = ['binance-web']` — auto-detected by `startWithdrawalFlow()`.

| | OAuth Flow | QR Code Flow |
|---|---|---|
| Exchange | Most CEXs | `binance-web` |
| Auth method | Browser popup | QR code scan via mobile app |
| `closeOAuthWindow` | Returns popup `Window` ref | Returns `null` |
| `isQRCodeFlow` | `false` | `true` |
| State prefix | `oauth:*` | `qrcode:*` |
| Completion | Popup closes automatically | WebSocket confirms scan |

Key: `startWithdrawalFlow()` checks the exchange name and dispatches either `START_OAUTH` or `START_QRCODE` — no caller logic needed.

---

## 2. QRCodeStatus Lifecycle

Six status values delivered via WebSocket messages:

```typescript
type QRCodeStatus = 'available' | 'acquired' | 'scanned' | 'confirmed' | 'expired' | 'used';
```

### Progression

```
available → acquired → scanned → confirmed → (wallet connected)
                                            → expired  (timeout)
                                            → used     (already consumed)
```

| Status | Meaning | UI Guidance |
|--------|---------|-------------|
| `available` | QR code generated and ready | Show QR code image |
| `acquired` | Backend reserved the QR code | Keep showing QR code |
| `scanned` | User scanned with mobile app | Show spinner overlay + "Confirming..." |
| `confirmed` | Backend verified the scan | Show green checkmark + "Confirmed" |
| `expired` | QR code timed out | Show red X + "Expired", offer refresh |
| `used` | QR code already consumed | Show red X + "Expired", offer refresh |

`qrCodeStatus` is a field on `FlowContext`, exposed via `flow.qrCodeStatus` in React.

---

## 3. State Machine States

### Full State Flow

```
idle
  → qrcode:waiting        (START_QRCODE dispatched)
  → qrcode:displaying     (QRCODE_URL_RECEIVED — QR code URL arrives via WebSocket)
  → qrcode:scanning       (QRCODE_SCANNED — user scanned the code)
  → oauth:completed        (QRCODE_COMPLETED — wallet connected, reuses OAuth path)
  → wallet:loading         (automatic — SDK calls loadWallet)
  → wallet:ready           (WALLET_LOADED)
  → quote:requesting → quote:ready → withdraw:*

Error paths from qrcode:displaying:
  → qrcode:timeout         (QRCODE_TIMEOUT — QR code expired)
  → qrcode:error           (QRCODE_FAILED — recoverable error)
  → qrcode:fatal           (QRCODE_FATAL — unrecoverable, must restart flow)

Recovery from timeout/error:
  qrcode:timeout → REFRESH_QRCODE → qrcode:waiting → qrcode:displaying
  qrcode:error   → REFRESH_QRCODE → qrcode:waiting → qrcode:displaying
```

### State Reference

| State | Meaning | Context Fields Available | UI Action | Transitions Out |
|-------|---------|-------------------------|-----------|-----------------|
| `qrcode:waiting` | Backend generating QR code | `exchange`, `walletId`, `isQRCodeFlow` | Loading spinner | `qrcode:displaying`, `qrcode:fatal` |
| `qrcode:displaying` | QR code visible, awaiting scan | `qrCodeUrl`, `qrCodeExpiresAt`, `qrCodeStatus` | Render QR image + countdown | `qrcode:scanning`, `qrcode:timeout`, `qrcode:error`, `qrcode:fatal` |
| `qrcode:scanning` | User scanned, verifying | `qrCodeStatus` = `'scanned'` | Spinner overlay | `oauth:completed`, `qrcode:fatal` |
| `qrcode:timeout` | QR code expired | `error` | Expired message + refresh button | `qrcode:waiting` (via REFRESH_QRCODE) |
| `qrcode:error` | Recoverable error | `error` | Error message + retry button | `qrcode:waiting` (via REFRESH_QRCODE) |
| `qrcode:fatal` | Unrecoverable error | `error` | Error message, must restart flow | Terminal |
| `oauth:completed` | Wallet connected (reused) | `walletId`, `exchange` | Brief success, auto-continues | `wallet:loading` |

---

## 4. FlowContext QR Code Fields

```typescript
interface FlowContext {
  // QR Code specific
  qrCodeUrl?: string;            // QR code image URL (data URL or HTTP URL)
  qrCodeExpiresAt?: number;      // Expiration timestamp in milliseconds
  qrCodeStatus?: QRCodeStatus;   // Current WebSocket-reported status
  isQRCodeFlow?: boolean;        // true when QR code flow is active

  // Shared with OAuth flows
  exchange?: string;             // Always 'binance-web' for QR code flows
  walletId?: string;             // The wallet ID passed to startWithdrawalFlow()
  idempotencyKey?: string;       // Unique flow key
  topicName?: string;            // WebSocket topic for real-time updates
  error?: Error;                 // Present in error/timeout/fatal states
}
```

When `START_QRCODE` is dispatched, the context is set with:
```typescript
{ exchange, walletId, idempotencyKey: idem, topicName: idem, isQRCodeFlow: true }
```

When `QRCODE_URL_RECEIVED` arrives:
```typescript
{ qrCodeUrl: action.qrCodeUrl, qrCodeExpiresAt: action.expiresAt, qrCodeStatus: 'available' }
```

---

## 5. React Hook Fields

All `useBluvoFlow()` return fields relevant to QR code authentication:

### State Booleans

| Field | Condition | Use |
|-------|-----------|-----|
| `isQRCodeFlow` | `context.isQRCodeFlow === true` | Determine if QR code UI should render |
| `isQRCodePending` | QR in progress (not error/fatal/timeout) | Show QR code section |
| `isQRCodeWaiting` | `state.type === 'qrcode:waiting'` | Show loading spinner |
| `isQRCodeDisplaying` | `state.type === 'qrcode:displaying'` | Render QR image + countdown |
| `isQRCodeScanning` | `state.type === 'qrcode:scanning'` | Show verifying overlay |
| `isQRCodeError` | `state.type === 'qrcode:error'` or `'qrcode:fatal'` | Show error UI |
| `isQRCodeFatal` | `state.type === 'qrcode:fatal'` | Show fatal error, no retry |
| `isQRCodeTimeout` | `state.type === 'qrcode:timeout'` | Show expired + refresh button |

### Data Fields

| Field | Type | Source |
|-------|------|--------|
| `qrCodeUrl` | `string \| undefined` | `context.qrCodeUrl` |
| `qrCodeExpiresAt` | `number \| undefined` | `context.qrCodeExpiresAt` |
| `qrCodeStatus` | `QRCodeStatus \| undefined` | `context.qrCodeStatus` |

### Actions

| Method | When Available | Effect |
|--------|---------------|--------|
| `refreshQRCode()` | `qrcode:timeout` or `qrcode:error` | Dispatches `REFRESH_QRCODE`, restarts QR generation |
| `cancel()` | Any state | Cancels the entire flow |

---

## 6. Caching

`BluvoCache` stores QR code data in `localStorage` with prefix `bluvo:`.

### Configuration

```typescript
interface BluvoCacheOptions {
  adapter?: BluvoCacheAdapter;         // Default: localStorage
  prefix?: string;                     // Default: "bluvo:"
  minRemainingLifetimeSec?: number;    // Default: 15 seconds
  disabled?: boolean;                  // Default: false
}
```

### Cache Key Format

```
bluvo:<exchange>:qrcode
```

Example: `bluvo:binance-web:qrcode`

### Behavior

- On `startWithdrawalFlow()`, SDK checks cache first
- If a valid cached QR code exists (remaining lifetime > 15s threshold), skips `qrcode:waiting` and jumps directly to `qrcode:displaying`
- Entries with < 15 seconds remaining are treated as expired and removed
- On `REFRESH_QRCODE`, old cache entry is cleared before requesting a new QR code

### Cache Methods

```typescript
async getCachedQRCode(exchange: string): Promise<QRCodeAuthWorkflowMessageBody | null>
async cacheQRCode(exchange: string, message: QRCodeAuthWorkflowMessageBody): Promise<void>
async removeCachedQRCode(exchange: string): Promise<void>
```

### Stored Data

```typescript
interface CachedQRCode {
  message: QRCodeAuthWorkflowMessageBody;  // Contains qrCodeUrl, qrCodeExpiresAt, etc.
  cachedAt: number;                        // Timestamp when cached
}
```

---

## 7. Building the QR Code Component (React)

### Component Props

```tsx
interface QRCodeAuthComponentProps {
  qrCodeUrl: string;
  qrCodeExpiresAt?: number;
  qrCodeStatus?: string;
  onCancel: () => void;
  onRefresh: () => void;
}
```

### Status-Based Overlays

```tsx
const isScanned = qrCodeStatus === 'scanned';
const isConfirmed = qrCodeStatus === 'confirmed';
const isExpired = qrCodeStatus === 'expired' || qrCodeStatus === 'used';
const hasOverlay = isScanned || isConfirmed || isExpired;
```

| Status | Overlay | Opacity | Icon | Text |
|--------|---------|---------|------|------|
| `scanned` | Blue spinner | 0.4 | Spinner | "Confirming..." |
| `confirmed` | Green checkmark | 0.4 | ✓ | "Confirmed" |
| `expired` / `used` | Red X | 0.4 | ✗ | "Expired" |
| Other | No overlay | 1.0 | — | — |

### Countdown Timer

```tsx
function CountdownTimer({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 30;

  return (
    <span style={{ color: isUrgent ? 'red' : 'inherit' }}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
```

- Updates every 1000ms
- Format: `M:SS` (seconds zero-padded)
- Turns red when < 30 seconds remain

### QR Code Image Rendering

Use the `qrcode` npm package to generate a data URL:

```tsx
import QRCode from 'qrcode';

function QRCodeDisplay({ url, size = 200 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setDataUrl);
  }, [url, size]);

  if (!dataUrl) return <LoadingSpinner />;
  return <img src={dataUrl} width={size} height={size} alt="QR Code" />;
}
```

### Wiring with `useBluvoFlow`

```tsx
function QRCodeAuth() {
  const flow = useBluvoFlow({ /* options */ });

  if (flow.isQRCodeWaiting) return <LoadingSpinner />;

  if (flow.isQRCodeDisplaying && flow.qrCodeUrl) {
    return (
      <QRCodeAuthComponent
        qrCodeUrl={flow.qrCodeUrl}
        qrCodeExpiresAt={flow.qrCodeExpiresAt}
        qrCodeStatus={flow.qrCodeStatus}
        onCancel={flow.cancel}
        onRefresh={flow.refreshQRCode}
      />
    );
  }

  if (flow.isQRCodeTimeout) {
    return <ExpiredView onRefresh={flow.refreshQRCode} onCancel={flow.cancel} />;
  }

  if (flow.isQRCodeFatal) {
    return <FatalErrorView error={flow.error} />;
  }

  return null;
}
```

---

## 8. Building the QR Code Component (Vanilla/Framework-Agnostic)

Use `flowClient.subscribe()` and switch on `state.type`:

```typescript
flowClient.subscribe((state) => {
  switch (state.type) {
    case 'qrcode:waiting':
      renderLoadingSpinner();
      break;

    case 'qrcode:displaying':
      renderQRImage(state.context.qrCodeUrl);
      renderCountdown(state.context.qrCodeExpiresAt);
      renderCancelButton(() => flowClient.cancel());
      break;

    case 'qrcode:scanning':
      renderVerifyingOverlay();
      break;

    case 'qrcode:timeout':
      renderExpiredMessage();
      renderRefreshButton(() => flowClient.refreshQRCode());
      break;

    case 'qrcode:error':
      renderErrorMessage(state.context.error);
      renderRefreshButton(() => flowClient.refreshQRCode());
      break;

    case 'qrcode:fatal':
      renderFatalError(state.context.error);
      // No refresh — flow must be restarted
      break;
  }
});
```

---

## 9. Refresh Flow

**Valid from**: `qrcode:timeout` or `qrcode:error` only.

**Call**: `flowClient.refreshQRCode()` / `flow.refreshQRCode()` (React hook)

### Internal Sequence

1. Dispatches `REFRESH_QRCODE` action
2. Transitions to `qrcode:waiting` — clears `qrCodeUrl`, `qrCodeExpiresAt`, `qrCodeStatus`
3. Generates new idempotency key
4. Unsubscribes from old WebSocket topic
5. Re-subscribes with new topic
6. Backend sends new QR code URL via WebSocket → `QRCODE_URL_RECEIVED`
7. Transitions to `qrcode:displaying` with new `qrCodeUrl` and `qrCodeExpiresAt`

Default QR code timeout: **5 minutes** (`DEFAULT_QRCODE_TIMEOUT_MS = 5 * 60 * 1000`).

---

## 10. Transition to Wallet Loading

After QR code authentication completes:

```
qrcode:scanning → oauth:completed → wallet:loading → wallet:ready
```

1. `QRCODE_COMPLETED` action transitions to `oauth:completed` (reuses the OAuth flow path)
2. SDK automatically calls `loadWallet()` → `wallet:loading`
3. `WALLET_LOADED` → `wallet:ready`
4. `onWalletConnectedFn` callback fires at this point
5. From `wallet:ready`, the flow continues to `quote:requesting` → `withdraw:*` (identical to OAuth path)

---

## 11. Initial Auth QR vs FACE Step QR

These are two completely separate QR code flows. Do not confuse them.

| | Initial Auth QR Code | FACE Step QR Code |
|---|---|---|
| **Purpose** | Connects wallet to Bluvo | Verifies identity for withdrawal |
| **When** | Before wallet connection | During withdrawal 2FA |
| **State** | `qrcode:*` states | `withdraw:error2FAMultiStep` |
| **Context field** | `flow.qrCodeUrl` | `flow.faceQrCodeUrl` |
| **Refresh method** | `refreshQRCode()` | `pollFaceVerification()` |
| **Hook boolean** | `isQRCodeDisplaying` | `hasFaceStep` |
| **Reference** | This document | `multistep-2fa.md` |
