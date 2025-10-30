/**
 * Data Validation Test Suite
 *
 * Tests for input validation and sanitization to prevent:
 * - Injection attacks (SQL, NoSQL, XSS)
 * - Malformed data corruption
 * - Invalid financial values
 * - Buffer overflows
 * - Type confusion
 *
 * Priority: HIGH - Input validation is critical for security and data integrity
 */

import { describe, it, expect } from 'vitest';
import { createFlowMachine } from '../../../src/machines';

describe('Data Validation and Sanitization', () => {
  const defaultOptions = {
    orgId: 'test-org',
    projectId: 'test-project'
  };

  describe('Injection Attack Prevention', () => {
    it('should handle SQL injection attempts in walletId', () => {
      const machine = createFlowMachine(defaultOptions);

      const maliciousWalletId = "wallet-123'; DROP TABLE wallets; --";

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: maliciousWalletId,
        idem: 'oauth-456'
      });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({
        exchange: 'coinbase',
        type: 'OAUTH_COMPLETED',
        walletId: maliciousWalletId
      });

      const state = machine.getState();
      // Should store as-is (validation happens server-side)
      // But should not execute or corrupt state
      expect(state.type).toBe('oauth:completed');
      expect(state.context.walletId).toBe(maliciousWalletId);
      expect(state.context).toBeDefined();
    });

    it('should handle NoSQL injection in exchange name', () => {
      const machine = createFlowMachine(defaultOptions);

      const maliciousExchange = '{"$ne": null}';

      machine.send({
        type: 'START_OAUTH',
        exchange: maliciousExchange,
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
      expect(state.context.exchange).toBe(maliciousExchange);
    });

    it('should handle XSS attempts in destination address', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const xssAddress = '<script>alert("XSS")</script>';

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: xssAddress,
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toBe(xssAddress);
      // Should not execute script - just store as string
    });

    it('should handle command injection attempts in idempotency key', () => {
      const machine = createFlowMachine(defaultOptions);

      const maliciousIdem = 'oauth-456; rm -rf /';

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: 'wallet-123',
        idem: maliciousIdem
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
      expect(state.context.idempotencyKey).toBe(maliciousIdem);
      expect(state.context.topicName).toBe(maliciousIdem);
    });

    it('should handle path traversal attempts', () => {
      const machine = createFlowMachine(defaultOptions);

      const pathTraversal = '../../../etc/passwd';

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: pathTraversal,
        idem: 'oauth-456'
      });

      const state = machine.getState();
      expect(state.context.walletId).toBe(pathTraversal);
      // Should not access file system
    });
  });

  describe('Malformed Crypto Addresses', () => {
    it('should handle empty destination address', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toBe('');
    });

    it('should handle very long address (potential buffer overflow)', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const veryLongAddress = 'A'.repeat(10000);

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: veryLongAddress,
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toBe(veryLongAddress);
    });

    it('should handle address with null bytes', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const nullByteAddress = '1A1zP\u00001wQhcNAZXZT';

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: nullByteAddress,
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toContain('\u0000');
    });

    it('should handle unicode and emoji in address', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const unicodeAddress = '🚀bitcoin🚀address💎';

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: unicodeAddress,
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toBe(unicodeAddress);
    });

    it('should handle special characters in address', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const specialAddress = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: specialAddress,
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.destinationAddress).toBe(specialAddress);
    });
  });

  describe('Invalid Amount Values', () => {
    it('should handle negative amounts', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '-0.5', // Negative amount
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('-0.5');
      // Server should reject, but client should not crash
    });

    it('should handle NaN as amount string', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: 'NaN',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('NaN');
    });

    it('should handle Infinity as amount string', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: 'Infinity',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('Infinity');
    });

    it('should handle zero amount', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('0');
    });

    it('should handle amount with excessive precision', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      const excessivePrecision = '0.123456789012345678901234567890';

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: excessivePrecision,
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe(excessivePrecision);
    });

    it('should handle scientific notation in amount', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '1.5e-8', // Scientific notation
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('1.5e-8');
    });

    it('should handle non-numeric amount strings', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: 'not a number',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.amount).toBe('not a number');
    });
  });

  describe('Invalid Asset and Network Combinations', () => {
    it('should handle empty asset name', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: '',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.asset).toBe('');
    });

    it('should handle undefined asset', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: undefined as any,
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
    });

    it('should handle mismatched asset and network', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      // BTC on Ethereum network (invalid)
      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'BTC',
        amount: '0.5',
        destinationAddress: '0x123...',
        network: 'ethereum'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.asset).toBe('BTC');
      expect(state.context.lastQuoteRequest?.network).toBe('ethereum');
      // Server validation should catch this
    });

    it('should handle case-sensitive asset names', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'btc', // lowercase instead of BTC
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'bitcoin'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.asset).toBe('btc');
    });

    it('should handle non-existent asset', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to wallet:ready
      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({ type: 'WALLET_LOADED', balances: [{ asset: 'BTC', balance: '1.0' }] });

      machine.send({
        type: 'REQUEST_QUOTE',
        asset: 'FAKECOIN',
        amount: '0.5',
        destinationAddress: '1A1zP...',
        network: 'fakenetwork'
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:requesting');
      expect(state.context.lastQuoteRequest?.asset).toBe('FAKECOIN');
    });
  });

  describe('Malformed Quote Data', () => {
    it('should handle quote with negative fee', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:requesting
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
          estimatedFee: '-0.0001', // Negative fee
          estimatedTotal: '0.4999',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '-50'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.estimatedFee).toBe('-0.0001');
    });

    it('should handle quote with past expiration time', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:requesting
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
          id: 'quote-expired',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() - 1000, // Already expired
          amountWithFeeInFiat: '25000',
          amountNoFeeInFiat: '24950',
          estimatedFeeInFiat: '50'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.expiresAt).toBeLessThan(Date.now());
    });

    it('should handle quote with mismatched amount', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:requesting
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

      // Quote returns different amount than requested
      machine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: 'quote-mismatch',
          asset: 'BTC',
          amount: '0.6', // Different from requested 0.5
          estimatedFee: '0.0001',
          estimatedTotal: '0.6001',
          expiresAt: Date.now() + 300000,
          amountWithFeeInFiat: '30000',
          amountNoFeeInFiat: '29950',
          estimatedFeeInFiat: '50'
        }
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.amount).toBe('0.6');
      expect(state.context.lastQuoteRequest?.amount).toBe('0.5');
    });

    it('should handle quote with missing required fields', () => {
      const machine = createFlowMachine(defaultOptions);

      // Setup to quote:requesting
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
          id: 'quote-incomplete',
          asset: 'BTC',
          amount: '0.5',
          estimatedFee: '0.0001',
          estimatedTotal: '0.5001',
          expiresAt: Date.now() + 300000
          // Missing fiat fields
        } as any
      });

      const state = machine.getState();
      expect(state.type).toBe('quote:ready');
      expect(state.context.quote?.id).toBe('quote-incomplete');
    });
  });

  describe('Malformed Balance Data', () => {
    it('should handle balance with negative value', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: '-1.0' }] // Negative balance
      });

      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances?.[0].balance).toBe('-1.0');
    });

    it('should handle balance with non-numeric value', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [{ asset: 'BTC', balance: 'not a number' }]
      });

      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances?.[0].balance).toBe('not a number');
    });

    it('should handle duplicate assets in balances', () => {
      const machine = createFlowMachine(defaultOptions);

      machine.send({ type: 'START_OAUTH', exchange: 'coinbase', walletId: 'wallet-123', idem: 'oauth-456' });
      machine.send({ type: 'OAUTH_WINDOW_OPENED' });
      machine.send({ exchange: 'coinbase', type: 'OAUTH_COMPLETED', walletId: 'wallet-123' });
      machine.send({ type: 'LOAD_WALLET' });
      machine.send({
        type: 'WALLET_LOADED',
        balances: [
          { asset: 'BTC', balance: '1.0' },
          { asset: 'BTC', balance: '2.0' } // Duplicate
        ]
      });

      const state = machine.getState();
      expect(state.type).toBe('wallet:ready');
      expect(state.context.walletBalances).toHaveLength(2);
    });
  });

  describe('Control Characters and Encoding', () => {
    it('should handle control characters in 2FA code', () => {
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

      const controlCode = '123\r\n456';
      machine.send({ type: 'SUBMIT_2FA', code: controlCode });

      const state = machine.getState();
      expect(state.type).toBe('withdraw:processing');
    });

    it('should handle UTF-8 characters in exchange name', () => {
      const machine = createFlowMachine(defaultOptions);

      const utf8Exchange = '交易所'; // Chinese characters

      machine.send({
        type: 'START_OAUTH',
        exchange: utf8Exchange,
        walletId: 'wallet-123',
        idem: 'oauth-456'
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
      expect(state.context.exchange).toBe(utf8Exchange);
    });

    it('should handle zero-width characters', () => {
      const machine = createFlowMachine(defaultOptions);

      const invisibleChars = 'wallet\u200B\u200C\u200D123'; // Zero-width spaces

      machine.send({
        type: 'START_OAUTH',
        exchange: 'coinbase',
        walletId: invisibleChars,
        idem: 'oauth-456'
      });

      const state = machine.getState();
      expect(state.type).toBe('oauth:waiting');
      expect(state.context.walletId).toBe(invisibleChars);
    });
  });
});
