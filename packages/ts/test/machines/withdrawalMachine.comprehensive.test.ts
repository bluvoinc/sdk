import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWithdrawalMachine } from '../../src/machines';

/**
 * Comprehensive WithdrawalMachine State Transition Tests
 *
 * This test suite ensures complete coverage of ALL possible state transitions
 * in the WithdrawalMachine, including:
 * - All valid state transitions
 * - Invalid state transitions (should not change state)
 * - Terminal state enforcement (completed, blocked, failed)
 * - Context preservation and updates
 * - Retry mechanisms and limits
 * - Edge cases and boundary conditions
 */

describe('WithdrawalMachine - Complete State Transition Coverage', () => {
  describe('Initial State', () => {
    it('should start in idle state with default context', () => {
      const machine = createWithdrawalMachine();
      const state = machine.getState();

      expect(state.type).toBe('idle');
      expect(state.context.quoteId).toBe('');
      expect(state.context.walletId).toBe('');
      expect(state.context.idempotencyKey).toBe('');
      expect(state.context.retryCount).toBe(0);
      expect(state.context.maxRetries).toBe(3);
      expect(state.error).toBeNull();
    });

    it('should accept custom initial context', () => {
      const machine = createWithdrawalMachine({
        quoteId: 'quote-123',
        walletId: 'wallet-456',
        maxRetries: 5
      });

      const state = machine.getState();
      expect(state.context.quoteId).toBe('quote-123');
      expect(state.context.walletId).toBe('wallet-456');
      expect(state.context.maxRetries).toBe(5);
    });

    it('should merge partial context with defaults', () => {
      const machine = createWithdrawalMachine({
        quoteId: 'quote-999'
      });

      const state = machine.getState();
      expect(state.context.quoteId).toBe('quote-999');
      expect(state.context.walletId).toBe(''); // Default
      expect(state.context.maxRetries).toBe(3); // Default
    });
  });

  describe('idle → processing (EXECUTE action)', () => {
    it('should transition from idle to processing', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      const state = machine.getState();
      expect(state.type).toBe('processing');
      expect(state.context.quoteId).toBe('quote-123');
      expect(state.context.walletId).toBe('wallet-456');
      expect(state.context.retryCount).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should generate new idempotency key on execute', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      const state = machine.getState();
      expect(state.context.idempotencyKey).toBeTruthy();
      expect(state.context.idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should reset retry count on new execution', () => {
      const machine = createWithdrawalMachine({
        retryCount: 2 // Start with some retries
      });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      const state = machine.getState();
      expect(state.context.retryCount).toBe(0); // Should reset
    });
  });

  describe('processing → waitingFor2FA (REQUIRES_2FA)', () => {
    it('should transition from processing to waitingFor2FA', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'REQUIRES_2FA' });

      const state = machine.getState();
      expect(state.type).toBe('waitingFor2FA');
      expect(state.context.requiredActions).toContain('2fa');
      expect(state.error).toBeNull();
    });

    it('should preserve quote and wallet context', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-abc',
        walletId: 'wallet-xyz'
      });

      machine.send({ type: 'REQUIRES_2FA' });

      const state = machine.getState();
      expect(state.context.quoteId).toBe('quote-abc');
      expect(state.context.walletId).toBe('wallet-xyz');
    });
  });

  describe('waitingFor2FA → processing (SUBMIT_2FA)', () => {
    it('should transition back to processing after submitting 2FA', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });

      const previousIdem = machine.getState().context.idempotencyKey;

      machine.send({ type: 'SUBMIT_2FA', code: '123456' });

      const state = machine.getState();
      expect(state.type).toBe('processing');
      expect(state.context.twoFactorCode).toBe('123456');
      expect(state.context.requiredActions).toBeUndefined();
      expect(state.context.idempotencyKey).toBe(previousIdem); // Should not change
    });

    it('should clear required actions after submitting 2FA', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });

      expect(machine.getState().context.requiredActions).toContain('2fa');

      machine.send({ type: 'SUBMIT_2FA', code: '123456' });

      expect(machine.getState().context.requiredActions).toBeUndefined();
    });

    it('should store the 2FA code in context', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });
      machine.send({ type: 'SUBMIT_2FA', code: '987654' });

      const state = machine.getState();
      expect(state.context.twoFactorCode).toBe('987654');
    });
  });

  describe('processing → waitingForSMS (REQUIRES_SMS)', () => {
    it('should transition from processing to waitingForSMS', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'REQUIRES_SMS' });

      const state = machine.getState();
      expect(state.type).toBe('waitingForSMS');
      expect(state.context.requiredActions).toContain('sms');
      expect(state.error).toBeNull();
    });
  });

  describe('waitingForSMS → processing (SUBMIT_SMS)', () => {
    it('should transition back to processing after submitting SMS', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_SMS' });

      const previousIdem = machine.getState().context.idempotencyKey;

      machine.send({ type: 'SUBMIT_SMS', code: '654321' });

      const state = machine.getState();
      expect(state.type).toBe('processing');
      expect(state.context.smsCode).toBe('654321');
      expect(state.context.requiredActions).toBeUndefined();
      expect(state.context.idempotencyKey).toBe(previousIdem);
    });

    it('should store the SMS code in context', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_SMS' });
      machine.send({ type: 'SUBMIT_SMS', code: '111222' });

      const state = machine.getState();
      expect(state.context.smsCode).toBe('111222');
    });
  });

  describe('processing → waitingForKYC (REQUIRES_KYC)', () => {
    it('should transition from processing to waitingForKYC', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'REQUIRES_KYC' });

      const state = machine.getState();
      expect(state.type).toBe('waitingForKYC');
      expect(state.context.requiredActions).toContain('kyc');
      expect(state.error).toBeNull();
    });

    it('should preserve all context during KYC wait', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-abc',
        walletId: 'wallet-xyz'
      });

      const processingIdem = machine.getState().context.idempotencyKey;

      machine.send({ type: 'REQUIRES_KYC' });

      const state = machine.getState();
      expect(state.context.quoteId).toBe('quote-abc');
      expect(state.context.walletId).toBe('wallet-xyz');
      expect(state.context.idempotencyKey).toBe(processingIdem);
    });
  });

  describe('processing → completed (SUCCESS)', () => {
    it('should transition from processing to completed', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'SUCCESS', transactionId: 'tx-789' });

      const state = machine.getState();
      expect(state.type).toBe('completed');
      expect(state.context.transactionId).toBe('tx-789');
      expect(state.error).toBeNull();
    });

    it('should handle success without transaction ID', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'SUCCESS' });

      const state = machine.getState();
      expect(state.type).toBe('completed');
      expect(state.context.transactionId).toBeUndefined();
    });
  });

  describe('processing → retrying → processing (FAIL & RETRY)', () => {
    it('should transition to retrying on first failure', () => {
      const machine = createWithdrawalMachine({ maxRetries: 3 });
      const error = new Error('Network timeout');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error });

      const state = machine.getState();
      expect(state.type).toBe('retrying');
      expect(state.context.retryCount).toBe(1);
      expect(state.context.lastError).toBe(error);
      expect(state.error).toBe(error);
    });

    it('should transition back to processing on RETRY', () => {
      const machine = createWithdrawalMachine({ maxRetries: 3 });
      const error = new Error('Network timeout');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      const firstIdem = machine.getState().context.idempotencyKey;

      machine.send({ type: 'FAIL', error });
      machine.send({ type: 'RETRY' });

      const state = machine.getState();
      expect(state.type).toBe('processing');
      expect(state.context.retryCount).toBe(1); // Preserved from retrying state
      expect(state.context.idempotencyKey).not.toBe(firstIdem); // New key generated
    });

    it('should generate new idempotency key on each retry', () => {
      const machine = createWithdrawalMachine({ maxRetries: 3 });
      const error = new Error('Temporary error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      const idem1 = machine.getState().context.idempotencyKey;

      machine.send({ type: 'FAIL', error });
      machine.send({ type: 'RETRY' });

      const idem2 = machine.getState().context.idempotencyKey;

      machine.send({ type: 'FAIL', error });
      machine.send({ type: 'RETRY' });

      const idem3 = machine.getState().context.idempotencyKey;

      expect(idem1).not.toBe(idem2);
      expect(idem2).not.toBe(idem3);
      expect(idem1).not.toBe(idem3);
    });

    it('should increment retry count on each failure', () => {
      const machine = createWithdrawalMachine({ maxRetries: 3 });
      const error = new Error('Error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error });
      expect(machine.getState().context.retryCount).toBe(1);

      machine.send({ type: 'RETRY' });
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().context.retryCount).toBe(2);

      machine.send({ type: 'RETRY' });
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().context.retryCount).toBe(3);
    });

    it('should transition to failed after max retries exceeded', () => {
      const machine = createWithdrawalMachine({ maxRetries: 2 });
      const error = new Error('Persistent error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      // First failure
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().type).toBe('retrying');
      expect(machine.getState().context.retryCount).toBe(1);

      // Retry and fail again
      machine.send({ type: 'RETRY' });
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().type).toBe('retrying');
      expect(machine.getState().context.retryCount).toBe(2);

      // Retry and fail third time - should go to failed
      machine.send({ type: 'RETRY' });
      machine.send({ type: 'FAIL', error });

      const state = machine.getState();
      expect(state.type).toBe('failed');
      expect(state.context.lastError).toBe(error);
      expect(state.error).toBe(error);
    });

    it('should respect maxRetries = 0 (no retries)', () => {
      const machine = createWithdrawalMachine({ maxRetries: 0 });
      const error = new Error('Error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error });

      const state = machine.getState();
      expect(state.type).toBe('failed');
      expect(state.context.retryCount).toBe(0);
    });

    it('should respect maxRetries = 1 (one retry)', () => {
      const machine = createWithdrawalMachine({ maxRetries: 1 });
      const error = new Error('Error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'FAIL', error });
      expect(machine.getState().type).toBe('retrying');

      machine.send({ type: 'RETRY' });
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().type).toBe('failed');
    });
  });

  describe('processing → blocked (BLOCKED)', () => {
    it('should transition from processing to blocked', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'BLOCKED', reason: 'Account suspended' });

      const state = machine.getState();
      expect(state.type).toBe('blocked');
      expect(state.error?.message).toBe('Account suspended');
    });

    it('should handle different block reasons', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      machine.send({ type: 'BLOCKED', reason: 'Compliance violation' });

      const state = machine.getState();
      expect(state.type).toBe('blocked');
      expect(state.error?.message).toBe('Compliance violation');
    });
  });

  describe('Terminal States - completed, blocked, failed', () => {
    it('completed should be a terminal state - no transitions allowed', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'SUCCESS', transactionId: 'tx-789' });

      expect(machine.getState().type).toBe('completed');

      // Try to transition out
      machine.send({ type: 'REQUIRES_2FA' });
      expect(machine.getState().type).toBe('completed'); // Should not change

      machine.send({ type: 'FAIL', error: new Error('test') });
      expect(machine.getState().type).toBe('completed'); // Should not change
    });

    it('blocked should be a terminal state - no transitions allowed', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'BLOCKED', reason: 'Account suspended' });

      expect(machine.getState().type).toBe('blocked');

      // Try to transition out
      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('blocked'); // Should not change

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('blocked'); // Should not change
    });

    it('failed should be a terminal state - no transitions allowed', () => {
      const machine = createWithdrawalMachine({ maxRetries: 0 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'FAIL', error: new Error('error') });

      expect(machine.getState().type).toBe('failed');

      // Try to transition out
      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('failed'); // Should not change

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('failed'); // Should not change
    });
  });

  describe('Invalid State Transitions', () => {
    it('should not transition from idle with non-EXECUTE action', () => {
      const machine = createWithdrawalMachine();

      machine.send({ type: 'REQUIRES_2FA' });
      expect(machine.getState().type).toBe('idle');

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('idle');

      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('idle');
    });

    it('should not transition from waitingFor2FA with wrong action', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });

      expect(machine.getState().type).toBe('waitingFor2FA');

      machine.send({ type: 'SUBMIT_SMS', code: '123' });
      expect(machine.getState().type).toBe('waitingFor2FA'); // Should not change

      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('waitingFor2FA'); // Should not change
    });

    it('should not transition from waitingForSMS with wrong action', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_SMS' });

      expect(machine.getState().type).toBe('waitingForSMS');

      machine.send({ type: 'SUBMIT_2FA', code: '123' });
      expect(machine.getState().type).toBe('waitingForSMS'); // Should not change

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('waitingForSMS'); // Should not change
    });

    it('should not transition from waitingForKYC (no action can move it)', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_KYC' });

      expect(machine.getState().type).toBe('waitingForKYC');

      machine.send({ type: 'SUBMIT_2FA', code: '123' });
      expect(machine.getState().type).toBe('waitingForKYC');

      machine.send({ type: 'RETRY' });
      expect(machine.getState().type).toBe('waitingForKYC');

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('waitingForKYC');
    });

    it('should not transition from retrying without RETRY action', () => {
      const machine = createWithdrawalMachine({ maxRetries: 3 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'FAIL', error: new Error('error') });

      expect(machine.getState().type).toBe('retrying');

      machine.send({ type: 'EXECUTE', quoteId: 'q', walletId: 'w' });
      expect(machine.getState().type).toBe('retrying'); // Should not change

      machine.send({ type: 'SUCCESS', transactionId: 'tx' });
      expect(machine.getState().type).toBe('retrying'); // Should not change
    });
  });

  describe('Subscription Management', () => {
    it('should notify subscriber on state change', () => {
      const machine = createWithdrawalMachine();
      const listener = vi.fn();

      machine.subscribe(listener);

      expect(listener).toHaveBeenCalledTimes(1); // Initial state

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'processing' }));
    });

    it('should not notify after unsubscribe', () => {
      const machine = createWithdrawalMachine();
      const listener = vi.fn();

      const unsubscribe = machine.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      expect(listener).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should notify multiple subscribers', () => {
      const machine = createWithdrawalMachine();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      machine.subscribe(listener1);
      machine.subscribe(listener2);
      machine.subscribe(listener3);

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      expect(listener1).toHaveBeenCalledWith(expect.objectContaining({ type: 'processing' }));
      expect(listener2).toHaveBeenCalledWith(expect.objectContaining({ type: 'processing' }));
      expect(listener3).toHaveBeenCalledWith(expect.objectContaining({ type: 'processing' }));
    });
  });

  describe('Disposal and Cleanup', () => {
    it('should throw when accessing disposed machine', () => {
      const machine = createWithdrawalMachine();

      machine.dispose();

      expect(() => machine.getState()).toThrow('Machine has been disposed');
    });

    it('should throw when sending to disposed machine', () => {
      const machine = createWithdrawalMachine();

      machine.dispose();

      expect(() => machine.send({
        type: 'EXECUTE',
        quoteId: 'quote',
        walletId: 'wallet'
      })).toThrow('Machine has been disposed');
    });

    it('should throw when subscribing to disposed machine', () => {
      const machine = createWithdrawalMachine();

      machine.dispose();

      expect(() => machine.subscribe(() => {})).toThrow('Machine has been disposed');
    });
  });

  describe('Context Preservation Through Complex Flows', () => {
    it('should preserve context through 2FA flow', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-abc',
        walletId: 'wallet-xyz'
      });

      const idem1 = machine.getState().context.idempotencyKey;

      machine.send({ type: 'REQUIRES_2FA' });
      expect(machine.getState().context.quoteId).toBe('quote-abc');
      expect(machine.getState().context.walletId).toBe('wallet-xyz');

      machine.send({ type: 'SUBMIT_2FA', code: '123456' });
      expect(machine.getState().context.quoteId).toBe('quote-abc');
      expect(machine.getState().context.walletId).toBe('wallet-xyz');
      expect(machine.getState().context.twoFactorCode).toBe('123456');
      expect(machine.getState().context.idempotencyKey).toBe(idem1);
    });

    it('should preserve context through retry flow', () => {
      const machine = createWithdrawalMachine({ maxRetries: 2 });

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-abc',
        walletId: 'wallet-xyz'
      });

      const idem1 = machine.getState().context.idempotencyKey;

      machine.send({ type: 'FAIL', error: new Error('error') });
      expect(machine.getState().context.quoteId).toBe('quote-abc');
      expect(machine.getState().context.walletId).toBe('wallet-xyz');
      expect(machine.getState().context.retryCount).toBe(1);

      machine.send({ type: 'RETRY' });
      const idem2 = machine.getState().context.idempotencyKey;
      expect(idem2).not.toBe(idem1); // New key
      expect(machine.getState().context.quoteId).toBe('quote-abc'); // Preserved
      expect(machine.getState().context.walletId).toBe('wallet-xyz'); // Preserved
      expect(machine.getState().context.retryCount).toBe(1); // Preserved
    });

    it('should preserve context through multiple challenge types', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-abc',
        walletId: 'wallet-xyz'
      });

      machine.send({ type: 'REQUIRES_2FA' });
      machine.send({ type: 'SUBMIT_2FA', code: '111111' });

      machine.send({ type: 'REQUIRES_SMS' });
      machine.send({ type: 'SUBMIT_SMS', code: '222222' });

      const state = machine.getState();
      expect(state.context.quoteId).toBe('quote-abc');
      expect(state.context.walletId).toBe('wallet-xyz');
      expect(state.context.twoFactorCode).toBe('111111');
      expect(state.context.smsCode).toBe('222222');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string codes', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });
      machine.send({ type: 'SUBMIT_2FA', code: '' });

      const state = machine.getState();
      expect(state.context.twoFactorCode).toBe('');
    });

    it('should handle very long retry chains', () => {
      const machine = createWithdrawalMachine({ maxRetries: 10 });
      const error = new Error('error');

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });

      for (let i = 0; i < 10; i++) {
        machine.send({ type: 'FAIL', error });
        expect(machine.getState().type).toBe('retrying');
        expect(machine.getState().context.retryCount).toBe(i + 1);
        machine.send({ type: 'RETRY' });
      }

      // 11th failure should go to failed
      machine.send({ type: 'FAIL', error });
      expect(machine.getState().type).toBe('failed');
    });

    it('should handle rapid state transitions', () => {
      const machine = createWithdrawalMachine();

      machine.send({
        type: 'EXECUTE',
        quoteId: 'quote-123',
        walletId: 'wallet-456'
      });
      machine.send({ type: 'REQUIRES_2FA' });
      machine.send({ type: 'SUBMIT_2FA', code: '1' });
      machine.send({ type: 'REQUIRES_SMS' });
      machine.send({ type: 'SUBMIT_SMS', code: '2' });
      machine.send({ type: 'SUCCESS', transactionId: 'tx' });

      const state = machine.getState();
      expect(state.type).toBe('completed');
      expect(state.context.transactionId).toBe('tx');
    });
  });
});
