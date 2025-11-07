import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines/BluvoFlowClient';
import { ERROR_CODES } from '../../src/error-codes';

describe('BluvoFlowClient.loadExchanges', () => {
	let flowClient: BluvoFlowClient;
	let mockListExchangesFn: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create fresh mocks for each test
		mockListExchangesFn = vi.fn();

		flowClient = new BluvoFlowClient({
			orgId: 'test-org',
			projectId: 'test-project',
			listExchangesFn: mockListExchangesFn,
			fetchWithdrawableBalanceFn: vi.fn(),
			requestQuotationFn: vi.fn(),
			executeWithdrawalFn: vi.fn(),
			getWalletByIdFn: vi.fn(),
			pingWalletByIdFn: vi.fn(),
		});
	});

	describe('Success cases', () => {
		it('should return exchanges array with standardized success response', async () => {
			const mockExchanges = [
				{ id: 'coinbase', name: 'Coinbase', logoUrl: 'https://example.com/coinbase.png', status: 'active' },
				{ id: 'binance', name: 'Binance', logoUrl: 'https://example.com/binance.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			const result = await flowClient.loadExchanges();

			// Verify standardized response structure
			expect(result).toEqual({
				exchanges: mockExchanges,  // Legacy flat field
				success: true,              // New standardized
				result: mockExchanges,      // New nested
			});
		});

		it('should handle empty exchanges array', async () => {
			mockListExchangesFn.mockResolvedValue([]);

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				exchanges: [],
				success: true,
				result: [],
			});
		});

		it('should pass status filter to listExchangesFn', async () => {
			const mockExchanges = [
				{ id: 'coinbase', name: 'Coinbase', logoUrl: 'https://example.com/coinbase.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			await flowClient.loadExchanges('active' as any);

			expect(mockListExchangesFn).toHaveBeenCalledWith('active');
		});

		it('should update flow machine state on success', async () => {
			const mockExchanges = [
				{ id: 'coinbase', name: 'Coinbase', logoUrl: 'https://example.com/coinbase.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			await flowClient.loadExchanges();

			const state = flowClient.getState();

			// State machine should be initialized and have exchanges in context
			expect(state).toBeDefined();
			expect(state?.type).toBe('exchanges:ready');
			expect(state?.context.exchanges).toEqual(mockExchanges);
		});
	});

	describe('Error cases: API exceptions', () => {
		it('should handle thrown error with known error code', async () => {
			const mockError = {
				type: ERROR_CODES.GENERIC_INTERNAL_SERVER_ERROR,
				message: 'Internal server error',
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			// Non-Error instance gets fallback message
			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges',
				type: ERROR_CODES.GENERIC_INTERNAL_SERVER_ERROR,
			});
		});

		it('should handle thrown error with unknown error code', async () => {
			const mockError = {
				type: 'FUTURE_EXCHANGES_ERROR_CODE',
				message: 'Unknown error occurred',
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			// Non-Error instance gets fallback message
			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges',
				type: 'FUTURE_EXCHANGES_ERROR_CODE',
			});
		});

		it('should handle thrown Error instance', async () => {
			const mockError = new Error('Network request failed');

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Network request failed',
				type: undefined,
			});
		});

		it('should handle thrown generic error without message', async () => {
			const mockError = { code: 500 };

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to load exchanges');
			expect(result.type).toBeUndefined();
		});

		it('should handle thrown string error', async () => {
			mockListExchangesFn.mockRejectedValue('Something went wrong');

			const result = await flowClient.loadExchanges();

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to load exchanges');
		});

		it('should update flow machine state on API error', async () => {
			const mockError = new Error('Network failure');
			mockListExchangesFn.mockRejectedValue(mockError);

			await flowClient.loadExchanges();

			const state = flowClient.getState();

			// State machine should be in error state
			expect(state).toBeDefined();
			expect(state?.type).toBe('exchanges:error');
		});
	});

	describe('Error cases: Invalid response structure', () => {
		it('should handle null response', async () => {
			mockListExchangesFn.mockResolvedValue(null);

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges: Invalid response',
			});
		});

		it('should handle undefined response', async () => {
			mockListExchangesFn.mockResolvedValue(undefined);

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges: Invalid response',
			});
		});

		it('should handle non-array response (object)', async () => {
			mockListExchangesFn.mockResolvedValue({ exchanges: [] });

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges: Invalid response',
			});
		});

		it('should handle non-array response (string)', async () => {
			mockListExchangesFn.mockResolvedValue('not an array');

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges: Invalid response',
			});
		});

		it('should handle non-array response (number)', async () => {
			mockListExchangesFn.mockResolvedValue(123);

			const result = await flowClient.loadExchanges();

			expect(result).toEqual({
				success: false,
				error: 'Failed to load exchanges: Invalid response',
			});
		});

		it('should update flow machine state on invalid response', async () => {
			mockListExchangesFn.mockResolvedValue(null);

			await flowClient.loadExchanges();

			const state = flowClient.getState();

			// State machine should be in error state
			expect(state).toBeDefined();
			expect(state?.type).toBe('exchanges:error');
		});
	});

	describe('Legacy compatibility', () => {
		it('should provide both flat and nested structures in success response', async () => {
			const mockExchanges = [
				{ id: 'kraken', name: 'Kraken', logoUrl: 'https://example.com/kraken.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			const result = await flowClient.loadExchanges();

			// Verify both access patterns work
			expect(result.exchanges).toEqual(mockExchanges);  // Legacy flat access
			expect(result.result).toEqual(mockExchanges);      // New nested access
			expect(result.success).toBe(true);
		});

		it('should never return undefined', async () => {
			// Test with null response
			mockListExchangesFn.mockResolvedValue(null);
			const result1 = await flowClient.loadExchanges();
			expect(result1).toBeDefined();
			expect(result1.success).toBe(false);

			// Test with error
			mockListExchangesFn.mockRejectedValue(new Error('Test error'));
			const result2 = await flowClient.loadExchanges();
			expect(result2).toBeDefined();
			expect(result2.success).toBe(false);
		});
	});

	describe('Flow machine initialization', () => {
		it('should create flow machine if not initialized', async () => {
			const mockExchanges = [
				{ id: 'coinbase', name: 'Coinbase', logoUrl: 'https://example.com/coinbase.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			// Initially no machine
			expect(flowClient.getState()).toBeUndefined();

			await flowClient.loadExchanges();

			// Now machine should exist
			expect(flowClient.getState()).toBeDefined();
		});

		it('should send LOAD_EXCHANGES action to state machine', async () => {
			const mockExchanges = [
				{ id: 'coinbase', name: 'Coinbase', logoUrl: 'https://example.com/coinbase.png', status: 'active' },
			];

			mockListExchangesFn.mockResolvedValue(mockExchanges);

			await flowClient.loadExchanges();

			const state = flowClient.getState();
			expect(state?.type).toBe('exchanges:ready');
		});
	});

	describe('Error type extraction', () => {
		it('should extract error code from errorCode field', async () => {
			const mockError = {
				errorCode: ERROR_CODES.GENERIC_UNAUTHORIZED,
				error: 'Unauthorized',
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			expect(result.type).toBe(ERROR_CODES.GENERIC_UNAUTHORIZED);
		});

		it('should extract error code from code field', async () => {
			const mockError = {
				code: ERROR_CODES.GENERIC_NOT_FOUND,
				message: 'Not found',
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			expect(result.type).toBe(ERROR_CODES.GENERIC_NOT_FOUND);
		});

		it('should extract error code from legacy axios format', async () => {
			const mockError = {
				response: {
					data: {
						type: ERROR_CODES.GENERIC_VALIDATION_ERROR,
					},
				},
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			expect(result.type).toBe(ERROR_CODES.GENERIC_VALIDATION_ERROR);
		});

		it('should prioritize errorCode over type field', async () => {
			const mockError = {
				type: ERROR_CODES.GENERIC_NOT_FOUND,
				errorCode: ERROR_CODES.GENERIC_UNAUTHORIZED,
			};

			mockListExchangesFn.mockRejectedValue(mockError);

			const result = await flowClient.loadExchanges();

			// extractErrorCode prioritizes errorCode field
			expect(result.type).toBe(ERROR_CODES.GENERIC_UNAUTHORIZED);
		});
	});

	describe('Type consistency', () => {
		it('should always return success boolean', async () => {
			// Success case
			mockListExchangesFn.mockResolvedValue([]);
			const result1 = await flowClient.loadExchanges();
			expect(typeof result1.success).toBe('boolean');

			// Error case
			mockListExchangesFn.mockRejectedValue(new Error('Test'));
			const result2 = await flowClient.loadExchanges();
			expect(typeof result2.success).toBe('boolean');
		});

		it('should return error message on failure', async () => {
			mockListExchangesFn.mockRejectedValue(new Error('Test error'));

			const result = await flowClient.loadExchanges();

			expect(result.success).toBe(false);
			expect(typeof result.error).toBe('string');
			expect(result.error).toBe('Test error');
		});

		it('should not have result field on error', async () => {
			mockListExchangesFn.mockRejectedValue(new Error('Test'));

			const result = await flowClient.loadExchanges();

			expect(result.success).toBe(false);
			expect(result.result).toBeUndefined();
		});

		it('should not have error field on success', async () => {
			mockListExchangesFn.mockResolvedValue([]);

			const result = await flowClient.loadExchanges();

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.type).toBeUndefined();
		});
	});
});
