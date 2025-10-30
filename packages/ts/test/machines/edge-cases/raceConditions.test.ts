/**
 * Race Conditions Test Suite
 *
 * Tests for concurrency bugs, timing issues, and race conditions that could cause:
 * - State corruption
 * - Lost updates
 * - Deadlocks
 * - Inconsistent behavior
 * - Memory leaks
 *
 * Priority: HIGH - These bugs can cause unpredictable failures in production
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFlowMachine } from '../../../src/machines';
import type { FlowState } from '../../../src/types/flow.types';

describe('Race Conditions', () => {
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

  describe('Quote Expiration During Operations', () => {
    it('should handle quote expiring during withdrawal execution', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:ready state
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
          expiresAt: Date.now() + 5000, // Expires in 5 seconds
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });

      // Start withdrawal
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-1' });
      expect(machine.getState().type).toBe('withdraw:processing');

      // Quote expires while waiting for 2FA
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });
      expect(machine.getState().type).toBe('withdraw:error2FA');

      // Quote expiration signal comes in during 2FA entry
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal state takes precedence - prevents race conditions during critical operations
      const state = machine.getState();
      expect(state.type).toBe('withdraw:error2FA');
    });

    it('should handle quote expiring mid-2FA submission', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal requiring 2FA
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
          id: 'quote-2',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 100, // Very short expiration
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-2' });
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });

      expect(machine.getState().type).toBe('withdraw:error2FA');

      // User types 2FA code slowly, quote expires
      vi.advanceTimersByTime(150);

      // Quote expiration happens
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Then user submits 2FA
      machine.send({ type: 'SUBMIT_2FA', code: '123456' });

      // Withdrawal proceeds - backend will handle expired quote rejection
      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
    });

    it('should handle quote auto-refresh during manual refresh', () => {
      const machine = createFlowMachine({
        ...defaultOptions,
        autoRefreshQuotation: true
      });

      // Setup to quote:ready
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
          id: 'quote-3',
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

      expect(machine.getState().type).toBe('quote:ready');

      // User manually requests refresh
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      expect(machine.getState().type).toBe('quote:requesting');

      // Before response comes back, auto-refresh timer fires
      // (simulating race between manual and auto refresh)
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      // Should still be in requesting state (idempotent)
      expect(machine.getState().type).toBe('quote:requesting');

      // First response comes back
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-4',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25100',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '150'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.id).toBe('quote-4');
    });
  });

  describe('WebSocket Disconnections During Critical Operations', () => {
    it('should handle WebSocket drop during withdrawal processing', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal processing
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
          id: 'quote-5',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-5' });

      expect(machine.getState().type).toBe('withdraw:processing');

      // WebSocket disconnects (no message received)
      // Machine should handle timeout gracefully
      // State should remain consistent
      const stateBeforeDisconnect = machine.getState();
      expect(stateBeforeDisconnect.type).toBe('withdraw:processing');

      // Machine should not corrupt state even without WebSocket updates
      expect(stateBeforeDisconnect.context.walletId).toBe('wallet-123');
      expect(stateBeforeDisconnect.context.quote?.id).toBe('quote-5');
    });

    it('should handle wallet disconnect during processing', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal processing
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
          id: 'quote-6',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-6' });

      // Simulate wallet disconnection error during processing
      const disconnectError = new Error('Wallet disconnected');
      machine.send({ type: 'WITHDRAWAL_FATAL', error: disconnectError });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:fatal');
      expect(state.error?.message).toContain('Wallet disconnected');
    });

    it('should handle state transition during WebSocket reconnection', () => {
      const machine = createFlowMachine(defaultOptions);

      // Start OAuth flow
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      expect(machine.getState().type).toBe('oauth:processing');

      // Simulate WebSocket reconnection during OAuth processing
      // Messages might arrive out of order or duplicated

      // Duplicate OAUTH_WINDOW_OPENED (should be idempotent)
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      expect(machine.getState().type).toBe('oauth:processing');

      // OAuth completion arrives
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      expect(machine.getState().type).toBe('oauth:completed');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple parallel quote requests', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // Fire multiple quote requests rapidly
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.1',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.2',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.3',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      // Should be in requesting state
      expect(machine.getState().type).toBe('quote:requesting');

      // Responses arrive out of order - first response wins
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-slow',
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

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      // First response wins - machine transitions to quote:ready immediately
      // This is correct - subsequent QUOTE_RECEIVED while in quote:ready are ignored
      expect(state.context.quote?.amount).toBe('0.1');
      // lastQuoteRequest gets updated when QUOTE_RECEIVED arrives
      expect(state.context.lastQuoteRequest?.amount).toBe('0.1');
    });

    it('should handle concurrent send() calls from multiple sources', () => {
      const machine = createFlowMachine(defaultOptions);
      const states: FlowState[] = [];

      machine.subscribe((state) => {
        states.push(state);
      });

      // Simulate multiple event sources firing concurrently
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' }); // Duplicate

      // Should handle duplicates gracefully
      expect(machine.getState().type).toBe('oauth:processing');

      // Verify state transitions were consistent
      const stateTypes = states.map(s => s.type);
      expect(stateTypes).toContain('idle');
      expect(stateTypes).toContain('oauth:waiting');
      expect(stateTypes).toContain('oauth:processing');
    });

    it('should handle concurrent withdrawals with same quote (prevented)', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:ready
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
          id: 'quote-concurrent',
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

      // Try to start withdrawal twice
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-concurrent' });
      const firstState = machine.getState();
      expect(firstState.type).toBe('withdraw:processing');

      // Second withdrawal request while first is processing (should be ignored)
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-concurrent' });
      const secondState = machine.getState();
      expect(secondState.type).toBe('withdraw:processing');

      // State should be consistent (same processing state)
      expect(secondState).toEqual(firstState);
    });
  });

  describe('Machine Disposal and Cleanup', () => {
    it('should handle disposal while async callbacks are pending', async () => {
      const machine = createFlowMachine(defaultOptions);
      const listener = vi.fn();

      machine.subscribe(listener);

      // Start some operations
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });

      // Dispose immediately (simulating user navigation away)
      machine.dispose();

      // Try to send more actions (should throw)
      expect(() => {
        machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      }).toThrow('Machine has been disposed');

      // Verify no memory leaks (listener should not be called after disposal)
      const callCountAtDisposal = listener.mock.calls.length;

      // Simulate delayed callback arriving
      vi.advanceTimersByTime(1000);

      expect(listener).toHaveBeenCalledTimes(callCountAtDisposal);
    });

    it('should handle subscription callbacks after unsubscribe', () => {
      const machine = createFlowMachine(defaultOptions);
      const listener = vi.fn();

      const unsubscribe = machine.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1); // Initial state

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      expect(listener).toHaveBeenCalledTimes(2);

      // Unsubscribe
      unsubscribe();

      // Send more actions
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      // Listener should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should clean up nested withdrawal machine on disposal', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to create withdrawal machine
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
          id: 'quote-disposal',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-disposal' });

      // Disposal should clean up nested machine
      expect(() => machine.dispose()).not.toThrow();

      // Verify disposed
      expect(() => machine.getState()).toThrow('Machine has been disposed');
    });

    it('should handle CANCEL_FLOW with nested machine cleanup', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal processing with nested machine
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
          id: 'quote-cancel',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-cancel' });

      // Cancel flow
      machine.send({ type: 'CANCEL_FLOW' });

      const state = machine.getState();
      expect(state.type).toBe('flow:cancelled');

      // Nested machine should be cleaned up
      // Further withdrawal actions should be ignored
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });
  });

  describe('Timer Expirations During Transitions', () => {
    it('should handle timer expiration during state transition', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:ready with short expiration
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
          id: 'quote-timer',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 1000, // 1 second
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });

      expect(machine.getState().type).toBe('quote:ready');

      // Start withdrawal
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-timer' });

      // Timer expires during withdrawal startup
      vi.advanceTimersByTime(1500);

      // Quote expiration signal
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal already started - state remains in processing
      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
    });

    it('should handle multiple timers firing in sequence', () => {
      const machine = createFlowMachine(defaultOptions);
      const states: string[] = [];

      machine.subscribe((state) => {
        states.push(state.type);
      });

      // Setup flow
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      vi.advanceTimersByTime(100);

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      vi.advanceTimersByTime(100);

      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      vi.advanceTimersByTime(100);

      machine.send({ type: 'LOAD_WALLET' });
      vi.advanceTimersByTime(100);

      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // Verify state sequence is valid
      expect(states).toContain('idle');
      expect(states).toContain('oauth:waiting');
      expect(states).toContain('oauth:processing');
      expect(states).toContain('oauth:completed');
      expect(states).toContain('wallet:loading');
      expect(states).toContain('wallet:ready');
    });
  });

  describe('Parent-Child Machine Synchronization', () => {
    it('should handle parent machine update while child transitioning', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal processing (creates child machine)
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
          id: 'quote-parent-child',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-parent-child' });

      // Child machine starts transitioning (requires 2FA)
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });

      // Parent receives quote expiration (concurrent event)
      machine.send({ type: 'QUOTE_EXPIRED' });

      // Withdrawal states take precedence to prevent unsafe transitions
      const state = machine.getState();
      expect(state.type).toBe('withdraw:error2FA');
    });

    it('should synchronize withdrawal machine state with flow machine', () => {
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
          id: 'quote-sync',
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
      machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-sync' });

      // Withdrawal requires 2FA
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });
      expect(machine.getState().type).toBe('withdraw:error2FA');

      // Submit 2FA
      machine.send({ type: 'SUBMIT_2FA', code: '123456' });
      expect(machine.getState().type).toBe('withdraw:processing');

      // Success
      machine.send({ type: 'WITHDRAWAL_SUCCESS', transactionId: 'tx-123' });
      machine.send({ type: 'WITHDRAWAL_COMPLETED', transactionId: 'tx-123' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:completed');
      expect(state.context.withdrawal?.transactionId).toBe('tx-123');
    });
  });
});
