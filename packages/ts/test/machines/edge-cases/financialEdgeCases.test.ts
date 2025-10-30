import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFlowMachine } from '../../../src/machines';

/**
 * CRITICAL: Financial Edge Cases
 *
 * These tests cover scenarios that could result in loss of funds,
 * incorrect transactions, or financial data corruption.
 *
 * Categories:
 * - Balance boundary conditions
 * - Fee calculation edge cases
 * - Quote expiration timing
 * - Amount validation edge cases
 * - Concurrent withdrawal scenarios
 * - Asset/network mismatches
 */

describe('Financial Edge Cases - CRITICAL', () => {
  const defaultOptions = {
    orgId: 'test-org',
    projectId: 'test-project',
    maxRetryAttempts: 3
  };

  function setupToQuoteReady(machine: any, balance: string = '1.0', asset: string = 'BTC') {
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({
      exchange: 'coinbase',
      type: 'OAUTH_COMPLETED',
      walletId: 'wallet-123'
    });
    machine.send({ type: 'LOAD_WALLET' });
    machine.send({
      type: 'WALLET_LOADED',
      balances: [{ asset, balance }]
    });
    machine.send({
      type: 'REQUEST_QUOTE',
      asset,
      amount: balance,
      destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    });
  }

  describe('Balance Boundary Conditions', () => {
    it('should handle withdrawal amount exactly equal to balance (no fee room)', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      // Quote with fee that would exceed balance
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '1.0',
          estimatedFee: '0.001',  // This would make total 1.001 > 1.0 balance
          estimatedTotal: '1.001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '30030',
          amountNoFeeInFiat: '30000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.estimatedTotal).toBe('1.001');

      // Attempting withdrawal should handle insufficient balance for fee
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-1' });
      // This scenario should be caught by the backend, so we simulate the error
      machine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:errorBalance');
    });

    it('should handle zero balance withdrawal attempt', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '0' }]
      });

      // Attempting to request quote with zero balance
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.1',  // More than balance
        destinationAddress: '1A1zP...',
      });

      // Backend should reject this
      machine.send({ type: 'QUOTE_FAILED', error: new Error('Insufficient balance') });

      expect(machine.getState().type).toBe('quote:error');
    });

    it('should handle balance with extreme precision (8+ decimals)', () => {
      const machine = createFlowMachine(defaultOptions);
      const preciseBalance = '0.00000001';  // 1 satoshi in BTC

      setupToQuoteReady(machine, preciseBalance, 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-dust',
          asset: 'BTC',
          amount: preciseBalance,
          estimatedFee: '0.00000001',
          estimatedTotal: '0.00000002',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '0.0006',
          amountNoFeeInFiat: '0.0003',
          estimatedFeeInFiat: '0.0003',
          additionalInfo: { minWithdrawal: '0.00000001' }
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.amount).toBe(preciseBalance);
    });

    it('should handle balance decrease between wallet load and withdrawal', () => {
      const machine = createFlowMachine(defaultOptions);

      // Initial balance
      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '1.0' }]
      });

      // Get quote for 0.9 BTC
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.9',
        destinationAddress: '1A1zP...',
      });

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-timing',
          asset: 'BTC',
          amount: '0.9',
          estimatedFee: '0.001',
          estimatedTotal: '0.901',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '27030',
          amountNoFeeInFiat: '27000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      // Start withdrawal - but balance decreased on exchange side
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-timing' });

      // Backend detects balance mismatch
      machine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });

      expect(machine.getState().type).toBe('withdraw:errorBalance');
    });
  });

  describe('Fee Calculation Edge Cases', () => {
    it('should handle fee increase between quote and execution', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'ETH');

      // Original quote with low fee
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-fee-change',
          asset: 'ETH',
          amount: '1.0',
          estimatedFee: '0.005',  // Low gas
          estimatedTotal: '1.005',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '3015',
          amountNoFeeInFiat: '3000',
          estimatedFeeInFiat: '15',
          additionalInfo: { minWithdrawal: '0.01' }
        }
      });

      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-fee-change' });

      // Backend recalculates and fee is now higher, causing insufficient balance
      machine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:errorBalance');
      expect(state.error?.message).toBe('Insufficient balance');
    });

    it('should handle zero fee scenario', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '10.0', 'USDT');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-zero-fee',
          asset: 'USDT',
          amount: '10.0',
          estimatedFee: '0',  // Some exchanges waive fees
          estimatedTotal: '10.0',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '10',
          amountNoFeeInFiat: '10',
          estimatedFeeInFiat: '0',
          additionalInfo: { minWithdrawal: '1' }
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.estimatedFee).toBe('0');
      expect(state.context.quote?.estimatedTotal).toBe('10.0');
    });

    it('should handle negative fee (promotional credit)', () => {
      // Some platforms give fee credits/rebates
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-negative-fee',
          asset: 'BTC',
          amount: '1.0',
          estimatedFee: '-0.0001',  // Credit/rebate
          estimatedTotal: '0.9999',  // Less than amount
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '29997',
          amountNoFeeInFiat: '30000',
          estimatedFeeInFiat: '-3',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(parseFloat(state.context.quote!.estimatedTotal)).toBeLessThan(
        parseFloat(state.context.quote!.amount)
      );
    });
  });

  describe('Quote Expiration Timing', () => {
    it('should handle quote expiring exactly at withdrawal initiation', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      // Quote that expires in 100ms
      const expiryTime = Date.now() + 100;
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-exact-expiry',
          asset: 'BTC',
          amount: '1.0',
          estimatedFee: '0.001',
          estimatedTotal: '1.001',
          expiresAt: expiryTime,
          amountWithFeeInFiat: '30030',
          amountNoFeeInFiat: '30000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      // Try to start withdrawal, quote should be expired
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-exact-expiry' });

      // Simulating backend detecting expired quote during processing
      // NOTE: Withdrawal states take precedence over quote expiration to prevent race conditions
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal has started, so state remains in withdraw:processing
      // This is correct behavior - prevents unsafe transitions during critical operations
      expect(machine.getState().type).toBe('withdraw:processing');
    });

    it('should handle using expired quote ID', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-expired',
          asset: 'BTC',
          amount: '1.0',
          estimatedFee: '0.001',
          estimatedTotal: '1.001',
          expiresAt: Date.now() - 1000,  // Already expired!
          amountWithFeeInFiat: '30030',
          amountNoFeeInFiat: '30000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      // Even though quote is in system, it's expired
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-expired' });
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal has already started, state remains in processing
      // Backend will reject with appropriate error
      expect(machine.getState().type).toBe('withdraw:processing');
    });

    it('should handle quote expiring during 2FA entry', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-2fa-expiry',
          asset: 'BTC',
          amount: '1.0',
          estimatedFee: '0.001',
          estimatedTotal: '1.001',
          expiresAt: Date.now() + 500,  // Short expiry
          amountWithFeeInFiat: '30030',
          amountNoFeeInFiat: '30000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-2fa-expiry' });
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });

      expect(machine.getState().type).toBe('withdraw:error2FA');

      // User takes too long, quote expires
      // Attempting to submit 2FA triggers quote check
      machine.send({ type: 'SUBMIT_2FA', code: '123456' });
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal is in progress, so state remains in processing
      // This prevents race conditions - withdrawal error will come from backend
      expect(machine.getState().type).toBe('withdraw:processing');
    });
  });

  describe('Amount Validation Edge Cases', () => {
    it('should handle dust amount (below network minimum)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '0.001' }]
      });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.00000001',  // 1 satoshi - too small
        destinationAddress: '1A1zP...',
      });

      // Backend rejects dust amount
      machine.send({
        type: 'QUOTE_FAILED',
        error: new Error('Amount below minimum')
      });

      expect(machine.getState().type).toBe('quote:error');
      expect(machine.getState().error?.message).toBe('Amount below minimum');
    });

    it('should handle maximum withdrawal amount + smallest unit', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '100.0', 'BTC');

      // Attempting max + 1 satoshi
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '10.00000001',  // Max is 10.0
        destinationAddress: '1A1zP...',
      });

      machine.send({
        type: 'QUOTE_FAILED',
        error: new Error('Amount above maximum')
      });

      expect(machine.getState().type).toBe('quote:error');
    });

    it('should handle withdrawal amount exactly at network minimum', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      const minAmount = '0.0001';  // Typical BTC minimum
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: minAmount,
        destinationAddress: '1A1zP...',
      });

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-min-exact',
          asset: 'BTC',
          amount: minAmount,
          estimatedFee: '0.0001',
          estimatedTotal: '0.0002',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '6',
          amountNoFeeInFiat: '3',
          estimatedFeeInFiat: '3',
          additionalInfo: { minWithdrawal: minAmount }
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.amount).toBe(minAmount);
    });

    it('should handle withdrawal amount exactly at network maximum', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '100.0', 'BTC');

      const maxAmount = '10.0';
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: maxAmount,
        destinationAddress: '1A1zP...',
      });

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-max-exact',
          asset: 'BTC',
          amount: maxAmount,
          estimatedFee: '0.001',
          estimatedTotal: '10.001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '300030',
          amountNoFeeInFiat: '300000',
          estimatedFeeInFiat: '30',
          additionalInfo: {
            minWithdrawal: '0.0001',
            maxWithdrawal: maxAmount
          }
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.amount).toBe(maxAmount);
    });
  });

  describe('Concurrent Withdrawal Scenarios', () => {
    it('should handle attempt to use same quote twice', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-reuse',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.001',
          estimatedTotal: '0.501',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15030',
          amountNoFeeInFiat: '15000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      // First withdrawal
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-reuse' });
      expect(machine.getState().type).toBe('withdraw:processing');

      // Complete first withdrawal
      machine.send({ type: 'WITHDRAWAL_SUCCESS', transactionId: 'tx-1' });
      machine.send({ type: 'WITHDRAWAL_COMPLETED', transactionId: 'tx-1' });
      expect(machine.getState().type).toBe('withdraw:completed');

      // Attempting to reuse same quote should be prevented
      // This should be caught at application level, but let's test state machine behavior
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-reuse' });

      // State machine should not allow transition from completed back to processing
      expect(machine.getState().type).toBe('withdraw:completed');
    });

    it('should handle withdrawal with non-existent quote ID', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '1.0', 'BTC');

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-real',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.001',
          estimatedTotal: '0.501',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15030',
          amountNoFeeInFiat: '15000',
          estimatedFeeInFiat: '30',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      // Try to use wrong quote ID
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-doesnt-exist' });

      // Backend should reject
      machine.send({
        type: 'WITHDRAWAL_FATAL',
        error: new Error('Quote not found')
      });

      expect(machine.getState().type).toBe('withdraw:fatal');
      expect(machine.getState().error?.message).toBe('Quote not found');
    });
  });

  describe('Asset and Network Mismatches', () => {
    it('should handle quote for asset not in wallet', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '1.0' }]  // Only BTC
      });

      // Request quote for ETH (not in wallet)
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'ETH',
        amount: '1.0',
        destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      });

      machine.send({
        type: 'QUOTE_FAILED',
        error: new Error('Asset not found in wallet')
      });

      expect(machine.getState().type).toBe('quote:error');
    });

    it('should handle multiple assets with same symbol different networks', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [
          {
            asset: 'USDT',
            balance: '1000',
            networks: [
              { id: 'ethereum', name: 'Ethereum', displayName: 'ERC-20', minWithdrawal: '10', assetName: 'USDT' },
              { id: 'tron', name: 'Tron', displayName: 'TRC-20', minWithdrawal: '1', assetName: 'USDT' }
            ]
          }
        ]
      });

      // Request quote for USDT on specific network
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'USDT',
        amount: '100',
        destinationAddress: 'TYourTronAddress...',
        network: 'tron'
      });

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-usdt-tron',
          asset: 'USDT',
          amount: '100',
          estimatedFee: '1',
          estimatedTotal: '101',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '101',
          amountNoFeeInFiat: '100',
          estimatedFeeInFiat: '1',
          additionalInfo: { minWithdrawal: '1' }
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.lastQuoteRequest?.network).toBe('tron');
    });
  });

  describe('Precision and Rounding Edge Cases', () => {
    it('should handle JavaScript floating point precision issues', () => {
      const machine = createFlowMachine(defaultOptions);
      setupToQuoteReady(machine, '0.3', 'BTC');

      // JavaScript: 0.1 + 0.2 = 0.30000000000000004
      const amount = '0.1';
      const fee = '0.2';
      const total = '0.30000000000000004';  // JS precision error

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-precision',
          asset: 'BTC',
          amount,
          estimatedFee: fee,
          estimatedTotal: total,
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '9000.12',
          amountNoFeeInFiat: '3000',
          estimatedFeeInFiat: '6000.12',
          additionalInfo: { minWithdrawal: '0.0001' }
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      // System should handle this gracefully
      expect(state.context.quote?.estimatedTotal).toBe(total);
    });

    it('should handle very large numbers (near MAX_SAFE_INTEGER)', () => {
      const machine = createFlowMachine(defaultOptions);

      // Simulating a scenario with very large fiat amounts
      const largeAmount = '9007199254740991';  // Near JS MAX_SAFE_INTEGER

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-123'
      });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'SHIB', balance: largeAmount }]
      });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'SHIB',
        amount: largeAmount,
        destinationAddress: '0x...',
      });

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-large',
          asset: 'SHIB',
          amount: largeAmount,
          estimatedFee: '1000',
          estimatedTotal: '9007199254741991',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '450.36',
          amountNoFeeInFiat: '450.00',
          estimatedFeeInFiat: '0.36',
          additionalInfo: { minWithdrawal: '1000000' }
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.amount).toBe(largeAmount);
    });
  });
});
