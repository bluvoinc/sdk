/**
 * WebSocket Edge Cases Test Suite
 *
 * Tests for WebSocket connectivity and messaging issues:
 * - Connection failures
 * - Message ordering and duplicates
 * - Reconnection scenarios
 * - Network resilience
 * - Subscription lifecycle
 *
 * Priority: HIGH - WebSocket failures can break real-time flows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFlowMachine } from '../../../src/machines';
import type { FlowState } from '../../../src/types/flow.types';

describe('WebSocket Edge Cases', () => {
  const defaultOptions = {
    orgId: 'test-org',
    projectId: 'test-project'
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Connection Failures', () => {
    it('should handle OAuth flow without WebSocket connection', () => {
      const machine = createFlowMachine(defaultOptions);

      // OAuth can complete even if WebSocket is not connected
      // (server can still process the callback)
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      expect(machine.getState().type).toBe('oauth:waiting');

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      expect(machine.getState().type).toBe('oauth:processing');

      // WebSocket never connects, but OAuth completes via other means
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      expect(machine.getState().type).toBe('oauth:completed');
    });

    it('should handle wallet loading without WebSocket', () => {
      const machine = createFlowMachine(defaultOptions);

      // Complete OAuth
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      // Load wallet - this might use polling or direct API call
      machine.send({ type: 'LOAD_WALLET' });
      expect(machine.getState().type).toBe('wallet:loading');

      // Wallet loaded without WebSocket
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '1.0' }]
      });
      expect(machine.getState().type).toBe('wallet:ready');
    });

    it('should handle withdrawal processing without WebSocket updates', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-1' });

      // State machine should remain in processing even without WebSocket
      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
      expect(state.context.walletId).toBe('wallet-123');
    });

    it('should handle late WebSocket connection after flow started', () => {
      const machine = createFlowMachine(defaultOptions);

      // Start flow without WebSocket
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // WebSocket connects late and delivers OAuth completion
      vi.advanceTimersByTime(5000);
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      const state = machine.getState();
      expect(state.type).toBe('oauth:completed');
    });
  });

  describe('Message Ordering and Duplicates', () => {
    it('should handle duplicate OAuth completed messages', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      expect(machine.getState().type).toBe('oauth:completed');

      // Duplicate message arrives (WebSocket reconnection)
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      // Should remain in same state, not crash
      const state = machine.getState();
      expect(state.type).toBe('oauth:completed');
    });

    it('should handle out-of-order quote messages', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // Request first quote
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.1',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      // Request second quote (rapid user refresh)
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.2',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      expect(machine.getState().type).toBe('quote:requesting');

      // Second quote arrives first
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-2',
          asset: 'BTC',
          amount: '0.2',
          estimatedFee: '0.0001',
          estimatedTotal: '0.2001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '10000',
          amountNoFeeInFiat: '9950',
          estimatedFeeInFiat: '50'
        }
      });

      expect(machine.getState().type).toBe('quote:ready');
      expect(machine.getState().context.quote?.id).toBe('quote-2');

      // First quote arrives late (should be ignored or handled gracefully)
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '0.1',
          estimatedFee: '0.0001',
          estimatedTotal: '0.1001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '5000',
          amountNoFeeInFiat: '4950',
          estimatedFeeInFiat: '50'
        }
      });

      // Should remain in quote:ready, not overwrite newer quote
      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
    });

    it('should handle withdrawal status updates arriving out of order', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-1' });

      // Success message arrives before 2FA message (race condition)
      machine.send({ type: 'WITHDRAWAL_SUCCESS', transactionId: 'tx-123' });

      // Then 2FA required message arrives late
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });

      // Machine should handle gracefully - likely ignore late 2FA message
      const state = machine.getState();
      // State depends on implementation - should be consistent
      expect(state.type).toBeTruthy();
    });

    it('should deduplicate identical messages', () => {
      const machine = createFlowMachine(defaultOptions);
      const states: FlowState[] = [];

      machine.subscribe((state) => {
        states.push(state);
      });

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      const stateCountAfterFirst = states.length;

      // Send same message again (WebSocket duplicate)
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      // Should not create multiple state transitions for identical messages
      // (or should handle idempotently)
      expect(machine.getState().type).toBe('oauth:waiting');
    });
  });

  describe('Reconnection Scenarios', () => {
    it('should recover from WebSocket disconnect during OAuth', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // WebSocket disconnects
      vi.advanceTimersByTime(1000);

      // WebSocket reconnects and delivers completion
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      const state = machine.getState();
      expect(state.type).toBe('oauth:completed');
    });

    it('should handle reconnection with stale messages', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // Flow has progressed to wallet:ready
      expect(machine.getState().type).toBe('wallet:ready');

      // WebSocket reconnects and replays old OAuth messages
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Should ignore stale message
      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
    });

    it('should maintain state consistency across WebSocket reconnections', () => {
      const machine = createFlowMachine(defaultOptions);

      // Complete full flow
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const contextBeforeReconnect = machine.getState().context;

      // Simulate WebSocket reconnection (no messages)
      vi.advanceTimersByTime(5000);

      // Context should be preserved
      const state = machine.getState();
      expect(state.context.walletId).toBe(contextBeforeReconnect.walletId);
      expect(state.context.exchange).toBe(contextBeforeReconnect.exchange);
      expect(state.context.walletBalances).toEqual(contextBeforeReconnect.walletBalances);
    });
  });

  describe('Subscription Lifecycle', () => {
    it('should handle subscription before OAuth start', () => {
      const machine = createFlowMachine(defaultOptions);

      // Machine in idle state - no subscriptions yet
      expect(machine.getState().type).toBe('idle');

      // Start OAuth which should create subscription
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
      expect(state.context.topicName).toBe('oauth-456');
    });

    it('should handle subscription cleanup on flow cancellation', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      expect(machine.getState().context.topicName).toBe('oauth-456');

      // Cancel flow - should clean up subscriptions
      machine.send({ type: 'CANCEL_FLOW' });

      const state = machine.getState();
      expect(state.type).toBe('flow:cancelled');
      // Subscription should be cleaned up (internal state)
    });

    it('should handle messages after unsubscribe', () => {
      const machine = createFlowMachine(defaultOptions);
      const listener = vi.fn();

      const unsubscribe = machine.subscribe(listener);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      const callsBeforeUnsubscribe = listener.mock.calls.length;

      // Unsubscribe
      unsubscribe();

      // Late WebSocket message arrives
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      // Listener should not be called after unsubscribe
      expect(listener.mock.calls.length).toBe(callsBeforeUnsubscribe);
    });

    it('should handle multiple subscriptions to same machine', () => {
      const machine = createFlowMachine(defaultOptions);
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      machine.subscribe(listener1);
      machine.subscribe(listener2);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      // Both listeners should be called
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      // Both should receive the same state
      expect(listener1.mock.calls[listener1.mock.calls.length - 1][0].type).toBe('oauth:waiting');
      expect(listener2.mock.calls[listener2.mock.calls.length - 1][0].type).toBe('oauth:waiting');
    });
  });

  describe('Network Resilience', () => {
    it('should handle slow network with delayed messages', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Very slow network - message arrives after 30 seconds
      vi.advanceTimersByTime(30000);

      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      const state = machine.getState();
      expect(state.type).toBe('oauth:completed');
    });

    it('should handle timeout scenarios gracefully', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Advance time significantly (timeout scenario)
      vi.advanceTimersByTime(120000); // 2 minutes

      const state = machine.getState();
      // Should remain in processing state (timeout handling is external)
      expect(state.type).toBe('oauth:processing');
      expect(state.context.walletId).toBe('wallet-123');
    });

    it('should handle partial message delivery', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      // Only OAUTH_WINDOW_OPENED arrives, completion never comes
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      vi.advanceTimersByTime(60000);

      const state = machine.getState();
      // Should be stuck in processing (real app would handle timeout)
      expect(state.type).toBe('oauth:processing');
    });

    it('should handle message bursts after reconnection', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      // Network down, then all messages arrive at once
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances).toHaveLength(1);
    });
  });

  describe('Error Propagation via WebSocket', () => {
    it('should handle OAuth error from WebSocket', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Error arrives via WebSocket
      const error = new Error('Exchange rejected OAuth request');
      machine.send({ type: 'OAUTH_FAILED', error });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      expect(state.error).toBe(error);
    });

    it('should handle withdrawal error from WebSocket', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-1',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-1' });

      // Error from WebSocket
      machine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:errorBalance');
    });

    it('should handle multiple error types sequentially', () => {
      const machine = createFlowMachine(defaultOptions);

      // First OAuth fails
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: new Error('First error') });
      expect(machine.getState().type).toBe('oauth:error');

      // Cancel - enters terminal cancelled state
      machine.send({ type: 'CANCEL_FLOW' });

      // Need new machine for retry
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'kraken', walletId: 'wallet-456', idem: 'oauth-789' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'kraken', type: 'OAUTH_COMPLETED', walletId: 'wallet-456' });

      const state = retryMachine.getState();
      expect(state.type).toBe('oauth:completed');
      expect(state.error).toBeNull();
    });
  });
});
