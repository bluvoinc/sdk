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

### Usage
```typescript
// Example: Get OHLCV data for BTC/USDT
const candlesticks = await client.prices.candlesticks('BTC', 'USDT');

// Example: List connected wallets
const wallets = await client.wallet.list();
```

## Wallets

### Connect a Wallet

```typescript
// See full list here -> https://docs.bluvo.co/supported-exchanges
const {workflowRunId} = await client
    .wallet
    .connect(
        'binance',
        'i decide my own wallet id',
        '<your-binance-account-api-key>',
        '<your-binance-account-api-secret>'
    );
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

## Related Projects

- [Home Page](https://bluvo.co) - Bluvo Home Page
- [Playground](https://playground.bluvo.co) - NextJs UI widget for Bluvo
- [Admin Dashboard](https://portal.bluvo.co) - Bluvo Admin Dashboard
## License

[MIT](LICENSE) Bluvo Inc.