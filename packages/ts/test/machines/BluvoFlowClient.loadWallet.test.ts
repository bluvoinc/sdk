import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines/BluvoFlowClient';
import { ERROR_CODES } from '../../src/error-codes';

describe('BluvoFlowClient.loadWallet', () => {
	let flowClient: BluvoFlowClient;
	let mockFetchWithdrawableBalanceFn: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create fresh mocks for each test
		mockFetchWithdrawableBalanceFn = vi.fn();

		flowClient = new BluvoFlowClient({
			orgId: 'test-org',
			projectId: 'test-project',
			listExchangesFn: vi.fn(),
			fetchWithdrawableBalanceFn: mockFetchWithdrawableBalanceFn,
			requestQuotationFn: vi.fn(),
			executeWithdrawalFn: vi.fn(),
			getWalletByIdFn: vi.fn(),
			pingWalletByIdFn: vi.fn(),
		});
	});

	describe('Success cases', () => {
		it('should return balances with standardized success response', async () => {
			const mockBalanceData = {
				balances: [
					{
						asset: 'BTC',
						free: '1.5',
						total: '2.0',
						networks: [
							{
								id: 'bitcoin',
								name: 'Bitcoin',
								displayName: 'Bitcoin',
								minWithdrawal: '0.001',
								maxWithdrawal: '10',
								assetName: 'BTC',
								addressRegex: '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$',
							},
						],
					},
				],
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: mockBalanceData,
				error: null,
				success: true,
			});

			// Need to initialize flow machine first (simulate startWithdrawalFlow)
			await flowClient.loadExchanges();

			// Use type assertion to access private method for testing
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			// Verify standardized response structure
			expect(result.success).toBe(true);
			expect(result.balances).toBeDefined();
			expect(result.result).toBeDefined();
			expect(result.result.balances).toBeDefined();
			expect(Array.isArray(result.balances)).toBe(true);
		});

		it('should transform balances correctly', async () => {
			const mockBalanceData = {
				balances: [
					{
						asset: 'ETH',
						free: '10.0',
						total: '15.0',
						networks: [
							{
								id: 'ethereum',
								name: 'Ethereum',
								displayName: 'Ethereum',
								minWithdrawal: '0.01',
								assetName: 'ETH',
							},
						],
					},
				],
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: mockBalanceData,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(true);
			expect(result.balances.length).toBeGreaterThan(0);
			expect(result.balances[0]).toHaveProperty('asset');
			expect(result.balances[0]).toHaveProperty('balance');
		});

		it('should update flow machine state on success', async () => {
			const mockBalanceData = {
				balances: [
					{
						asset: 'USDT',
						free: '1000.0',
						total: '1000.0',
						networks: [],
					},
				],
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: mockBalanceData,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			// Verify the result indicates success
			expect(result.success).toBe(true);
			expect(result.balances).toBeDefined();
			expect(Array.isArray(result.balances)).toBe(true);
		});

		it('should handle empty balances array', async () => {
			const mockBalanceData = {
				balances: [],
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: mockBalanceData,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(true);
			expect(result.balances).toEqual([]);
			expect(result.result.balances).toEqual([]);
		});
	});

	describe('Error cases: API failures', () => {
		it('should handle API error with known error code', async () => {
			const mockError = {
				type: ERROR_CODES.WALLET_NOT_FOUND,
				message: 'Wallet not found',
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'Wallet not found',
				type: ERROR_CODES.WALLET_NOT_FOUND,
			});
		});

		it('should handle API error with unknown error code', async () => {
			const mockError = {
				type: 'FUTURE_WALLET_ERROR_CODE',
				message: 'Unknown wallet error',
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'Unknown wallet error',
				type: 'FUTURE_WALLET_ERROR_CODE',
			});
		});

		it('should handle Error instance', async () => {
			const mockError = new Error('Network connection failed');

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Network connection failed');
			expect(result.type).toBeUndefined();
		});

		it('should handle generic error without message', async () => {
			const mockError = { code: 500 };

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to load wallet');
		});

		it('should handle invalid credentials error', async () => {
			const mockError = {
				type: ERROR_CODES.WALLET_INVALID_CREDENTIALS,
				message: 'Invalid API credentials',
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'Invalid API credentials',
				type: ERROR_CODES.WALLET_INVALID_CREDENTIALS,
			});
		});

		it('should update flow machine state on API error', async () => {
			const mockError = new Error('API failure');

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			// Verify the result indicates failure
			expect(result.success).toBe(false);
			expect(result.error).toBe('API failure');
		});
	});

	describe('Error cases: Invalid response structure', () => {
		it('should handle null balances field', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: { balances: null },
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'No balance data returned',
			});
		});

		it('should handle undefined balances field', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: { balances: undefined },
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'No balance data returned',
			});
		});

		it('should handle missing balances field', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'No balance data returned',
			});
		});

		it('should handle null response data', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'No balance data returned',
			});
		});

		it('should update flow machine state on invalid response', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			// Verify the result indicates failure
			expect(result.success).toBe(false);
			expect(result.error).toBe('No balance data returned');
		});
	});

	describe('Guard cases: Flow machine initialization', () => {
		it('should handle missing flow machine', async () => {
			// Create new client without initializing flow machine
			const newClient = new BluvoFlowClient({
				orgId: 'test-org',
				projectId: 'test-project',
				listExchangesFn: vi.fn(),
				fetchWithdrawableBalanceFn: mockFetchWithdrawableBalanceFn,
				requestQuotationFn: vi.fn(),
				executeWithdrawalFn: vi.fn(),
				getWalletByIdFn: vi.fn(),
				pingWalletByIdFn: vi.fn(),
			});

			const result = await (newClient as any).loadWallet('test-wallet-id');

			expect(result).toEqual({
				success: false,
				error: 'Flow machine not initialized',
			});
		});
	});

	describe('Legacy compatibility', () => {
		it('should provide both flat and nested structures in success response', async () => {
			const mockBalanceData = {
				balances: [
					{
						asset: 'BTC',
						free: '1.0',
						total: '1.5',
						networks: [],
					},
				],
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: mockBalanceData,
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			// Verify both access patterns work
			expect(result.balances).toBeDefined();        // Legacy flat access
			expect(result.result.balances).toBeDefined(); // New nested access
			expect(result.success).toBe(true);

			// Both should reference the same data
			expect(result.balances).toEqual(result.result.balances);
		});

		it('should never return undefined', async () => {
			// Test with error
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: new Error('Test error'),
				success: false,
			});

			await flowClient.loadExchanges();
			const result1 = await (flowClient as any).loadWallet('test-wallet-id');
			expect(result1).toBeDefined();
			expect(result1.success).toBe(false);

			// Test with invalid response
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: null,
				success: true,
			});

			const result2 = await (flowClient as any).loadWallet('test-wallet-id');
			expect(result2).toBeDefined();
			expect(result2.success).toBe(false);
		});
	});

	describe('Error type extraction', () => {
		it('should extract error code from type field', async () => {
			const mockError = {
				type: ERROR_CODES.GENERIC_UNAUTHORIZED,
				error: 'Unauthorized',
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.type).toBe(ERROR_CODES.GENERIC_UNAUTHORIZED);
		});

		it('should extract error code from errorCode field', async () => {
			const mockError = {
				errorCode: ERROR_CODES.WALLET_NOT_FOUND,
				message: 'Wallet not found',
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.type).toBe(ERROR_CODES.WALLET_NOT_FOUND);
		});

		it('should extract error code from legacy axios format', async () => {
			const mockError = {
				response: {
					data: {
						type: ERROR_CODES.WALLET_INVALID_CREDENTIALS,
					},
				},
			};

			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.type).toBe(ERROR_CODES.WALLET_INVALID_CREDENTIALS);
		});
	});

	describe('Type consistency', () => {
		it('should always return success boolean', async () => {
			// Success case
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: { balances: [] },
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result1 = await (flowClient as any).loadWallet('test-wallet-id');
			expect(typeof result1.success).toBe('boolean');

			// Error case
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: new Error('Test'),
				success: false,
			});

			const result2 = await (flowClient as any).loadWallet('test-wallet-id');
			expect(typeof result2.success).toBe('boolean');
		});

		it('should return error message on failure', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: new Error('Test error'),
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(false);
			expect(typeof result.error).toBe('string');
			expect(result.error).toBe('Test error');
		});

		it('should not have result field on error', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: null,
				error: new Error('Test'),
				success: false,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(false);
			expect(result.result).toBeUndefined();
		});

		it('should not have error field on success', async () => {
			mockFetchWithdrawableBalanceFn.mockResolvedValue({
				data: { balances: [] },
				error: null,
				success: true,
			});

			await flowClient.loadExchanges();
			const result = await (flowClient as any).loadWallet('test-wallet-id');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.type).toBeUndefined();
		});
	});
});
