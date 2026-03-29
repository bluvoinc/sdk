# QR Code Authentication Flow for Binance Web

> **Purpose**: This document provides comprehensive guidance for implementing a QR code authentication flow UI for Binance Web exchange connection. It is framework-agnostic (targeting VanJS/vanilla JS widgets) and focuses on the patterns, data structures, and state flows you need to handle.

---

## Table of Contents

1. [Overview](#1-overview)
2. [State Machine Flow](#2-state-machine-flow)
3. [Data Structures](#3-data-structures)
4. [Core SDK Pattern](#4-core-sdk-pattern)
5. [State-Based Rendering Logic](#5-state-based-rendering-logic)
6. [QR Code Display Implementation](#6-qr-code-display-implementation)
7. [Timeout & Refresh Handling](#7-timeout--refresh-handling)
8. [Transition to Wallet Loading](#8-transition-to-wallet-loading)
9. [Multi-Step 2FA Integration](#9-multi-step-2fa-integration)
10. [VanJS Implementation Example](#10-vanjs-implementation-example)

---

## 1. Overview

Binance Web uses QR code authentication instead of the standard OAuth popup flow. The SDK automatically detects when `binance-web` is selected as the exchange and initiates the QR code flow.

### How It Works

1. User selects Binance Web as the exchange
2. SDK generates a QR code URL via backend
3. User scans the QR code with the Binance mobile app
4. Backend receives confirmation of successful scan
5. Wallet is connected and flow continues to balance loading

### Key Differences from OAuth Flow

| OAuth Flow | QR Code Flow |
|------------|--------------|
| Opens popup window | Displays QR code image |
| User enters credentials in popup | User scans QR with mobile app |
| `oauth:*` states | `qrcode:*` states |
| `closeOAuthWindow` callback returned | `null` returned (no window to close) |

### Exchanges Using QR Code Authentication

Currently, the following exchanges use QR code authentication:
- `binance-web`

The SDK maintains this list in `QR_CODE_EXCHANGES` constant in `BluvoFlowClient.ts`.

---

## 2. State Machine Flow

```
FLOW START (startWithdrawalFlow with binance-web)
    │
    ├── SDK detects QR code exchange
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         qrcode:waiting                               │
│            (Backend generating QR code URL)                          │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ QRCODE_URL_RECEIVED
    │ (qrCodeUrl + expiresAt)
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        qrcode:displaying                             │
│          (QR code visible, waiting for user to scan)                 │
└─────────────────────────────────────────────────────────────────────┘
    │
    ├─────────────────────────────────────────┬───────────────────────┐
    │                                         │                       │
    │ QRCODE_SCANNED                          │ QRCODE_TIMEOUT        │ QRCODE_FAILED
    │ (optional intermediate)                 │                       │
    ▼                                         ▼                       ▼
┌──────────────────────┐         ┌──────────────────────┐   ┌──────────────────┐
│   qrcode:scanning    │         │   qrcode:timeout     │   │   qrcode:error   │
│ (Verifying scan...)  │         │ (QR code expired)    │   │ (Error occurred) │
└──────────────────────┘         └──────────────────────┘   └──────────────────┘
    │                                         │                       │
    │ QRCODE_COMPLETED                        └───────┬───────────────┘
    │                                                 │
    │                                         REFRESH_QRCODE
    │                                                 │
    │                                                 ▼
    │                                    ┌────────────────────────┐
    │                                    │     qrcode:waiting     │
    │                                    │  (New QR being made)   │
    │                                    └────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        oauth:completed                               │
│     (Reuses existing flow - wallet connected successfully)           │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ LOAD_WALLET (automatic)
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        wallet:loading                                │
│              (Fetching withdrawable balances)                        │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ WALLET_LOADED
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         wallet:ready                                 │
│             (Balances loaded, ready for withdrawal)                  │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ (Continue to quote/withdrawal flow...)
    ▼
```

### State Meanings

| State | Meaning | UI Action |
|-------|---------|-----------|
| `qrcode:waiting` | SDK requesting QR code from backend | Show loading spinner |
| `qrcode:displaying` | QR code ready for scanning | Show QR code + countdown timer |
| `qrcode:scanning` | User scanned, verification in progress | Show "Verifying..." message |
| `qrcode:timeout` | QR code expired | Show expiration message + refresh button |
| `qrcode:error` | Error occurred | Show error message + retry button |
| `qrcode:fatal` | Unrecoverable error | Show error, require restart |
| `oauth:completed` | Authentication successful | Auto-transition to wallet loading |

---

## 3. Data Structures

### 3.1 FlowContext QR Code Fields

The state machine context includes these QR code specific fields:

```typescript
interface FlowContext {
  // ... other fields ...

  // QR Code flow context
  qrCodeUrl?: string;           // The QR code image URL (data URL or HTTP URL)
  qrCodeExpiresAt?: number;     // Expiration timestamp in milliseconds
  isQRCodeFlow?: boolean;       // Boolean flag indicating QR code flow

  // Standard flow context (also available)
  exchange?: string;            // "binance-web"
  walletId?: string;            // User's wallet ID
  idempotencyKey?: string;      // Unique key for this flow
}
```

### 3.2 QR Code Actions

```typescript
// Action sent when QR code URL is received from backend
type QRCODE_URL_RECEIVED = {
  type: "QRCODE_URL_RECEIVED";
  qrCodeUrl: string;
  expiresAt?: number;  // Unix timestamp in milliseconds
};

// Action sent when user scans QR code (optional intermediate state)
type QRCODE_SCANNED = {
  type: "QRCODE_SCANNED";
};

// Action sent when QR code authentication completes successfully
type QRCODE_COMPLETED = {
  type: "QRCODE_COMPLETED";
  walletId: string;
  exchange: string;
};

// Action sent when QR code times out
type QRCODE_TIMEOUT = {
  type: "QRCODE_TIMEOUT";
};

// Action sent to request a new QR code after timeout/error
type REFRESH_QRCODE = {
  type: "REFRESH_QRCODE";
};

// Action sent on recoverable error
type QRCODE_FAILED = {
  type: "QRCODE_FAILED";
  error: Error;
};

// Action sent on fatal/unrecoverable error
type QRCODE_FATAL = {
  type: "QRCODE_FATAL";
  error: Error;
};
```

---

## 4. Core SDK Pattern

### 4.1 Starting the QR Code Flow

The SDK automatically detects that `binance-web` requires QR code authentication:

```typescript
import { BluvoFlowClient } from '@bluvo/sdk-ts';

// Initialize flow client with your callbacks
const flowClient = new BluvoFlowClient({
  orgId: 'your-org-id',
  projectId: 'your-project-id',
  listExchangesFn: () => bluvoClient.oauth2.listExchanges(),
  fetchWithdrawableBalanceFn: (walletId) =>
    bluvoClient.wallet.withdrawals.getWithdrawableBalance(walletId),
  requestQuotationFn: (walletId, params) =>
    bluvoClient.wallet.withdrawals.requestQuotation(walletId, params),
  executeWithdrawalFn: (walletId, idem, quoteId, params) =>
    bluvoClient.wallet.withdrawals.executeWithdrawal(walletId, idem, quoteId, params),
  getWalletByIdFn: (walletId) => bluvoClient.wallet.get(walletId),
  pingWalletByIdFn: (walletId) => bluvoClient.wallet.ping(walletId),
  onWalletConnectedFn: (walletId, exchange) => {
    console.log('Wallet connected:', walletId, exchange);
  },
});

// Start the flow - SDK auto-detects binance-web needs QR
const { machine, closeOAuthWindow } = await flowClient.startWithdrawalFlow({
  exchange: 'binance-web',
  walletId: 'user-wallet-123',
});

// Note: closeOAuthWindow will be null for QR code flows
```

### 4.2 Subscribing to State Changes

```typescript
// Subscribe to state updates
const unsubscribe = machine.subscribe((state) => {
  console.log('State changed:', state.type);
  console.log('Context:', state.context);

  // Handle state changes
  switch (state.type) {
    case 'qrcode:waiting':
      renderLoadingSpinner();
      break;

    case 'qrcode:displaying':
      renderQRCode(state.context.qrCodeUrl, state.context.qrCodeExpiresAt);
      break;

    case 'qrcode:scanning':
      renderVerifyingMessage();
      break;

    case 'qrcode:timeout':
      renderTimeoutMessage();
      break;

    case 'qrcode:error':
      renderErrorMessage(state.error);
      break;

    case 'wallet:loading':
      renderWalletLoading();
      break;

    case 'wallet:ready':
      renderWalletBalances(state.context.walletBalances);
      break;
  }
});

// Clean up on unmount
unsubscribe();
```

### 4.3 Refreshing Expired QR Code

```typescript
// When in qrcode:timeout or qrcode:error state
async function handleRefreshQRCode() {
  const result = await flowClient.refreshQRCode();

  if (!result.success) {
    console.error('Failed to refresh QR code:', result.error);
  }
  // State machine will transition through qrcode:waiting -> qrcode:displaying
}
```

---

## 5. State-Based Rendering Logic

### 5.1 State Detection

```typescript
function getQRCodeRenderState(state) {
  switch (state.type) {
    case 'qrcode:waiting':
      return { view: 'loading', message: 'Preparing QR code...' };

    case 'qrcode:displaying':
      return {
        view: 'qrcode',
        qrCodeUrl: state.context.qrCodeUrl,
        expiresAt: state.context.qrCodeExpiresAt,
      };

    case 'qrcode:scanning':
      return { view: 'verifying', message: 'Verifying scan...' };

    case 'qrcode:timeout':
      return { view: 'timeout', message: 'QR code has expired' };

    case 'qrcode:error':
      return { view: 'error', message: state.error?.message || 'An error occurred' };

    case 'qrcode:fatal':
      return { view: 'fatal', message: state.error?.message || 'A fatal error occurred' };

    default:
      return { view: 'none' };
  }
}
```

### 5.2 Helper Functions

```typescript
// Check if current state is a QR code state
function isQRCodeState(stateType) {
  return stateType?.startsWith('qrcode:');
}

// Check if refresh is allowed
function canRefreshQRCode(stateType) {
  return stateType === 'qrcode:timeout' || stateType === 'qrcode:error';
}

// Check if QR code flow (vs OAuth)
function isQRCodeFlow(context) {
  return context.isQRCodeFlow === true;
}
```

---

## 6. QR Code Display Implementation

### 6.1 Displaying the QR Code

The `qrCodeUrl` from context can be either:
- A data URL (`data:image/png;base64,...`)
- An HTTP URL pointing to the QR image

```typescript
function renderQRCode(qrCodeUrl, expiresAt) {
  // Create image element
  const img = document.createElement('img');
  img.src = qrCodeUrl;
  img.alt = 'Scan with Binance app';
  img.style.width = '200px';
  img.style.height = '200px';

  // Add to container
  qrContainer.appendChild(img);

  // Set up countdown timer
  startCountdownTimer(expiresAt);
}
```

### 6.2 Countdown Timer

```typescript
function startCountdownTimer(expiresAt) {
  let timerInterval;

  function updateTimer() {
    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerElement.textContent = 'Expired';
      return;
    }

    const seconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Update immediately
  updateTimer();

  // Update every second
  timerInterval = setInterval(updateTimer, 1000);

  // Return cleanup function
  return () => clearInterval(timerInterval);
}
```

### 6.3 Default Timeout

If `expiresAt` is not provided, the SDK uses a default timeout of 5 minutes:

```typescript
const DEFAULT_QRCODE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
```

---

## 7. Timeout & Refresh Handling

### 7.1 Automatic Timeout

The SDK automatically handles QR code expiration:

1. When `QRCODE_URL_RECEIVED` is processed, SDK sets up a timeout timer
2. When timer fires, SDK sends `QRCODE_TIMEOUT` action
3. State transitions to `qrcode:timeout`

### 7.2 Manual Refresh

From `qrcode:timeout` or `qrcode:error` states, call `refreshQRCode()`:

```typescript
async function handleRefresh() {
  setIsRefreshing(true);

  const result = await flowClient.refreshQRCode();

  setIsRefreshing(false);

  if (!result.success) {
    showError(result.error);
  }
  // State will automatically transition: qrcode:waiting -> qrcode:displaying
}
```

### 7.3 Refresh Flow Details

When `refreshQRCode()` is called:

1. Validates current state is `qrcode:error` or `qrcode:timeout`
2. Sends `REFRESH_QRCODE` action (transitions to `qrcode:waiting`)
3. Generates new idempotency key
4. Unsubscribes from old WebSocket topic
5. Re-subscribes with new topic
6. Fetches new QR code URL from backend
7. Backend sends QR code via WebSocket → `QRCODE_URL_RECEIVED`
8. State transitions to `qrcode:displaying`

---

## 8. Transition to Wallet Loading

### 8.1 Automatic Transition

After successful QR code authentication:

1. Backend sends completion message via WebSocket
2. SDK fires `QRCODE_COMPLETED` action
3. State transitions to `oauth:completed` (reuses OAuth flow)
4. SDK automatically calls `loadWallet()`
5. State transitions: `wallet:loading` → `wallet:ready`

### 8.2 Wallet States

```typescript
// After QR code completes, these states follow:
switch (state.type) {
  case 'oauth:completed':
    // Brief transition state, auto-proceeds to wallet:loading
    break;

  case 'wallet:loading':
    // Fetching withdrawable balances from exchange
    renderLoadingBalances();
    break;

  case 'wallet:ready':
    // Balances loaded, ready for withdrawal
    const balances = state.context.walletBalances;
    renderBalanceSelector(balances);
    break;

  case 'wallet:error':
    // Failed to load wallet
    renderWalletError(state.error);
    break;
}
```

---

## 9. Multi-Step 2FA Integration

After QR code authentication and wallet connection, withdrawal attempts on Binance Web may require multi-step 2FA verification.

### 9.1 Combined Flow

```
QR Code Auth        →  Wallet Ready  →  Quote  →  Withdrawal  →  Multi-Step 2FA
qrcode:displaying      wallet:ready     quote:ready            withdraw:error2FAMultiStep
```

### 9.2 2FA After QR Code

The QR code authentication is only for **connecting the wallet**. When the user attempts a **withdrawal**, they may need to complete additional 2FA steps:

- `GOOGLE` - TOTP authenticator code
- `EMAIL` - Email verification code
- `SMS` - SMS verification code
- `FACE` - Face recognition via QR code (separate from initial auth QR)

### 9.3 Reference

For complete Multi-Step 2FA implementation details, see:
**[MULTI_STEP_2FA_HANDLING_UI_EXPLANATION.md](./MULTI_STEP_2FA_HANDLING_UI_EXPLANATION.md)**

Key differences between QR codes:

| Initial Auth QR Code | FACE Step QR Code |
|---------------------|-------------------|
| Connects wallet to Bluvo | Verifies identity for withdrawal |
| `state.context.qrCodeUrl` | `state.context.multiStep2FA.faceQrCodeUrl` |
| `qrcode:*` states | `withdraw:error2FAMultiStep` state |
| `refreshQRCode()` method | `pollFaceVerification()` method |

---

## 10. VanJS Implementation Example

### 10.1 State Management with VanJS

```typescript
import van from 'vanjs-core';

const { div, img, p, button, span } = van.tags;

// Reactive state
const flowState = van.state(null);
const isRefreshing = van.state(false);

// Subscribe to flow machine
function initFlow(flowClient) {
  flowClient.subscribe((state) => {
    flowState.val = state;
  });
}
```

### 10.2 QR Code Component

```typescript
function QRCodeAuthView({ flowClient }) {
  // Countdown timer state
  const remainingTime = van.state('');
  let timerInterval = null;

  // Cleanup function for timer
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Start countdown timer
  function startTimer(expiresAt) {
    stopTimer();

    function update() {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        remainingTime.val = 'Expired';
        stopTimer();
        return;
      }
      const secs = Math.ceil(remaining / 1000);
      const mins = Math.floor(secs / 60);
      remainingTime.val = `${mins}:${(secs % 60).toString().padStart(2, '0')}`;
    }

    update();
    timerInterval = setInterval(update, 1000);
  }

  // Handle refresh button click
  async function handleRefresh() {
    isRefreshing.val = true;
    await flowClient.refreshQRCode();
    isRefreshing.val = false;
  }

  // Reactive rendering based on state
  return () => {
    const state = flowState.val;
    if (!state) return div('Initializing...');

    switch (state.type) {
      case 'qrcode:waiting':
        return div({ class: 'qr-loading' },
          div({ class: 'spinner' }),
          p('Preparing QR code...')
        );

      case 'qrcode:displaying':
        // Start timer when displaying
        if (state.context.qrCodeExpiresAt) {
          startTimer(state.context.qrCodeExpiresAt);
        }

        return div({ class: 'qr-display' },
          p('Scan this QR code with your Binance app'),
          img({
            src: state.context.qrCodeUrl,
            alt: 'Binance QR Code',
            width: 200,
            height: 200,
          }),
          div({ class: 'countdown' },
            span('Expires in: '),
            span(() => remainingTime.val)
          )
        );

      case 'qrcode:scanning':
        return div({ class: 'qr-verifying' },
          div({ class: 'spinner' }),
          p('Verifying scan...')
        );

      case 'qrcode:timeout':
        stopTimer();
        return div({ class: 'qr-timeout' },
          p({ class: 'error' }, 'QR code has expired'),
          button({
            onclick: handleRefresh,
            disabled: () => isRefreshing.val,
          }, () => isRefreshing.val ? 'Refreshing...' : 'Get New QR Code')
        );

      case 'qrcode:error':
        stopTimer();
        return div({ class: 'qr-error' },
          p({ class: 'error' }, state.error?.message || 'An error occurred'),
          button({
            onclick: handleRefresh,
            disabled: () => isRefreshing.val,
          }, () => isRefreshing.val ? 'Retrying...' : 'Try Again')
        );

      case 'qrcode:fatal':
        stopTimer();
        return div({ class: 'qr-fatal' },
          p({ class: 'error' }, state.error?.message || 'A fatal error occurred'),
          p('Please restart the connection process.')
        );

      default:
        return div(); // Not a QR code state
    }
  };
}
```

### 10.3 Complete Widget Example

```typescript
import van from 'vanjs-core';
import { BluvoFlowClient } from '@bluvo/sdk-ts';

const { div, h2 } = van.tags;

// Initialize flow client
const flowClient = new BluvoFlowClient({
  orgId: 'your-org-id',
  projectId: 'your-project-id',
  // ... callback functions
});

// Main component
function BinanceConnectWidget() {
  const currentView = van.state('initial');
  const flowState = van.state(null);

  async function startConnection() {
    currentView.val = 'connecting';

    const { machine } = await flowClient.startWithdrawalFlow({
      exchange: 'binance-web',
      walletId: 'user-wallet-id',
    });

    machine.subscribe((state) => {
      flowState.val = state;

      // Detect when we've moved past QR code to wallet
      if (state.type === 'wallet:ready') {
        currentView.val = 'wallet';
      }
    });
  }

  return () => {
    const view = currentView.val;

    if (view === 'initial') {
      return div(
        h2('Connect Binance'),
        button({ onclick: startConnection }, 'Connect with QR Code')
      );
    }

    if (view === 'connecting') {
      return div(
        h2('Connect Binance'),
        QRCodeAuthView({ flowClient })
      );
    }

    if (view === 'wallet') {
      return div(
        h2('Wallet Connected'),
        WalletBalancesView({ flowState })
      );
    }
  };
}

// Mount the widget
van.add(document.getElementById('app'), BinanceConnectWidget());
```

---

## Summary Checklist

When implementing QR code authentication for Binance Web:

- [ ] Detect `qrcode:*` states using `state.type.startsWith('qrcode:')`
- [ ] Display loading spinner during `qrcode:waiting`
- [ ] Render QR code image when `qrcode:displaying`
- [ ] Show countdown timer using `state.context.qrCodeExpiresAt`
- [ ] Display "Verifying..." message during `qrcode:scanning`
- [ ] Show expiration message + refresh button on `qrcode:timeout`
- [ ] Show error message + retry button on `qrcode:error`
- [ ] Call `flowClient.refreshQRCode()` to get new QR code
- [ ] Handle transition to `wallet:loading` → `wallet:ready`
- [ ] Integrate with multi-step 2FA for withdrawals (see separate guide)
- [ ] Clean up timers and subscriptions on unmount

---

## Verification

After implementation, verify:

1. **QR code displays**: QR code image renders correctly from `qrCodeUrl`
2. **Countdown works**: Timer counts down and reaches zero correctly
3. **Timeout handling**: State transitions to `qrcode:timeout` when expired
4. **Refresh works**: New QR code appears after clicking refresh
5. **Error recovery**: Can retry from error states
6. **Wallet loading**: After scan, wallet balances load automatically
7. **2FA integration**: Withdrawal shows multi-step 2FA when required

---

*Document Version: 1.0*
*Compatible with: @bluvo/sdk-ts v2.1.4+*
