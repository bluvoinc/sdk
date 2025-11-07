import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines';
import { ERROR_CODES } from '../../src/error-codes';

describe('BluvoFlowClient.submit2FA', () => {
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

	// Helper to set up flow machine in withdraw:error2FA state
	async function setup2FARequiredState() {
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
			// Start withdrawal and trigger 2FA requirement
			machine.send({ type: "START_WITHDRAWAL", quoteId: "test-quote-id" });
			machine.send({ type: "WITHDRAWAL_REQUIRES_2FA" });
		}
	}

	describe('Guard cases', () => {
		it('should handle missing flow machine', async () => {
			// Don't initialize flow machine
			const result = await flowClient.submit2FA('123456');

			expect(result).toEqual({
				success: false,
				error: 'Flow machine not initialized',
			});
		});

		it('should handle wrong state (not withdraw:error2FA)', async () => {
			await flowClient.loadExchanges();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.error).toContain('Cannot submit 2FA in state');
		});

		it('should handle missing wallet ID in state', async () => {
			await flowClient.loadExchanges();

			const machine = (flowClient as any).flowMachine;
			if (machine) {
				// Set up state in withdraw:error2FA but without wallet ID
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
				machine.send({ type: "START_WITHDRAWAL", quoteId: "test-quote-id" });
				machine.send({ type: "WITHDRAWAL_REQUIRES_2FA" });

				// Clear wallet ID from context for this test
				const state = machine.getState();
				if (state.context) {
					state.context.walletId = undefined;
				}
			}

			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.error).toContain('Quote or wallet ID not found in state');
		});
	});

	describe('Success cases', () => {
		it('should return standardized success response when 2FA is accepted', async () => {
			const mockResponse = {
				workflowId: 'test-workflow-id',
				status: 'processing',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: mockResponse,
				error: null,
				success: true,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result).toEqual({
				// Legacy flat access
				workflowId: 'test-workflow-id',
				status: 'processing',

				// New standardized
				success: true,
				result: mockResponse,
			});
		});

		it('should call executeWithdrawalFn with correct parameters including 2FA code', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setup2FARequiredState();
			await flowClient.submit2FA('654321');

			// Verify the call was made with twofa parameter
			expect(mockExecuteWithdrawalFn).toHaveBeenCalled();
			const callArgs = mockExecuteWithdrawalFn.mock.calls[0];
			expect(callArgs[0]).toBe('test-wallet-id'); // walletId
			expect(callArgs[2]).toBe('test-quote-id'); // quoteId
			expect(callArgs[3]).toEqual({ twofa: '654321' }); // options with 2FA code
		});

		it('should send SUBMIT_2FA action to state machine', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setup2FARequiredState();

			const stateBefore = flowClient.getState();
			expect(stateBefore?.type).toBe('withdraw:error2FA');

			await flowClient.submit2FA('123456');

			// After successful submission, state should progress
			const stateAfter = flowClient.getState();
			expect(stateAfter).toBeDefined();
		});
	});

	describe('Error cases: API failures', () => {
		it('should handle invalid 2FA code error', async () => {
			const mockError = {
				type: ERROR_CODES.WITHDRAWAL_2FA_INVALID,
				message: 'Invalid 2FA code',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('wrong-code');

			expect(result).toEqual({
				success: false,
				error: 'Invalid 2FA code',
				type: ERROR_CODES.WITHDRAWAL_2FA_INVALID,
			});
		});

		it('should handle generic API error', async () => {
			const mockError = new Error('Network connection failed');

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Network connection failed');
			expect(result.type).toBeUndefined();
		});

		it('should handle error without message', async () => {
			const mockError = { code: 500 };

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to submit 2FA code');
		});

		it('should handle 2FA expired error', async () => {
			const mockError = {
				type: ERROR_CODES.QUOTE_EXPIRED,
				message: 'Quote has expired',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.type).toBe(ERROR_CODES.QUOTE_EXPIRED);
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

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			// Verify both access patterns work
			expect(result).toMatchObject(mockResponse);    // Legacy flat access
			expect(result.result).toEqual(mockResponse);   // New nested access
			expect(result.success).toBe(true);
		});

		it('should never return undefined', async () => {
			// Test with guard failure
			const result1 = await flowClient.submit2FA('123456');
			expect(result1).toBeDefined();
			expect(result1.success).toBe(false);

			// Test with API error
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test error'),
				success: false,
			});

			await setup2FARequiredState();
			const result2 = await flowClient.submit2FA('123456');
			expect(result2).toBeDefined();
			expect(result2.success).toBe(false);
		});
	});

	describe('Error type extraction', () => {
		it('should extract error code from type field', async () => {
			const mockError = {
				type: ERROR_CODES.WITHDRAWAL_2FA_INVALID,
				message: 'Invalid 2FA code',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_2FA_INVALID);
		});

		it('should extract error code from errorCode field', async () => {
			const mockError = {
				errorCode: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP,
				message: 'TOTP 2FA required',
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP);
		});

		it('should extract error code from legacy axios format', async () => {
			const mockError = {
				response: {
					data: {
						type: ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED,
					},
				},
			};

			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: mockError,
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED);
		});
	});

	describe('Type consistency', () => {
		it('should always return success boolean', async () => {
			// Guard failure case
			const result1 = await flowClient.submit2FA('123456');
			expect(typeof result1.success).toBe('boolean');

			// API success case
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setup2FARequiredState();
			const result2 = await flowClient.submit2FA('123456');
			expect(typeof result2.success).toBe('boolean');

			// API error case
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test'),
				success: false,
			});

			await setup2FARequiredState();
			const result3 = await flowClient.submit2FA('123456');
			expect(typeof result3.success).toBe('boolean');
		});

		it('should return error message on failure', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: null,
				error: new Error('Test error message'),
				success: false,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

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

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(false);
			expect(result.result).toBeUndefined();
		});

		it('should not have error field on success', async () => {
			mockExecuteWithdrawalFn.mockResolvedValue({
				data: {},
				error: null,
				success: true,
			});

			await setup2FARequiredState();
			const result = await flowClient.submit2FA('123456');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.type).toBeUndefined();
		});
	});
});
