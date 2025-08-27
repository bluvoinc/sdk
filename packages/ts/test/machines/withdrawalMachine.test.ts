import { describe, it, expect, vi } from 'vitest';
import { createWithdrawalMachine } from '../../src/machines';

describe('WithdrawalMachine', () => {
  it('should start in idle state', () => {
    const machine = createWithdrawalMachine();
    const state = machine.getState();
    
    expect(state.type).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.context.retryCount).toBe(0);
  });

  it('should transition from idle to processing on EXECUTE', () => {
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
    expect(state.context.idempotencyKey).toBeTruthy();
  });

  it('should handle 2FA requirement', () => {
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
  });

  it('should submit 2FA code and return to processing', () => {
    const machine = createWithdrawalMachine();
    
    machine.send({
      type: 'EXECUTE',
      quoteId: 'quote-123',
      walletId: 'wallet-456'
    });
    
    machine.send({ type: 'REQUIRES_2FA' });
    machine.send({ type: 'SUBMIT_2FA', code: '123456' });
    
    const state = machine.getState();
    expect(state.type).toBe('processing');
    expect(state.context.twoFactorCode).toBe('123456');
    expect(state.context.requiredActions).toBeUndefined();
  });

  it('should handle SMS requirement', () => {
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
  });

  it('should complete withdrawal successfully', () => {
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
  });

  it('should handle retries on failure', () => {
    const machine = createWithdrawalMachine({ maxRetries: 3 });
    
    machine.send({
      type: 'EXECUTE',
      quoteId: 'quote-123',
      walletId: 'wallet-456'
    });
    
    const error = new Error('Network error');
    machine.send({ type: 'FAIL', error });
    
    let state = machine.getState();
    expect(state.type).toBe('retrying');
    expect(state.context.retryCount).toBe(1);
    expect(state.context.lastError).toBe(error);
    
    machine.send({ type: 'RETRY' });
    
    state = machine.getState();
    expect(state.type).toBe('processing');
    expect(state.context.idempotencyKey).toBeTruthy(); // New idempotency key
  });

  it('should fail after max retries', () => {
    const machine = createWithdrawalMachine({ maxRetries: 1 });
    
    machine.send({
      type: 'EXECUTE',
      quoteId: 'quote-123',
      walletId: 'wallet-456'
    });
    
    const error = new Error('Network error');
    machine.send({ type: 'FAIL', error });
    
    // First failure - should go to retry
    expect(machine.getState().type).toBe('retrying');
    
    machine.send({ type: 'RETRY' });
    machine.send({ type: 'FAIL', error });
    
    // Second failure - should go to failed
    const state = machine.getState();
    expect(state.type).toBe('failed');
    expect(state.context.lastError).toBe(error);
    expect(state.error).toBe(error);
  });

  it('should handle blocked state', () => {
    const machine = createWithdrawalMachine();
    
    machine.send({
      type: 'EXECUTE',
      quoteId: 'quote-123',
      walletId: 'wallet-456'
    });
    
    machine.send({ type: 'BLOCKED', reason: 'Account restricted' });
    
    const state = machine.getState();
    expect(state.type).toBe('blocked');
    expect(state.error?.message).toBe('Account restricted');
  });

  it('should notify subscribers on state changes', () => {
    const machine = createWithdrawalMachine();
    const listener = vi.fn();
    
    const unsubscribe = machine.subscribe(listener);
    
    // Should be called immediately with initial state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'idle' }));
    
    machine.send({
      type: 'EXECUTE',
      quoteId: 'quote-123',
      walletId: 'wallet-456'
    });
    
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'processing' }));
    
    unsubscribe();
    
    machine.send({ type: 'REQUIRES_2FA' });
    
    // Should not be called after unsubscribe
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should dispose properly', () => {
    const machine = createWithdrawalMachine();
    const listener = vi.fn();
    
    machine.subscribe(listener);
    machine.dispose();
    
    // Should throw after disposal
    expect(() => machine.getState()).toThrow('Machine has been disposed');
    expect(() => machine.send({ type: 'EXECUTE', quoteId: 'q', walletId: 'w' })).toThrow('Machine has been disposed');
  });
});