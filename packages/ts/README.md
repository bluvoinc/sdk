# Bluvo TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@bluvo/sdk-ts.svg)](https://www.npmjs.com/package/@bluvo/sdk-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official TypeScript SDK for the [Bluvo API](https://docs.bluvo.co) - a unified cryptocurrency exchange (CEX) API aggregator infrastructure.

## Features

-  **Unified API**: Interact with multiple exchanges through a single, consistent interface
-  **Simple Authentication**: Connect to Binance, Coinbase, Kraken, KuCoin, OKX and more with just a few lines of code
-  **Market Data**: Access real-time and historical price information across exchanges
-  **Wallet Management**: Easily connect, list, and manage exchange wallets
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

## Quick Start

### Initialize the SDK
```typescript
import { createClient } from '@bluvo/sdk-ts';

// Get yours at https://docs.bluvo.co/introduction
const client = createClient({
    apiKey: 'your-api-key',
    orgId: 'your-org-id',
    projectId: 'your-project-id',
});
```

## Wallets

### Connect a Wallet (Server-side)

```typescript
// See full list here -> https://docs.bluvo.co/supported-exchanges
const connection = await client.wallet.connect(
  'binance',                    // exchange
  'unique-wallet-id',           // walletId
  'unique-workflow-id',         // idem (workflow identifier)
  {                            // ConnectWalletRequest
    apiKey: 'your-binance-api-key',
    apiSecret: 'your-binance-api-secret',
    apiPassphrase: 'optional-passphrase',  // Required for some exchanges
    ips: ['192.168.1.1']                   // Optional IP whitelist
  }
);
```

### Withdraw from Wallet (Server-side)

```typescript
// Withdraw cryptocurrency from a connected wallet
const withdrawal = await client.wallet.transaction.withdraw({
  walletId: 'connected-wallet-id',
  destinationAddress: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
  amount: '0.05',
  asset: 'BTC',
  network: 'BTC',           // Optional network specification
  tag: '123456'             // Optional memo/tag for certain cryptos
});

console.log('Withdrawal status:', withdrawal.status);
```
### Get Wallet Details

```typescript
// Get details of a specific wallet
const wallet = await client.wallet.get('wallet-id');
```

### Delete a Wallet

```typescript
// Delete a wallet connection
const deleteResult = await client.wallet.delete('wallet-id');
```

## Market Data

### Get OHLCV Candlesticks

```typescript
// Get historical price data
const candlesticks = await client.prices.candlesticks(
  'ETH',           // Base asset
  'USDT',          // Quote asset
  1649619000000,   // Start time (optional, Unix timestamp in ms)
  1649629000000,   // End time (optional, Unix timestamp in ms)
  'binance',       // Exchange (optional)
  '1h'             // Granularity (optional: 1m, 15m, 30m, 1h, 4h, 1d)
);

console.log('ETH/USDT candlesticks:', candlesticks);
```

## Workflow Management

Track the status of asynchronous operations:

```typescript
// Check status of a workflow run (e.g., after connecting a wallet)
const workflow = await client.workflow.getWorkflow('workflow-run-id');
console.log('Workflow status:', workflow.status);
console.log('Workflow steps:', workflow.steps);
```

## Supported Exchanges

- Binance
- Coinbase
- Kraken
- KuCoin
- OKX
- More coming soon!

## More Examples

For more examples and inspiration, check out the [Bluvo Awesome List](https://github.com/bluvoinc/awesome).

## Documentation

For comprehensive documentation, visit the [Bluvo API Documentation](https://docs.bluvo.co).

## Client-side OTT (One-Time Token) Usage

For client-side applications where you don't want to expose your API keys, use OTT tokens:

### Step 1: Generate OTT Token (Server-side)

```typescript
// On your server, generate an OTT token
const ottResponse = await client.ott.get('wallet-id');
const { ott, idem } = ottResponse;

// Send the OTT token to your client-side application
// (e.g., through an API endpoint or WebSocket)
```

### Step 2: Connect Wallet with OTT (Client-side)

```typescript
// On the client-side, use the OTT token to connect a wallet
import { createClient } from '@bluvo/sdk-ts';

const client = createClient({
  orgId: 'your-org-id',
  projectId: 'your-project-id',
  // No API key needed for OTT operations
});

// Connect wallet using OTT
const connection = await client.ott.connect(
  {
    exchange: 'binance',
    walletId: 'unique-wallet-id',
    idem: idem,               // From server
    ott: ott                  // From server
  },
  {
    apiKey: 'user-exchange-api-key',
    apiSecret: 'user-exchange-api-secret'
  }
);

console.log('Wallet connected:', connection.status);
```

### Step 3: Withdraw with OTT (Client-side)

```typescript
// Withdraw funds using OTT authentication
const withdrawal = await client.ott.withdraw({
  walletId: 'connected-wallet-id',
  asset: 'BTC',
  amount: 0.05,
  address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
  tag: 'optional-memo',
  network: 'BTC'
});

console.log('Withdrawal initiated:', withdrawal.transactionId);
```

### Benefits of OTT Pattern

- **Security**: API keys never leave your server
- **Flexibility**: Users can perform operations without exposing credentials
- **Controlled Access**: Each OTT token is single-use and time-limited
- **Client-side Friendly**: Perfect for web applications and mobile apps

## Related Projects

- [Home Page](https://bluvo.co) - Bluvo Home Page
- [Playground](https://playground.bluvo.co) - NextJs UI widget for Bluvo
- [Admin Dashboard](https://portal.bluvo.co) - Bluvo Admin Dashboard
## License

[MIT](LICENSE) Bluvo Inc.