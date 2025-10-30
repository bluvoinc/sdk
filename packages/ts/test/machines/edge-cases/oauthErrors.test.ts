import { describe, it, expect } from 'vitest';
import { createFlowMachine } from '../../../src/machines';

const defaultOptions = {
  orgId: 'test-org',
  projectId: 'test-project',
  maxRetryAttempts: 3,
};

describe('OAuth Error Handling with Granular Error Types', () => {
  describe('Fatal OAuth Errors - OAUTH_TOKEN_EXCHANGE_FAILED', () => {
    it('should transition to oauth:fatal for OAUTH_TOKEN_EXCHANGE_FAILED', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Simulate token exchange failure (wallet connection permanently broken)
      const error = new Error('Token exchange failed - invalid OAuth tokens');
      machine.send({ type: 'OAUTH_FATAL', error });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      expect(state.error).toBe(error);
      expect(state.error?.message).toContain('Token exchange failed');
      expect(state.context.oauthErrorType).toBe('fatal');
    });

    it('should set oauthErrorType to "fatal" in context', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('OAuth tokens revoked'),
      });

      const state = machine.getState();
      expect(state.context.oauthErrorType).toBe('fatal');
    });

    it('should preserve context data when transitioning to oauth:fatal', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      const initialContext = machine.getState().context;

      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Fatal OAuth error'),
      });

      const state = machine.getState();
      expect(state.context.orgId).toBe(initialContext.orgId);
      expect(state.context.projectId).toBe(initialContext.projectId);
      expect(state.context.exchange).toBe(initialContext.exchange);
      expect(state.context.walletId).toBe(initialContext.walletId);
    });

    it('should handle multiple fatal errors without state corruption', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // First fatal error
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('First fatal error'),
      });

      expect(machine.getState().type).toBe('oauth:fatal');

      // Second fatal error (should stay in oauth:fatal)
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Second fatal error'),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      // Last error should be stored
      expect(state.error?.message).toBe('First fatal error');
    });
  });

  describe('Recoverable OAuth Errors', () => {
    it('should transition to oauth:error for OAUTH_AUTHORIZATION_FAILED (recoverable)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // User cancelled authorization (recoverable - can retry)
      const error = new Error('User cancelled OAuth authorization');
      machine.send({ type: 'OAUTH_FAILED', error });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      expect(state.error).toBe(error);
      expect(state.context.oauthErrorType).toBe('recoverable');
    });

    it('should transition to oauth:error for OAUTH_INVALID_STATE (recoverable)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // CSRF protection triggered (recoverable - can retry)
      const error = new Error('Invalid OAuth state parameter');
      machine.send({ type: 'OAUTH_FAILED', error });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      expect(state.context.oauthErrorType).toBe('recoverable');
    });

    it('should set oauthErrorType to "recoverable" for generic OAuth failures', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FAILED',
        error: new Error('Network timeout'),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:error');
      expect(state.context.oauthErrorType).toBe('recoverable');
    });
  });

  describe('Error Type Distinction', () => {
    it('should clearly distinguish between fatal and recoverable errors', () => {
      const fatalMachine = createFlowMachine(defaultOptions);
      const recoverableMachine = createFlowMachine(defaultOptions);

      // Set up both machines
      [fatalMachine, recoverableMachine].forEach((machine) => {
        machine.send({
          type: 'START_OAUTH',
          exchange: 'coinbase',
          walletId: 'wallet-123',
          idem: 'oauth-456',
        });
        machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      });

      // Fatal error
      fatalMachine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Token exchange failed'),
      });

      // Recoverable error
      recoverableMachine.send({
        type: 'OAUTH_FAILED',
        error: new Error('User cancelled'),
      });

      const fatalState = fatalMachine.getState();
      const recoverableState = recoverableMachine.getState();

      // States should be different
      expect(fatalState.type).toBe('oauth:fatal');
      expect(recoverableState.type).toBe('oauth:error');

      // Error types should be different
      expect(fatalState.context.oauthErrorType).toBe('fatal');
      expect(recoverableState.context.oauthErrorType).toBe('recoverable');
    });

    it('should maintain error type after state transitions', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Fatal error'),
      });

      // Error type should persist
      let state = machine.getState();
      expect(state.context.oauthErrorType).toBe('fatal');

      // Even after cancel
      machine.send({ type: 'CANCEL_FLOW' });
      state = machine.getState();
      expect(state.type).toBe('flow:cancelled');
      // Context is preserved
      expect(state.context.oauthErrorType).toBe('fatal');
    });
  });

  describe('Recovery Scenarios', () => {
    it('should allow cancellation and retry after fatal error', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Token exchange failed'),
      });

      expect(machine.getState().type).toBe('oauth:fatal');

      // Cancel flow
      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');

      // Create new machine for retry (fatal errors require new connection)
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-456', // New wallet ID for fresh connection
        idem: 'oauth-789',
      });

      expect(retryMachine.getState().type).toBe('oauth:waiting');
    });

    it('should allow cancellation and retry after recoverable error', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FAILED',
        error: new Error('User cancelled'),
      });

      expect(machine.getState().type).toBe('oauth:error');

      // Cancel flow
      machine.send({ type: 'CANCEL_FLOW' });
      expect(machine.getState().type).toBe('flow:cancelled');

      // Create new machine for retry (user can try again)
      const retryMachine = createFlowMachine(defaultOptions);
      retryMachine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123', // Same wallet ID - just retry
        idem: 'oauth-789',
      });

      expect(retryMachine.getState().type).toBe('oauth:waiting');
    });
  });

  describe('Wallet Connection Invalid Scenarios', () => {
    it('should represent permanent wallet connection failure', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Simulate scenario where exchange revoked API access
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Exchange revoked API credentials'),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      expect(state.context.oauthErrorType).toBe('fatal');

      // This represents: "We cannot communicate with this wallet anymore at all"
      // User needs to:
      // 1. Disconnect the wallet
      // 2. Reconnect with fresh OAuth flow
      // 3. Get new API credentials from the exchange
    });

    it('should handle expired OAuth tokens (fatal)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // OAuth tokens expired (permanent until refresh)
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('OAuth tokens expired'),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      expect(state.context.oauthErrorType).toBe('fatal');
    });

    it('should handle revoked OAuth permissions (fatal)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // User revoked permissions on exchange side
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('OAuth permissions revoked by user'),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      expect(state.context.oauthErrorType).toBe('fatal');
    });
  });

  describe('Error Message Clarity', () => {
    it('should provide clear error messages for fatal errors', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      const error = new Error(
        'Wallet connection is invalid. Please reconnect your wallet.'
      );
      machine.send({ type: 'OAUTH_FATAL', error });

      const state = machine.getState();
      expect(state.error?.message).toContain('invalid');
      expect(state.error?.message).toContain('reconnect');
    });

    it('should provide clear error messages for recoverable errors', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      const error = new Error('OAuth failed. Please try again.');
      machine.send({ type: 'OAUTH_FAILED', error });

      const state = machine.getState();
      expect(state.error?.message).toContain('try again');
    });
  });

  describe('Edge Cases', () => {
    it('should handle OAUTH_FATAL from oauth:waiting state (no-op)', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      // Send OAUTH_FATAL before OAUTH_WINDOW_OPENED
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Premature error'),
      });

      // Should stay in oauth:waiting (no transition defined)
      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
    });

    it('should handle rapid error transitions', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });

      // Rapid fire both error types
      machine.send({
        type: 'OAUTH_FAILED',
        error: new Error('First error'),
      });

      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Second error'),
      });

      const state = machine.getState();
      // Should stay in oauth:error (first transition wins)
      expect(state.type).toBe('oauth:error');
      expect(state.error?.message).toBe('First error');
    });

    it('should handle empty error objects gracefully', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error(),
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:fatal');
      expect(state.error).toBeDefined();
    });
  });

  describe('Context Preservation', () => {
    it('should preserve all context fields in oauth:fatal state', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      const beforeError = machine.getState().context;

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FATAL',
        error: new Error('Fatal'),
      });

      const afterError = machine.getState().context;

      expect(afterError.orgId).toBe(beforeError.orgId);
      expect(afterError.projectId).toBe(beforeError.projectId);
      expect(afterError.exchange).toBe(beforeError.exchange);
      expect(afterError.walletId).toBe(beforeError.walletId);
      expect(afterError.idempotencyKey).toBe(beforeError.idempotencyKey);
      expect(afterError.topicName).toBe(beforeError.topicName);
    });

    it('should preserve all context fields in oauth:error state', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: 'oauth-456',
      });

      const beforeError = machine.getState().context;

      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        type: 'OAUTH_FAILED',
        error: new Error('Recoverable'),
      });

      const afterError = machine.getState().context;

      expect(afterError.orgId).toBe(beforeError.orgId);
      expect(afterError.projectId).toBe(beforeError.projectId);
      expect(afterError.exchange).toBe(beforeError.exchange);
      expect(afterError.walletId).toBe(beforeError.walletId);
    });
  });
});
