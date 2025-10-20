import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFlowMachine, createWithdrawalMachine } from '../../src/machines';

/**
 * Edge Cases and Error Scenarios Tests
 *
 * This test suite covers edge cases, boundary conditions, and unusual scenarios:
 * - Concurrent operations
 * - Rapid state transitions
 * - Memory leak prevention
 * - Subscription cleanup
 * - Error boundary conditions
 * - Race conditions
 * - Invalid data handling
 */

describe('Edge Cases and Error Scenarios', () => {
  describe('Concurrent Operations', () => {
    it('should handle rapid consecutive actions', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Send multiple actions rapidly
      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-1',
        idem: 'oauth-1'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-1'
      });
      machine.send({ type: 'LOAD_WALLET' });

      // Should be in wallet:loading state
      expect(machine.getState().type).toBe('wallet:loading');
    });

    it('should handle multiple subscribers without interference', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      machine.subscribe(listener1);
      machine.subscribe(listener2);
      machine.subscribe(listener3);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      // All listeners should be called with the same state
      expect(listener1).toHaveBeenCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));
      expect(listener2).toHaveBeenCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));
      expect(listener3).toHaveBeenCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));

      // States should be identical
      const calls1 = listener1.mock.calls[listener1.mock.calls.length - 1][0];
      const calls2 = listener2.mock.calls[listener2.mock.calls.length - 1][0];
      const calls3 = listener3.mock.calls[listener3.mock.calls.length - 1][0];

      expect(calls1).toEqual(calls2);
      expect(calls2).toEqual(calls3);
    });

    it('should handle partial subscriber cleanup', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      machine.subscribe(listener1);
      const unsub2 = machine.subscribe(listener2);
      machine.subscribe(listener3);

      // Unsubscribe listener2
      unsub2();

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      // listener1 and listener3 should be called, but not listener2
      expect(listener1).toHaveBeenCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));
      expect(listener3).toHaveBeenCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));
      expect(listener2.mock.calls.length).toBe(1); // Only initial call
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maxRetries = 0', () => {
      const machine = createWithdrawalMachine({ maxRetries: 0 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error: new Error('First failure') });

      // Should go directly to failed without retrying
      expect(machine.getState().type).toBe('failed');
      expect(machine.getState().context.retryCount).toBe(0);
    });

    it('should handle very high maxRetries', () => {
      const machine = createWithdrawalMachine({ maxRetries: 100 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      // Fail once
      machine.send({ type: 'FAIL', error: new Error('Error') });
      expect(machine.getState().type).toBe('retrying');
      expect(machine.getState().context.retryCount).toBe(1);

      // Should still be able to retry
      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('processing');
    });

    it('should handle empty walletBalances array', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

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
      machine.send({ type: 'WALLET_LOADED', balances: [] });

      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances).toEqual([]);
    });

    it('should handle undefined optional fields', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

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
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-789',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15003',
          amountNoFeeInFiat: '15000',
          estimatedFeeInFiat: '3'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-789' });

      // Success without transactionId
      machine.send({ type: 'WITHDRAWAL_SUCCESS' });
      machine.send({ type: 'WITHDRAWAL_COMPLETED', transactionId: '' });

      expect(machine.getState().type).toBe('withdraw:completed');
    });

    it('should handle extremely long strings in context', () => {
      const longString = 'a'.repeat(10000);
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: longString,
        idem: 'oauth-456'
      });

      const state = machine.getState();
      expect(state.context.walletId).toBe(longString);
      expect(state.context.walletId?.length).toBe(10000);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should cleanup all subscribers on disposal', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listeners = Array.from({ length: 100 }, () => vi.fn());

      listeners.forEach(listener => machine.subscribe(listener));

      machine.dispose();

      // No further notifications should occur
      expect(() => machine.getState()).toThrow('Machine has been disposed');
    });

    it('should not leak memory with many state transitions', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener = vi.fn();
      machine.subscribe(listener);

      // Perform many state transitions
      for (let i = 0; i < 100; i++) {
        machine.send({
          type: 'START_OAUTH',
          exchange: 'coinbase',
          walletId: `wallet-${i}`,
          idem: `oauth-${i}`
        });
        machine.send({ type: 'CANCEL_FLOW' });
      }

      // Listener should have been called many times (at least 100 transitions)
      // Note: Some transitions may not trigger state changes if already in that state
      expect(listener.mock.calls.length).toBeGreaterThan(100);

      // Machine should still be functional
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should properly cleanup nested withdrawal machine', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Create nested withdrawal machine
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
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-789',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15003',
          amountNoFeeInFiat: '15000',
          estimatedFeeInFiat: '3'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-789' });

      // Dispose should cleanup nested machine
      machine.dispose();

      expect(() => machine.getState()).toThrow('Machine has been disposed');
    });

    it('should handle unsubscribe called multiple times', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener = vi.fn();
      const unsubscribe = machine.subscribe(listener);

      // Call unsubscribe multiple times
      unsubscribe();
      unsubscribe();
      unsubscribe();

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      // Listener should only have been called once (initial)
      expect(listener.mock.calls.length).toBe(1);
    });
  });

  describe('Error Object Handling', () => {
    it('should handle Error objects correctly', () => {
      const machine = createWithdrawalMachine();
      const error = new Error('Test error');
      error.stack = 'test stack';

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error });

      const state = machine.getState();
      expect(state.error).toBe(error);
      expect(state.error?.message).toBe('Test error');
      expect(state.error?.stack).toBe('test stack');
    });

    it('should preserve error through state transitions', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const oauthError = new Error('OAuth failed');

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: oauthError });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      expect(state.error).toBe(oauthError);
      expect(state.error?.message).toBe('OAuth failed');
    });

    it('should clear error on successful transitions', () => {
      const machine = createWithdrawalMachine({ maxRetries: 2 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      // Fail once
      machine.send({ type: 'FAIL', error: new Error('Temporary error') });
      expect(machine.getState().error).toBeTruthy();

      // Retry successfully
      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('processing');
      expect(machine.getState().error).toBeNull();
    });
  });

  describe('State Reference Consistency', () => {
    it('should return consistent state reference when no transitions occur', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const state1 = machine.getState();
      const state2 = machine.getState();

      // States should be equal (same type and context)
      expect(state1.type).toBe(state2.type);
      expect(state1.context.orgId).toBe(state2.context.orgId);
    });

    it('should update state reference after transition', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const state1 = machine.getState();
      expect(state1.type).toBe('idle');

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      const state2 = machine.getState();
      expect(state2.type).toBe('oauth:waiting');
      expect(state2.type).not.toBe(state1.type);
    });
  });

  describe('Rapid State Transitions', () => {
    it('should handle very rapid transitions without losing state', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener = vi.fn();
      machine.subscribe(listener);

      // Rapid fire transitions
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
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-789',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15003',
          amountNoFeeInFiat: '15000',
          estimatedFeeInFiat: '3'
        }
      });

      const finalState = machine.getState();
      expect(finalState.type).toBe('quote:ready');
      expect(finalState.context.walletBalances).toBeDefined();
      expect(finalState.context.quote).toBeDefined();

      // All transitions should have been captured
      expect(listener.mock.calls.length).toBeGreaterThan(5);
    });

    it('should handle rapid cancellations', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Start and cancel multiple times rapidly
      for (let i = 0; i < 10; i++) {
        machine.send({
          type: 'START_OAUTH',
          exchange: 'coinbase',
          walletId: `wallet-${i}`,
          idem: `oauth-${i}`
        });
        machine.send({ type: 'CANCEL_FLOW' });
      }

      expect(machine.getState().type).toBe('flow:cancelled');
    });
  });

  describe('Idempotency Key Generation', () => {
    it('should generate unique idempotency keys across multiple machines', () => {
      const keys = new Set<string>();

      // Create multiple machines and collect their idempotency keys
      for (let i = 0; i < 100; i++) {
        const machine = createWithdrawalMachine();
        machine.send({
          type: 'EXECUTE',
          quoteId: 'quote',
          walletId: 'wallet'
        });

        const key = machine.getState().context.idempotencyKey;
        keys.add(key);
      }

      // All keys should be unique
      expect(keys.size).toBe(100);
    });

    it('should generate new key on each retry', () => {
      const machine = createWithdrawalMachine({ maxRetries: 5 });
      const keys = new Set<string>();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote',
        walletId: 'wallet'
      });

      keys.add(machine.getState().context.idempotencyKey);

      for (let i = 0; i < 5; i++) {
        machine.send({ type: 'FAIL', error: new Error('error') });
        machine.send({ type: 'RETRY' });
        keys.add(machine.getState().context.idempotencyKey);
      }

      // All keys should be unique
      expect(keys.size).toBe(6); // Initial + 5 retries
    });
  });

  describe('Context Data Integrity', () => {
    it('should maintain data integrity through complex flow', () => {
      const machine = createFlowMachine({
        orgId: 'org-123',
        projectId: 'proj-456',
        maxRetryAttempts: 5
      });

      // Start with OAuth
      machine.send({
        type: 'START_OAUTH',
        exchange: 'binance',
        walletId: 'wallet-abc',
        idem: 'oauth-xyz'
      });

      // Check context at each step
      let state = machine.getState();
      expect(state.context.orgId).toBe('org-123');
      expect(state.context.projectId).toBe('proj-456');
      expect(state.context.exchange).toBe('binance');
      expect(state.context.walletId).toBe('wallet-abc');

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      state = machine.getState();
      expect(state.context.orgId).toBe('org-123');
      expect(state.context.exchange).toBe('binance');

      machine.send({
        exchange: 'binance',
        type: 'OAUTH_COMPLETED',
        walletId: 'wallet-abc'
      });
      state = machine.getState();
      expect(state.context.orgId).toBe('org-123');
      expect(state.context.projectId).toBe('proj-456');
      expect(state.context.exchange).toBe('binance');

      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'ETH', balance: '5.0' }]
      });

      state = machine.getState();
      expect(state.context.orgId).toBe('org-123');
      expect(state.context.projectId).toBe('proj-456');
      expect(state.context.exchange).toBe('binance');
      expect(state.context.walletId).toBe('wallet-abc');
      expect(state.context.walletBalances).toHaveLength(1);
    });

    it('should not lose data on error states', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: new Error('Network error') });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      // Context should still be intact
      expect(state.context.orgId).toBe('test-org');
      expect(state.context.projectId).toBe('test-project');
      expect(state.context.exchange).toBe('coinbase');
      expect(state.context.walletId).toBe('wallet-123');
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle unicode in wallet IDs', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const unicodeWalletId = 'wallet-测试-🚀';

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: unicodeWalletId,
        idem: 'oauth-456'
      });

      expect(machine.getState().context.walletId).toBe(unicodeWalletId);
    });

    it('should handle special characters in error messages', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const error = new Error('Error with "quotes" and \'apostrophes\' and <tags>');

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error });

      const state = machine.getState();
      expect(state.error?.message).toContain('quotes');
      expect(state.error?.message).toContain('apostrophes');
      expect(state.error?.message).toContain('tags');
    });
  });

  describe('Disposal Edge Cases', () => {
    it('should throw on all operations after disposal', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      machine.dispose();

      expect(() => machine.getState()).toThrow('Machine has been disposed');
      expect(() => machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'w', idem: 'i' })).toThrow('Machine has been disposed');
      expect(() => machine.subscribe(() => {})).toThrow('Machine has been disposed');
    });

    it('should handle disposal during active subscriptions', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      machine.subscribe(listener1);
      machine.subscribe(listener2);

      // Send an action
      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      // Dispose
      machine.dispose();

      // Further actions should throw
      expect(() => machine.send({ type: 'OAUTH_WINDOW_OPENED' })).toThrow('Machine has been disposed');
    });

    it('should handle double disposal', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      machine.dispose();
      machine.dispose(); // Should not throw

      expect(() => machine.getState()).toThrow('Machine has been disposed');
    });
  });

  describe('Quote Expiration and Refresh Edge Cases', () => {
    it('should replace expired quote with new quote when requesting with same parameters', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Setup: Complete OAuth and wallet loading
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

      // Request initial quote
      const quoteParams = {
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        network: 'bitcoin'
      };

      machine.send({
        type: 'REQUEST_QUOTE',
        ...quoteParams
      });

      expect(machine.getState().type).toBe('quote:requesting');

      // Receive first quote (expires in 60 seconds)
      const initialTimestamp = Date.now();
      const firstQuote = {
        id: 'quote-first-12345',
        asset: 'BTC',
        amount: '0.5',
        estimatedFee: '0.0001',
        estimatedTotal: '0.5001',
        expiresAt: initialTimestamp + 60000, // 60 seconds from now
        amountWithFeeInFiat: '15003',
        amountNoFeeInFiat: '15000',
        estimatedFeeInFiat: '3'
      };

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: firstQuote
      });

      let state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote).toBeDefined();
      expect(state.context.quote?.id).toBe('quote-first-12345');
      expect(state.context.quote?.expiresAt).toBe(initialTimestamp + 60000);

      // Simulate quote expiration after 60 seconds
      machine.send({ type: 'QUOTE_EXPIRED' });

      state = machine.getState();
      expect(state.type).toBe('quote:expired');
      expect(state.error?.message).toContain('expired');
      // Old quote should still be in context until a new one is requested
      expect(state.context.quote?.id).toBe('quote-first-12345');

      // Request a new quote with the EXACT SAME parameters
      machine.send({
        type: 'REQUEST_QUOTE',
        ...quoteParams // Same parameters as before
      });

      state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      // Critical: Old quote should be cleared when requesting new quote
      expect(state.context.quote).toBeUndefined();

      // Receive new quote with different ID (simulating a fresh quote from the API)
      const newTimestamp = Date.now();
      const secondQuote = {
        id: 'quote-second-67890', // Different ID
        asset: 'BTC',
        amount: '0.5',
        estimatedFee: '0.00012', // Slightly different fee
        estimatedTotal: '0.50012',
        expiresAt: newTimestamp + 60000, // New expiration timestamp
        amountWithFeeInFiat: '15004',
        amountNoFeeInFiat: '15000',
        estimatedFeeInFiat: '4'
      };

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: secondQuote
      });

      state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.error).toBeNull(); // Error should be cleared

      // Verify the new quote is stored in state
      expect(state.context.quote).toBeDefined();
      expect(state.context.quote?.id).toBe('quote-second-67890');
      expect(state.context.quote?.id).not.toBe('quote-first-12345');

      // Verify all quote properties are from the new quote
      expect(state.context.quote?.expiresAt).toBe(newTimestamp + 60000);
      expect(state.context.quote?.estimatedFee).toBe('0.00012');
      expect(state.context.quote?.estimatedTotal).toBe('0.50012');
      expect(state.context.quote?.amountWithFeeInFiat).toBe('15004');
    });

    it('should clear old quote when requesting new quote from quote:ready state', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Setup to quote:ready state
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
        balances: [{ asset: 'ETH', balance: '5.0' }]
      });

      // First quote
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'ETH',
        amount: '1.0',
        destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-old',
          asset: 'ETH',
          amount: '1.0',
          estimatedFee: '0.005',
          estimatedTotal: '1.005',
          expiresAt: Date.now() + 60000,
          amountWithFeeInFiat: '3015',
          amountNoFeeInFiat: '3000',
          estimatedFeeInFiat: '15'
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.id).toBe('quote-old');

      // Request a new quote while still in quote:ready (auto-refresh scenario)
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'ETH',
        amount: '1.0',
        destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      });

      // Should transition to quote:requesting and clear old quote
      let state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.quote).toBeUndefined(); // Old quote cleared

      // Receive new quote
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-new',
          asset: 'ETH',
          amount: '1.0',
          estimatedFee: '0.006',
          estimatedTotal: '1.006',
          expiresAt: Date.now() + 60000,
          amountWithFeeInFiat: '3018',
          amountNoFeeInFiat: '3000',
          estimatedFeeInFiat: '18'
        }
      });

      state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.id).toBe('quote-new');
      expect(state.context.quote?.id).not.toBe('quote-old');
    });

    it('should handle multiple quote expirations and refreshes in sequence', () => {
      const machine = createFlowMachine({
        orgId: 'test-org',
        projectId: 'test-project'
      });

      // Setup
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
        balances: [{ asset: 'BTC', balance: '10.0' }]
      });

      const quoteParams = {
        asset: 'BTC',
        amount: '2.0',
        destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      };

      // First quote cycle
      machine.send({ type: 'REQUEST_QUOTE', ...quoteParams });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '2.0',
          estimatedFee: '0.0001',
          estimatedTotal: '2.0001',
          expiresAt: Date.now() + 60000,
          amountWithFeeInFiat: '60003',
          amountNoFeeInFiat: '60000',
          estimatedFeeInFiat: '3'
        }
      });
      expect(machine.getState().context.quote?.id).toBe('quote-1');

      // Expire and refresh - cycle 2
      machine.send({ type: 'QUOTE_EXPIRED' });
      expect(machine.getState().type).toBe('quote:expired');

      machine.send({ type: 'REQUEST_QUOTE', ...quoteParams });
      expect(machine.getState().context.quote).toBeUndefined();

      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-2',
          asset: 'BTC',
          amount: '2.0',
          estimatedFee: '0.00015',
          estimatedTotal: '2.00015',
          expiresAt: Date.now() + 60000,
          amountWithFeeInFiat: '60005',
          amountNoFeeInFiat: '60000',
          estimatedFeeInFiat: '5'
        }
      });
      expect(machine.getState().context.quote?.id).toBe('quote-2');

      // Expire and refresh - cycle 3
      machine.send({ type: 'QUOTE_EXPIRED' });
      machine.send({ type: 'REQUEST_QUOTE', ...quoteParams });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-3',
          asset: 'BTC',
          amount: '2.0',
          estimatedFee: '0.0002',
          estimatedTotal: '2.0002',
          expiresAt: Date.now() + 60000,
          amountWithFeeInFiat: '60006',
          amountNoFeeInFiat: '60000',
          estimatedFeeInFiat: '6'
        }
      });

      const finalState = machine.getState();
      expect(finalState.type).toBe('quote:ready');
      expect(finalState.context.quote?.id).toBe('quote-3');
      expect(finalState.context.quote?.estimatedFee).toBe('0.0002');
      expect(finalState.error).toBeNull();
    });
  });
});
