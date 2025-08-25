# Bluvo TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@bluvo/sdk-ts.svg)](https://www.npmjs.com/package/@bluvo/sdk-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official TypeScript SDK for the [Bluvo API](https://docs.bluvo.co) - Securely authenticate users via OAuth2 and perform safe, auditable withdrawals from cryptocurrency exchanges.

## Features

-  **OAuth2 Authentication**: Connect user CEX accounts securely via OAuth2 flow
-  **Safe Withdrawals**: Request quotations and execute withdrawals with full transparency
-  **Dual SDK Architecture**: Separate browser and server SDKs for security
-  **Multi-Exchange Support**: Coinbase, Kraken, Binance, KuCoin, OKX, Bitmart, Gemini and more
-  **Type Safety**: Full TypeScript support with proper types for all API responses

## Installation

```bash
# Using npm
npm install @bluvo/sdk-ts

# Using yarn
yarn add @bluvo/sdk-ts

# Using pnpm
pnpm add @bluvo/sdk-ts
```

## Overview: OAuth2 → Withdraw Flow

Bluvo enables a secure flow to authenticate users with their CEX accounts and perform withdrawals:

1. **OAuth2 Authentication** (Browser): User connects their CEX account via OAuth2 popup
2. **Get Withdrawable Balance** (Server): Query available assets and supported networks
3. **Request Quotation** (Server): Get a priced withdrawal instruction
4. **Execute Withdrawal** (Server): Complete the withdrawal transaction

## Quick Start

### Web Client SDK (Browser)

Use in React-based UIs to handle OAuth2 flows securely. Never embed server secrets here.

```typescript
import { createWebClient } from "@bluvo/sdk-ts";

const webClient = createWebClient({ 
  orgId: "your-org-id",      // Get from https://portal.bluvo.co
  projectId: "your-project-id" 
});
```

### Server SDK (Backend)

Use on trusted servers for privileged operations. Store API key securely.

```typescript
import { createClient } from "@bluvo/sdk-ts";

const client = createClient({ 
  orgId: "your-org-id",
  projectId: "your-project-id",
  apiKey: process.env.BLUVO_API_KEY  // Store securely!
});
```

## OAuth2 CEX Authentication

### 1. Open OAuth2 Popup (Browser)

```typescript
import { randomUUID } from 'crypto';

// Open OAuth2 popup for user authentication
await webClient.oauth2.openWindow(
  "coinbase", // or: kraken, gemini, binance, okx, bitmart, kucoin
  {
    walletId: randomUUID(), // Unique identifier for this wallet
    idem: randomUUID(),     // Idempotency key for this auth attempt
  },
  {
    onWindowClose: () => {
      console.log("OAuth2 window was closed by user");
    },
  }
);
```

### 2. Listen for Completion (Browser)

```typescript
// Subscribe to OAuth2 completion event
await webClient.listen(
  idem, // Same UUID from openWindow
  SUBSCRIBE_ONLY_PUBLIC_TOKEN, // Ask Bluvo team for this token
  {
    onMessage: ({ walletId }) => {
      console.log("CEX account connected with ID:", walletId);
      
      // Store walletId for future operations
      // e.g., saveUserWallet(currentUser, walletId);
    },
    onError: (error) => {
      console.error("OAuth2 failed:", error);
    }
  }
);
```

## Withdrawal Flow

Once you have a `walletId` from OAuth2, perform withdrawals in three steps:

### 1. Get Withdrawable Balance (Server)

```typescript
const { balances } = await client
  .wallet
  .withdrawals
  .getWithdrawableBalance(walletId);

// Response structure:
// {
//   balances: [{
//     asset: "BTC",
//     amount: 0.05,
//     networks: [{
//       id: "bitcoin",
//       code: "bitcoin",
//       name: "bitcoin",
//       displayName: "Bitcoin",
//       minWithdrawal: "0.0001",
//       maxWithdrawal: "10",
//       assetName: "BTC",
//       addressRegex: "^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$"
//     }]
//   }]
// }
```

### 2. Request Quotation (Server)

Get a short-lived, priced withdrawal instruction:

```typescript
const quote = await client
  .wallet
  .withdrawals
  .requestQuotation(walletId, {
    asset: "BTC",
    amount: "0.05",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    network: "bitcoin",      // Optional, defaults to address type
    tag: null,              // For assets requiring memo/tag
    includeFee: true        // Include network fee in amount
  });

// Response:
// {
//   id: "quote_01H9X3Z7N5V2KJ4G8P6QR5T3Y2",
//   asset: "BTC",
//   amountWithFee: 0.0502,
//   amountNoFee: 0.05,
//   destinationAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
//   network: "bitcoin",
//   estimatedFee: 0.0002,
//   estimatedTotal: 0.0502,
//   expiresAt: 1713984000  // UNIX timestamp
// }
```

### 3. Execute Withdrawal (Server)

Execute the withdrawal using the quotation:

```typescript
const withdrawal = await client
  .wallet
  .withdrawals
  .executeQuotation(walletId, quote.id, {
    idem: randomUUID() // For safe retries
  });

// Response:
// {
//   transactionId: "tx_01H9X3Z7N5V2KJ4G8P6QR5T3Y2",
//   status: "pending",
//   asset: "BTC",
//   amount: 0.05,
//   network: "bitcoin",
//   destinationAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
//   fee: 0.0002,
//   total: 0.0502
// }
```

## Security Best Practices

1. **API Key Management**: Keep `BLUVO_API_KEY` strictly server-side. Use environment variables or secrets managers.

2. **Address Validation**: Use the network's `addressRegex` for client-side validation. The API will also validate.

3. **Idempotency**: Use unique `idem` keys for all critical operations to make retries safe.

4. **Quote Management**: 
   - Treat quotes as immutable and short-lived
   - Display expiry time to users
   - Request new quotes if inputs change or quotes expire

5. **Error Handling**: Surface actionable messages and provide clean retry paths.

6. **Data Persistence**: Store the `walletId` securely against your user profile for all future operations.

## Operational Recommendations

- **OAuth2 Flow**: Generate fresh `idem` for each attempt
- **Transparency**: Show fee breakdowns and quote expiry times
- **Observability**: Log `walletId`, quote `id`, and `idem` for traceability
- **No Token Management**: Bluvo handles access token refresh and balance sync automatically

## Supported Exchanges

Currently supported for OAuth2:
- Coinbase
- Kraken
- Gemini 
- Binance
- OKX
- Bitmart
- KuCoin

## Related Projects

- [Home Page](https://bluvo.co) - Bluvo Home Page
- [API Documentation](https://docs.bluvo.co) - Complete API reference
- [Admin Dashboard](https://portal.bluvo.co) - Get your credentials here

## License

[MIT](LICENSE) © Bluvo Inc.