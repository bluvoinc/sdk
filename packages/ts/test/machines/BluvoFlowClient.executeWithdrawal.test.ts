import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines';
import { ERROR_CODES } from '../../src/error-codes';

describe('BluvoFlowClient.executeWithdrawal', () => {
	let flowClient: BluvoFlowClient;
	let mockExecuteWithdrawalFn: ReturnType<typeof vi.fn>;
	let mockListExchangesFn: ReturnType<typeof vi.fn>;
	let mockFetchWithdrawableBalanceFn: ReturnType<typeof vi.fn>;
	let mockRequestQuotationFn: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create fresh mocks for each test
		mockExecuteWithdrawalFn = vi.fn();
		mockListExchangesFn = vi.fn().mockResolvedValue([]);
		mockFetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
			data: { balances: [] },
			error: null,
			success: true,
		});
		mockRequestQuotationFn = vi.fn();

		flowClient = new BluvoFlowClient({
			orgId: 'test-org',
			projectId: 'test-project',
			listExchangesFn: mockListExchangesFn,
			fetchWithdrawableBalanceFn: mockFetchWithdrawableBalanceFn,
			requestQuotationFn: mockRequestQuotationFn,
			executeWithdrawalFn: mockExecuteWithdrawalFn,
			getWalletByIdFn: vi.fn(),
			pingWalletByIdFn: vi.fn(),
		});
	});

	// Helper to set up flow machine in quote:ready state
	async function setupQuoteReadyState() {
		await flowClient.loadExchanges();

		const machine = (flowClient as any).flowMachine;
		if (machine) {
			// Simulate OAuth and wallet loading
			machine.send({
				type: "START_OAUTH",
				exchange: "coinbase",
				walletId: "test-wallet-id",
				idem: "test-idem",
			});
			machine.send({ type: "OAUTH_WINDOW_OPENED" });
			machine.send({
				type: "OAUTH_COMPLETED",
				walletId: "test-wallet-id",
				exchange: "coinbase",
			});
			machine.send({ type: "LOAD_WALLET" });
			machine.send({
				type: "WALLET_LOADED",
				balances: [],
			});
			machine.send({
				type: "REQUEST_QUOTE",
				asset: "BTC",
				amount: "1.0",
				destinationAddress: "test-address",
			});
			machine.send({
				type: "QUOTE_RECEIVED",
				quote: {
					id: "test-quote-id",
					asset: "BTC",
					amount: "1.0",
					estimatedFee: "0.001",
					estimatedTotal: "1.001",
					expiresAt: Date.now() + 60000,
				},
			});
		}
	}

	describe('Guard cases', () => {
		it('should handle missing flow machine', async () => {
			// Don't initialize flow machine
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result).toEqual({
				success: false,
				error: 'Flow machine not initialized',
			});
		});

		it('should handle missing wallet ID in state', async () => {
			await flowClient.loadExchanges();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result).toEqual({
				success: false,
				error: 'Wallet ID not found in state',
			});
		});

		it('should handle wrong state (not quote:ready)', async () => {
			await flowClient.loadExchanges();

			const machine = (flowClient as any).flowMachine;
			if (machine) {
				// Set up state with walletId but not in quote:ready
				machine.send({
					type: "START_OAUTH",
					exchange: "coinbase",
					walletId: "test-wallet-id",
					idem: "test-idem",
				});
			}

			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.error).toContain('Cannot execute withdrawal in state');
		});
	});

	describe('Success cases', () => {
		it('should return standardized success response when withdrawal is initiated', async () => {
			const mockResponse = {
				workflowId: 'test-workflow-id',
				status: 'processing',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: mockResponse,
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result).toEqual({
                // legacy flat
                workflowId: 'test-workflow-id',
                status: 'processing',

                // expand structured
				success: true,           // New standardized
				result: mockResponse,    // New nested
			});
		});

		it('should call executeWithdrawalFn with correct parameters', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			await flowClient.executeWithdrawal('test-quote-123');

			expect(mockExecuteWithdrawalFn).toHaveBeenCalledWith(
				'test-wallet-id',
				'test-quote-123',
				'test-quote-123',
				{},
			);
		});

		it('should update flow machine state when withdrawal is initiated', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			await flowClient.executeWithdrawal('test-quote-id');

			const state = flowClient.getState();
			expect(state).toBeDefined();
			expect(state?.type).toBe('withdraw:processing');
		});
	});

	describe('Error cases: API failures', () => {
		it('should handle API error with known error code', async () => {
			const mockError = {
				type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
				message: 'Insufficient balance for withdrawal',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result).toEqual({
				success: false,
				error: 'Insufficient balance for withdrawal',
				type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
			});
		});

		it('should handle API error with unknown error code', async () => {
			const mockError = {
				type: 'FUTURE_WITHDRAWAL_ERROR',
				message: 'Unknown withdrawal error',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result).toEqual({
				success: false,
				error: 'Unknown withdrawal error',
				type: 'FUTURE_WITHDRAWAL_ERROR',
			});
		});

		it('should handle Error instance', async () => {
			const mockError = new Error('Network connection failed');

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Network connection failed');
			expect(result.type).toBeUndefined();
		});

		it('should handle generic error without message', async () => {
			const mockError = { code: 500 };

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to execute withdrawal');
		});

		it('should handle WITHDRAWAL_INVALID_ADDRESS error', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: { type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS, message: 'Invalid address' },
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
		});

		it('should handle WITHDRAWAL_AMOUNT_BELOW_MINIMUM error', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: { type: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM, message: 'Amount below minimum' },
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM);
		});

		it('should handle WITHDRAWAL_2FA_REQUIRED_TOTP error', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: { type: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP, message: '2FA required' },
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP);
		});

		it('should handle WITHDRAWAL_KYC_REQUIRED error', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: { type: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED, message: 'KYC required' },
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_KYC_REQUIRED);
		});
	});

	describe('Legacy compatibility', () => {
		it('should provide both flat and nested structures in success response', async () => {
			const mockResponse = {
				workflowId: 'test-workflow',
				transactionId: 'test-tx',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: mockResponse,
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			// Verify both access patterns work
			expect(result).toMatchObject(mockResponse);    // Legacy flat access
			expect(result.result).toEqual(mockResponse);  // New nested access
			expect(result.success).toBe(true);
		});

		it('should never return undefined', async () => {
			// Test with guard failure
			const result1 = await flowClient.executeWithdrawal('test-quote-id');
			expect(result1).toBeDefined();
			expect(result1.success).toBe(false);

			// Test with API error
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test error'),
				success: false,
			});

			await setupQuoteReadyState();
			const result2 = await flowClient.executeWithdrawal('test-quote-id');
			expect(result2).toBeDefined();
			expect(result2.success).toBe(false);
		});
	});

	describe('Error type extraction', () => {
		it('should extract error code from type field', async () => {
			const mockError = {
				type: ERROR_CODES.WITHDRAWAL_RATE_LIMIT_EXCEEDED,
				message: 'Rate limit exceeded',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_RATE_LIMIT_EXCEEDED);
		});

		it('should extract error code from errorCode field', async () => {
			const mockError = {
				errorCode: ERROR_CODES.QUOTE_EXPIRED,
				message: 'Quote has expired',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.type).toBe(ERROR_CODES.QUOTE_EXPIRED);
		});

		it('should extract error code from legacy axios format', async () => {
			const mockError = {
				response: {
					data: {
						type: ERROR_CODES.WITHDRAWAL_PROVIDER_ERROR,
					},
				},
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_PROVIDER_ERROR);
		});
	});

	describe('Type consistency', () => {
		it('should always return success boolean', async () => {
			// Guard failure case
			const result1 = await flowClient.executeWithdrawal('test-quote-id');
			expect(typeof result1.success).toBe('boolean');

			// API success case
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			const result2 = await flowClient.executeWithdrawal('test-quote-id');
			expect(typeof result2.success).toBe('boolean');

			// API error case
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test'),
				success: false,
			});

			await setupQuoteReadyState();
			const result3 = await flowClient.executeWithdrawal('test-quote-id');
			expect(typeof result3.success).toBe('boolean');
		});

		it('should return error message on failure', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test error message'),
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(typeof result.error).toBe('string');
			expect(result.error).toBe('Test error message');
		});

		it('should not have result field on error', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test'),
				success: false,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(false);
			expect(result.result).toBeUndefined();
			expect(result.data).toBeUndefined();
		});

		it('should not have error field on success', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setupQuoteReadyState();
			const result = await flowClient.executeWithdrawal('test-quote-id');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.type).toBeUndefined();
		});
	});
});
