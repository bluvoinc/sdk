// Next.js Example with @bluvo/react
'use client';

import React from 'react';
import { useBluvoFlow } from '@bluvo/react';

// Server Actions (these would be in a separate file)
async function fetchBalances(walletId: string) {
  'use server';
  // Call your server API with credentials
  const response = await fetch(`${process.env.API_URL}/wallets/${walletId}/balances`, {
    headers: { Authorization: `Bearer ${process.env.API_KEY}` }
  });
  const data = await response.json();
  return data.balances;
}

async function requestQuote(walletId: string, params: any) {
  'use server';
  const response = await fetch(`${process.env.API_URL}/quotes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}` 
    },
    body: JSON.stringify({ walletId, ...params })
  });
  const data = await response.json();
  return data.quote;
}

async function executeWithdrawal(walletId: string, idem: string, quoteId: string, params?: any) {
  'use server';
  const response = await fetch(`${process.env.API_URL}/withdrawals`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}` 
    },
    body: JSON.stringify({ walletId, idem, quoteId, ...params })
  });
  const data = await response.json();
  return data;
}

export default function WithdrawalPage() {
  const flow = useBluvoFlow({
    orgId: process.env.NEXT_PUBLIC_BLUVO_ORG_ID!,
    projectId: process.env.NEXT_PUBLIC_BLUVO_PROJECT_ID!,
    
    // Server-side callbacks (secure)
    fetchWithdrawableBalanceFn: fetchBalances,
    requestQuotationFn: requestQuote,
    executeWithdrawalFn: executeWithdrawal,
  });

  const handleStart = () => {
    flow.startWithdrawalFlow({
      exchange: 'coinbase',
      walletId: 'wallet-123',
      asset: 'BTC',
      amount: '0.001',
      destinationAddress: 'bc1q...',
      network: 'bitcoin'
    });
  };

  // Render based on current state
  if (!flow.state) {
    return (
      <div>
        <button onClick={handleStart}>
          Start Withdrawal
        </button>
      </div>
    );
  }

  if (flow.isOAuthPending) {
    return <div>Please complete OAuth in the popup...</div>;
  }

  if (flow.isWalletLoading) {
    return <div>Loading wallet...</div>;
  }

  if (flow.requires2FA) {
    return (
      <div>
        <input
          placeholder="Enter 2FA code"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.length >= 6) {
              flow.submit2FA(e.currentTarget.value);
            }
          }}
        />
      </div>
    );
  }

  if (flow.isWithdrawalComplete) {
    return (
      <div>
        <h2>Withdrawal Completed!</h2>
        <p>Transaction ID: {flow.withdrawal?.transactionId}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Withdrawal Flow</h2>
      <p>Current state: {flow.state.type}</p>
      {flow.hasError && <p>Error: {flow.error?.message}</p>}
    </div>
  );
}