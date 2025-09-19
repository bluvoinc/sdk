import { describe, it, expect, vi } from 'vitest';
import { createFlowMachine } from '../../src/machines';

describe('FlowMachine', () => {
  const defaultOptions = {
    orgId: 'test-org',
    projectId: 'test-project'
  };

  it('should start in idle state', () => {
    const machine = createFlowMachine(defaultOptions);
    const state = machine.getState();
    
    expect(state.type).toBe('idle');
    expect(state.context.orgId).toBe('test-org');
    expect(state.context.projectId).toBe('test-project');
    expect(state.context.maxRetryAttempts).toBe(3);
  });

  it('should handle OAuth flow', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Start OAuth
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    
    let state = machine.getState();
    expect(state.type).toBe('oauth:waiting');
    expect(state.context.exchange).toBe('coinbase');
    expect(state.context.walletId).toBe('wallet-123');
    expect(state.context.topicName).toBe('oauth-456');
    
    // Window opened
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    state = machine.getState();
    expect(state.type).toBe('oauth:processing');
    
    // OAuth completed
    machine.send({
      type: 'OAUTH_COMPLETED',
      walletId: 'wallet-123'
    });
    state = machine.getState();
    expect(state.type).toBe('oauth:completed');
  });

  it('should handle OAuth failure', () => {
    const machine = createFlowMachine(defaultOptions);
    
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    
    const error = new Error('OAuth cancelled');
    machine.send({
      type: 'OAUTH_FAILED',
      error
    });
    
    const state = machine.getState();
    expect(state.type).toBe('oauth:error');
    expect(state.error).toBe(error);
  });

  it('should handle OAuth window closed by user', () => {
    const machine = createFlowMachine(defaultOptions);
    
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    
    const error = new Error('OAuth window closed by user');
    machine.send({
      type: 'OAUTH_WINDOW_CLOSED_BY_USER',
      error
    });
    
    const state = machine.getState();
    expect(state.type).toBe('oauth:window_closed_by_user');
    expect(state.error).toBe(error);
  });

  it('should load wallet after OAuth', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Complete OAuth first
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({
      type: 'OAUTH_COMPLETED',
      walletId: 'wallet-123'
    });
    
    // Load wallet
    machine.send({ type: 'LOAD_WALLET' });
    let state = machine.getState();
    expect(state.type).toBe('wallet:loading');
    
    // Wallet loaded
    const balances = [
      { asset: 'BTC', balance: '0.5' },
      { asset: 'ETH', balance: '2.0' }
    ];
    machine.send({
      type: 'WALLET_LOADED',
      balances
    });
    
    state = machine.getState();
    expect(state.type).toBe('wallet:ready');
    expect(state.context.walletBalances).toEqual(balances);
  });

  it('should request and receive quote', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Setup: Complete OAuth and load wallet
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({ type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
    machine.send({ type: 'LOAD_WALLET' });
    machine.send({
      type: 'WALLET_LOADED',
      balances: [{ asset: 'BTC', balance: '0.5' }]
    });
    
    // Request quote
    machine.send({
      type: 'REQUEST_QUOTE',
      asset: 'BTC',
      amount: '0.1',
      destinationAddress: '1A1zP...',
      network: 'bitcoin'
    });
    
    let state = machine.getState();
    expect(state.type).toBe('quote:requesting');
    
    // Quote received
    const quote = {
      id: 'quote-789',
      asset: 'BTC',
      amount: '0.1',
      estimatedFee: '0.0001',
      estimatedTotal: '0.1001',
      expiresAt: Date.now() + 300000
    };
    
    machine.send({
      type: 'QUOTE_RECEIVED',
      quote
    });
    
    state = machine.getState();
    expect(state.type).toBe('quote:ready');
    expect(state.context.quote).toEqual(quote);
  });

  it('should handle quote expiration', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Setup to quote ready state
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({ type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
    machine.send({ type: 'LOAD_WALLET' });
    machine.send({
      type: 'WALLET_LOADED',
      balances: [{ asset: 'BTC', balance: '0.5' }]
    });
    machine.send({
      type: 'REQUEST_QUOTE',
      asset: 'BTC',
      amount: '0.1',
      destinationAddress: '1A1zP...',
      network: 'bitcoin'
    });
    machine.send({
      type: 'QUOTE_RECEIVED',
      quote: {
        id: 'quote-789',
        asset: 'BTC',
        amount: '0.1',
        estimatedFee: '0.0001',
        estimatedTotal: '0.1001',
        expiresAt: Date.now() + 300000
      }
    });
    
    // Expire quote
    machine.send({ type: 'QUOTE_EXPIRED' });
    
    const state = machine.getState();
    expect(state.type).toBe('quote:expired');
    expect(state.error?.message).toContain('expired');
  });

  it('should handle flow cancellation from any state', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Start OAuth
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    
    // Cancel from oauth:waiting
    machine.send({ type: 'CANCEL_FLOW' });
    
    const state = machine.getState();
    expect(state.type).toBe('flow:cancelled');
  });

  it('should notify subscribers on state changes', () => {
    const machine = createFlowMachine(defaultOptions);
    const listener = vi.fn();
    
    const unsubscribe = machine.subscribe(listener);
    
    // Should be called immediately with initial state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'idle' }));
    
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'oauth:waiting' }));
    
    unsubscribe();
  });

  it('should dispose properly including nested machines', () => {
    const machine = createFlowMachine(defaultOptions);
    
    // Setup to create withdrawal machine
    machine.send({
      type: 'START_OAUTH',
      exchange: 'coinbase',
      walletId: 'wallet-123',
      idem: 'oauth-456'
    });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({ type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
    machine.send({ type: 'LOAD_WALLET' });
    machine.send({
      type: 'WALLET_LOADED',
      balances: [{ asset: 'BTC', balance: '0.5' }]
    });
    machine.send({
      type: 'REQUEST_QUOTE',
      asset: 'BTC',
      amount: '0.1',
      destinationAddress: '1A1zP...',
      network: 'bitcoin'
    });
    machine.send({
      type: 'QUOTE_RECEIVED',
      quote: {
        id: 'quote-789',
        asset: 'BTC',
        amount: '0.1',
        estimatedFee: '0.0001',
        estimatedTotal: '0.1001',
        expiresAt: Date.now() + 300000
      }
    });
    
    // Start withdrawal to create nested machine
    machine.send({
      type: 'START_WITHDRAWAL',
      quoteId: 'quote-789'
    });
    
    machine.dispose();
    
    // Should throw after disposal
    expect(() => machine.getState()).toThrow('Machine has been disposed');
  });

  it('should handle WITHDRAWAL_FATAL action and transition to fatal state', () => {
    const machine = createFlowMachine(defaultOptions);

    // Set up a withdrawal processing state
    machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
    machine.send({ type: 'OAUTH_WINDOW_OPENED' });
    machine.send({ type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
    machine.send({ type: 'LOAD_WALLET' });
    machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '0.5' }] });
    machine.send({ type: 'REQUEST_QUOTE', asset: 'BTC', amount: '0.1', destinationAddress: '1A1zP...', network: 'bitcoin' });
    machine.send({ 
      type: 'QUOTE_RECEIVED', 
      quote: { 
        id: 'quote-789', 
        asset: 'BTC', 
        amount: '0.1', 
        estimatedFee: '0.0001', 
        estimatedTotal: '0.1001',
        expiresAt: Date.now() + 5000
      } 
    });
    machine.send({ type: 'START_WITHDRAWAL', quoteId: 'quote-789' });
    
    expect(machine.getState().type).toBe('withdraw:processing');
    
    // Send WITHDRAWAL_FATAL action
    const fatalError = new Error('Fatal withdrawal error');
    machine.send({ type: 'WITHDRAWAL_FATAL', error: fatalError });
    
    // Should transition to withdraw:fatal
    const state = machine.getState();
    expect(state.type).toBe('withdraw:fatal');
    expect(state.error).toBe(fatalError);
  });
});