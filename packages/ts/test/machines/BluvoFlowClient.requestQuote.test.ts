import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines';
import { ERROR_CODES, WITHDRAWAL_QUOTATION_ERROR_TYPES } from '../../src/error-codes';

// Mock the BluvoWebClient module
vi.mock('../../src/BluvoWebClient', () => {
	return {
		BluvoWebClient: {
			createClient: vi.fn(() => ({
				listen: vi.fn().mockResolvedValue({ topicName: 'test-topic' }),
				unsubscribe: vi.fn().mockResolvedValue(undefined),
				oauth2: { openWindow: vi.fn().mockResolvedValue(() => {}) }
			}))
		}
	};
});

describe('BluvoFlowClient.requestQuote - Error-Proof Return Pattern', () => {
	const defaultOptions = {
		orgId: 'test-org',
		projectId: 'test-project',
		fetchWithdrawableBalanceFn: vi.fn(),
		requestQuotationFn: vi.fn(),
		executeWithdrawalFn: vi.fn(),
		getWalletByIdFn: vi.fn().mockResolvedValue({
			data: null,
			error: { error: 'Wallet not found', type: 'WALLET_NOT_FOUND' },
			success: false
		}),
		pingWalletByIdFn: vi.fn().mockResolvedValue({
			data: { status: 'OK' },
			error: null,
			success: true
		}),
		listExchangesFn: vi.fn(),
		mkUUIDFn: () => 'test-uuid-123'
	};

	const mockBalanceResponse = {
		lastSyncAt: new Date().toISOString(),
		balances: [{
			asset: 'BTC',
			amount: 1.5,
			networks: [{
				id: 'bitcoin',
				name: 'Bitcoin',
				displayName: 'Bitcoin',
				minWithdrawal: '0.0001',
				maxWithdrawal: '10',
				assetName: 'BTC'
			}],
			amountInFiat: 45000
		}]
	};

	const mockQuoteResponse = {
		id: 'quote-123',
		asset: 'BTC',
		amountNoFee: 1.0,
		estimatedFee: 0.001,
		estimatedTotal: 1.001,
		amountWithFeeInFiat: 30030,
		amountNoFeeInFiat: 30000,
		estimatedFeeInFiat: 30,
		expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
		destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
		additionalInfo: {
			minWithdrawal: '0.0001',
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Guard clause: No flow machine', () => {
		it('should return error object when flow machine is not initialized', async () => {
			const client = new BluvoFlowClient(defaultOptions);

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Flow machine not initialized');
			expect(result.type).toBeUndefined();
			expect(result.result).toBeUndefined();
		});
	});

	describe('Guard clause: No wallet ID', () => {
		it('should return error object when wallet ID is not in state', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				})
			});

			// Start flow but don't set wallet ID
			const { machine } = await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			// Manually clear walletId from context to simulate the error case
			const state = machine.getState();
			state.context.walletId = undefined as any;

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Wallet ID not found in state');
			expect(result.type).toBeUndefined();
			expect(result.result).toBeUndefined();
		});
	});

	describe('Success case', () => {
		it('should return success object with quote data', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: mockQuoteResponse,
					error: null,
					success: true
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.type).toBeUndefined();
			expect(result.result).toBeDefined();
			expect(result.result?.rawQuote).toEqual(mockQuoteResponse);
			expect(result.result?.quoteData).toBeDefined();
			expect(result.result?.quoteData.id).toBe('quote-123');
			expect(result.result?.quoteData.asset).toBe('BTC');
			expect(result.result?.quoteData.amount).toBe('1');
			expect(result.result?.quoteData.estimatedFee).toBe('0.001');
		});

		it('should maintain state machine transitions on success', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: mockQuoteResponse,
					error: null,
					success: true
				})
			});

			const { machine } = await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			const state = machine.getState();
			expect(state.type).toBe('quote:ready');
			expect(state.context.quote).toBeDefined();
		});
	});

	describe('API Error: Insufficient Balance', () => {
		it('should return error object with type for WITHDRAWAL_INSUFFICIENT_BALANCE', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Insufficient balance',
						type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
						errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '2.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Insufficient balance');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
			expect(result.result).toBeUndefined();
		});

		it('should return error object with type for WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Insufficient balance for fee',
						type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE,
						errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.5',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Insufficient balance');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE);
			expect(result.result).toBeUndefined();
		});

		it('should maintain state machine transitions on error', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Insufficient balance',
						type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE
					},
					success: false
				})
			});

			const { machine } = await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			await client.requestQuote({
				asset: 'BTC',
				amount: '2.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			const state = machine.getState();
			expect(state.type).toBe('quote:error');
			expect(state.error?.message).toBe('Insufficient balance');
		});
	});

	describe('API Error: Amount Validation', () => {
		it('should return error object with type for WITHDRAWAL_AMOUNT_BELOW_MINIMUM', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Amount too small',
						type: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM,
						errorCode: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '0.00001',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Amount below minimum');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM);
			expect(result.result).toBeUndefined();
		});

		it('should return error object with type for WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Amount too large',
						type: ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM,
						errorCode: ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1000',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Amount above maximum');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM);
			expect(result.result).toBeUndefined();
		});
	});

	describe('API Error: Address and Network', () => {
		it('should return error object with type for WITHDRAWAL_INVALID_ADDRESS', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Invalid address format',
						type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS,
						errorCode: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: 'invalid-address'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Invalid destination address');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
			expect(result.result).toBeUndefined();
		});

		it('should return error object with type for WITHDRAWAL_NETWORK_NOT_SUPPORTED', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Network not supported',
						type: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED,
						errorCode: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
				network: 'unsupported-network'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Network not supported');
			expect(result.type).toBe(ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED);
			expect(result.result).toBeUndefined();
		});
	});

	describe('Legacy error code compatibility', () => {
		it('should handle legacy INSUFFICIENT_BALANCE error type', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Legacy insufficient balance',
						type: WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '2.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Insufficient balance');
			expect(result.type).toBe(WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE);
		});

		it('should handle legacy error in response.data.type format', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Legacy error',
						response: {
							data: {
								type: WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM
							}
						}
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '0.00001',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Amount below minimum');
			expect(result.type).toBe(WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM);
		});
	});

	describe('Unknown error handling', () => {
		it('should return error object without type for unknown error code', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Some unknown error',
						type: 'UNKNOWN_ERROR_CODE'
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Some unknown error');
			expect(result.type).toBe('UNKNOWN_ERROR_CODE');
			expect(result.result).toBeUndefined();
		});

		it('should return error object when error has no code', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: {
						error: 'Generic error message'
					},
					success: false
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('Generic error message');
			expect(result.type).toBeUndefined();
			expect(result.result).toBeUndefined();
		});
	});

	describe('No quote data returned', () => {
		it('should return error object when quote data is null', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: null,
					error: null,
					success: true
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(false);
			expect(result.error).toBe('No quote returned from backend');
			expect(result.type).toBeUndefined();
			expect(result.result).toBeUndefined();
		});
	});

	describe('Type safety', () => {
		it('should have correct TypeScript types for success result', async () => {
			const client = new BluvoFlowClient({
				...defaultOptions,
				fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
					data: mockBalanceResponse,
					error: null,
					success: true
				}),
				requestQuotationFn: vi.fn().mockResolvedValue({
					data: mockQuoteResponse,
					error: null,
					success: true
				})
			});

			await client.resumeWithdrawalFlow({
				exchange: 'coinbase',
				walletId: 'wallet-123'
			});

			const result = await client.requestQuote({
				asset: 'BTC',
				amount: '1.0',
				destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
			});

			// Type guard pattern
			if (result.success) {
				expect(result.result).toBeDefined();
				expect(result.result?.rawQuote).toBeDefined();
				expect(result.result?.quoteData).toBeDefined();
				expect(result.error).toBeUndefined();
			} else {
				expect(result.error).toBeDefined();
				expect(result.result).toBeUndefined();
			}
		});
	});
});
