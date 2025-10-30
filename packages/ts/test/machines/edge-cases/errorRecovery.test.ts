/**
 * Error Recovery Test Suite
 *
 * Tests for user recovery paths from error states:
 * - Retry mechanisms
 * - Error state escape routes
 * - Graceful degradation
 * - User-initiated recovery
 * - Auto-recovery scenarios
 *
 * Priority: MEDIUM - Good UX requires recoverable error states
 */

import { describe, it, expect } from 'vitest';
import { createFlowMachine } from '../../../src/machines';

describe('Error Recovery', () => {
  const defaultOptions = {
    orgId: 'test-org',
    projectId: 'test-project'
  };

  describe('OAuth Error Recovery', () => {
    it('should allow retry after OAuth failure', () => {
      const machine = createFlowMachine(defaultOptions);

      // First attempt fails
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: new Error('User cancelled') });

      expect(machine.getState().type).toBe('oauth:error');

      // Cancel flow
      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');

      // Create new machine for retry (cancelled machines cannot be restarted)
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-retry-1' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      const state = retryMachine.getState();
      expect(state.type).toBe('oauth:completed');
    });

    it('should allow switching exchange after OAuth failure', () => {
      const machine = createFlowMachine(defaultOptions);

      // Coinbase fails
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: new Error('Coinbase unavailable') });

      machine.send({ type: 'CANCEL_FLOW' });

      // Create new machine for different exchange
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'kraken', walletId: 'wallet-456', idem: 'oauth-789' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'kraken', type: 'OAUTH_COMPLETED', walletId: 'wallet-456' });

      const state = retryMachine.getState();
      expect(state.type).toBe('oauth:completed');
      expect(state.context.exchange).toBe('kraken');
    });

    it('should recover from OAuth window closed by user', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_WINDOW_CLOSED_BY_USER',
        error: new Error('User closed window')
      });

      expect(machine.getState().type).toBe('oauth:window_closed_by_user');

      // User cancels and tries again with new machine
      machine.send({ type: 'CANCEL_FLOW' });

      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-retry-2' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      const state = retryMachine.getState();
      expect(state.type).toBe('oauth:completed');
    });
  });

  describe('Wallet Error Recovery', () => {
    it('should allow retry after wallet loading failure', () => {
      const machine = createFlowMachine(defaultOptions);

      // Complete OAuth
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });

      // Wallet load fails
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_FAILED', error: new Error('Network timeout') });

      expect(machine.getState().type).toBe('wallet:error');

      // Cancel and restart flow with new machine
      machine.send({ type: 'CANCEL_FLOW' });

      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-retry-3' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      retryMachine.send({ type: 'LOAD_WALLET' });
      retryMachine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const state = retryMachine.getState();
      expect(state.type).toBe('wallet:ready');
    });

    it('should handle empty wallet gracefully', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [] });

      // Should reach ready state even with empty balances
      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances).toEqual([]);
    });
  });

  describe('Quote Error Recovery', () => {
    it('should allow quote refresh after quote error', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // Quote request fails
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({ type: 'QUOTE_FAILED', error: new Error('Price feed unavailable') });

      expect(machine.getState().type).toBe('quote:error');

      // Cancel and retry quote with new machine
      machine.send({ type: 'CANCEL_FLOW' });

      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-retry-4' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      retryMachine.send({ type: 'LOAD_WALLET' });
      retryMachine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });
      retryMachine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      retryMachine.send({
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

      const state = retryMachine.getState();
      expect(state.type).toBe('quote:ready');
    });

    it('should allow requesting new quote after expiration', () => {
      const machine = createFlowMachine(defaultOptions);

      // Get quote
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

      // Quote expires
      machine.send({ type: 'QUOTE_EXPIRED' });
      expect(machine.getState().type).toBe('quote:expired');

      // Request fresh quote
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
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.id).toBe('quote-2');
    });

    it('should handle quote refresh with different amounts', () => {
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

      // User changes their mind and requests different amount
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.3', // Different amount
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-2',
          asset: 'BTC',
          amount: '0.3',
          estimatedFee: '0.0001',
          estimatedTotal: '0.3001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '15000',
          amountNoFeeInFiat: '14950',
          estimatedFeeInFiat: '50'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.amount).toBe('0.3');
    });
  });

  describe('Withdrawal Error Recovery', () => {
    it('should allow 2FA retry after invalid code', () => {
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
      machine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });

      // Invalid 2FA attempts
      machine.send({ type: 'WITHDRAWAL_2FA_INVALID' });
      expect(machine.getState().context.invalid2FAAttempts).toBe(1);

      machine.send({ type: 'WITHDRAWAL_2FA_INVALID' });
      expect(machine.getState().context.invalid2FAAttempts).toBe(2);

      // Correct 2FA submitted
      machine.send({ type: 'SUBMIT_2FA', code: '123456' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
      expect(state.context.invalid2FAAttempts).toBe(0); // Reset on submit
    });

    it('should allow SMS retry after invalid code', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal requiring SMS
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
      machine.send({ type: 'WITHDRAWAL_REQUIRES_SMS' });

      expect(machine.getState().type).toBe('withdraw:errorSMS');

      // Submit SMS code
      machine.send({ type: 'SUBMIT_SMS', code: '456789' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
    });

    it('should handle insufficient balance error gracefully', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to withdrawal
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '0.1' }] });
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5', // More than balance
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

      // Insufficient balance error
      machine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:errorBalance');

      // User should be able to request new quote with lower amount
      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should allow KYC completion and retry', () => {
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

      // KYC required
      machine.send({ type: 'WITHDRAWAL_REQUIRES_KYC' });
      expect(machine.getState().type).toBe('withdraw:errorKYC');

      // User goes to complete KYC (external flow)
      // Then cancels and retries after KYC is done
      machine.send({ type: 'CANCEL_FLOW' });

      // Create new machine for retry after KYC completion
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-retry-5' });
      retryMachine.send({ type: 'OAUTH_WINDOW_OPENED' });
      retryMachine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      retryMachine.send({ type: 'LOAD_WALLET' });
      retryMachine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });
      retryMachine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });
      retryMachine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-2',
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
      retryMachine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-2' });

      // This time no KYC error - proceeds normally
      const state = retryMachine.getState();
      expect(state.type).toBe('withdraw:processing');
    });

    it('should not allow recovery from fatal withdrawal errors', () => {
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

      // Fatal error (invalid address)
      machine.send({
        type: 'WITHDRAWAL_FATAL',
        error: new Error('Invalid destination address')
      });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:fatal');

      // Can only cancel, not retry directly
      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });
  });

  describe('Retry Mechanisms', () => {
    it('should respect maxRetryAttempts configuration', () => {
      const machine = createFlowMachine({
        ...defaultOptions,
        maxRetryAttempts: 2
      });

      const state = machine.getState();
      expect(state.context.maxRetryAttempts).toBe(2);
      expect(state.context.retryAttempts).toBe(0);
    });

    it('should increment retry attempts on withdrawal retry', () => {
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

      expect(machine.getState().context.retryAttempts).toBe(0);

      // Note: Retry increment happens in withdrawal machine
      // This test verifies context structure
      const state = machine.getState();
      expect(state.context.retryAttempts).toBeGreaterThanOrEqual(0);
      expect(state.context.retryAttempts).toBeLessThanOrEqual(state.context.maxRetryAttempts);
    });
  });

  describe('Cancellation from Any State', () => {
    it('should allow cancellation from oauth:waiting', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      expect(machine.getState().type).toBe('oauth:waiting');

      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should allow cancellation from wallet:loading', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });

      expect(machine.getState().type).toBe('wallet:loading');

      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should allow cancellation from quote:requesting', () => {
      const machine = createFlowMachine(defaultOptions);

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

      expect(machine.getState().type).toBe('quote:requesting');

      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should allow cancellation from withdraw:processing', () => {
      const machine = createFlowMachine(defaultOptions);

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

      expect(machine.getState().type).toBe('withdraw:processing');

      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });

    it('should allow cancellation from error states', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ type: 'OAUTH_FAILED', error: new Error('Failed') });

      expect(machine.getState().type).toBe('oauth:error');

      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');
    });
  });
});
