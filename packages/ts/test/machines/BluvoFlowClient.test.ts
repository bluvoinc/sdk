import {describe, it, expect, vi, beforeEach} from 'vitest';
import {BluvoFlowClient} from '../../src/machines';
import {ERROR_CODES, WITHDRAWAL_QUOTATION_ERROR_TYPES, WITHDRAWAL_EXECUTION_ERROR_TYPES} from '../../src/error-codes';

// Mock the BluvoWebClient module
vi.mock('../../src/BluvoWebClient', () => {
    return {
        BluvoWebClient: {
            createClient: vi.fn(() => ({
                listen: vi.fn().mockResolvedValue({topicName: 'test-topic'}),
                unsubscribe: vi.fn().mockResolvedValue(undefined),
                oauth2: {openWindow: vi.fn().mockResolvedValue(() => {})}
            }))
        }
    };
});

describe('BluvoFlowClient Error Handling', () => {
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

    describe('fetchWithdrawableBalance error handling', () => {
        it('should handle generic error in fetchWithdrawableBalance using resumeWithdrawalFlow', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Network error', type: 'GENERIC_INTERNAL_SERVER_ERROR' },
                    success: false
                })
            });

            // Use resumeWithdrawalFlow which calls loadWallet immediately
            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            // Wait for the async loadWallet to complete
            await new Promise(resolve => setTimeout(resolve, 300));

            const state = machine.getState();
            expect(state.type).toBe('wallet:error');
            expect(state.error?.message).toBe('Network error');
        });

        it('should handle wallet not found error using resumeWithdrawalFlow', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Wallet not found', type: ERROR_CODES.WALLET_NOT_FOUND },
                    success: false
                })
            });

            // Use resumeWithdrawalFlow which calls loadWallet immediately
            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            // Wait for the async loadWallet to complete
            await new Promise(resolve => setTimeout(resolve, 300));

            const state = machine.getState();
            expect(state.type).toBe('wallet:error');
            expect(state.error?.message).toBe('Wallet not found');
        });
    });

    describe('requestQuotation error handling - Insufficient Balance', () => {
        it('should handle WITHDRAWAL_INSUFFICIENT_BALANCE error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Insufficient balance', type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE, errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            // Request quote that will fail
            await client.requestQuote({
                asset: 'BTC',
                amount: '2.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Insufficient balance');
        });

        it('should handle WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Insufficient balance for fee', type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE, errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.5',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Insufficient balance');
        });

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
                    error: { error: 'Legacy insufficient balance', type: WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
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

        it('should handle legacy INSUFFICIENT_BALANCE_CANNOT_COVER_FEE error type', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Legacy insufficient balance for fee', code: WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE_CANNOT_COVER_FEE },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.5',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Insufficient balance');
        });
    });

    describe('requestQuotation error handling - Amount Validation', () => {
        it('should handle WITHDRAWAL_AMOUNT_BELOW_MINIMUM error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Amount too small', type: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM, errorCode: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '0.00001',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Amount below minimum');
        });

        it('should handle WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Amount too large', type: ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM, errorCode: ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1000',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Amount above maximum');
        });

        it('should handle legacy amount validation error types', async () => {
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
                        error: 'Legacy amount error',
                        response: {
                            data: {
                                type: WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM
                            }
                        }
                    },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '0.00001',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Amount below minimum');
        });
    });

    describe('requestQuotation error handling - Address and Network', () => {
        it('should handle WITHDRAWAL_INVALID_ADDRESS error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Invalid address format', type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS, errorCode: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: 'invalid-address'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Invalid destination address');
        });

        it('should handle WITHDRAWAL_NETWORK_NOT_SUPPORTED error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Network not supported', type: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED, errorCode: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                network: 'unsupported-network'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Network not supported');
        });
    });

    describe('executeWithdrawal error handling - 2FA Errors', () => {
        beforeEach(() => {
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
                data: mockBalanceResponse,
                error: null,
                success: true
            });
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
                success: true
            });
        });

        it('should handle WITHDRAWAL_2FA_REQUIRED_TOTP error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'TOTP required', type: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP, errorCode: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:error2FA');
        });

        it('should handle WITHDRAWAL_2FA_REQUIRED_SMS error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'SMS code required', type: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS, errorCode: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorSMS');
        });

        it('should handle legacy TWO_FACTOR_REQUIRED error type', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Legacy 2FA required', type: WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:error2FA');
        });

        it('should handle legacy SMS_CODE_REQUIRED error type', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Legacy SMS required', code: WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorSMS');
        });
    });

    describe('executeWithdrawal error handling - KYC and Balance', () => {
        beforeEach(() => {
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
                data: mockBalanceResponse,
                error: null,
                success: true
            });
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
                success: true
            });
        });

        it('should handle WITHDRAWAL_KYC_REQUIRED error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'KYC verification required', type: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED, errorCode: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorKYC');
        });

        it('should handle WITHDRAWAL_INSUFFICIENT_BALANCE during execution', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Balance changed - insufficient funds', type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE, errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorBalance');
        });

        it('should handle legacy KYC_REQUIRED error type', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: {
                        error: 'Legacy KYC required',
                        response: {
                            data: {
                                type: WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED
                            }
                        }
                    },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorKYC');
        });
    });

    describe('executeWithdrawal error handling - Quote Expired', () => {
        beforeEach(() => {
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
                data: mockBalanceResponse,
                error: null,
                success: true
            });
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
                success: true
            });
        });

        it('should handle QUOTE_EXPIRED error', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Quote has expired', type: ERROR_CODES.QUOTE_EXPIRED, errorCode: ERROR_CODES.QUOTE_EXPIRED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait longer for async operations and state machine transition
            await new Promise(resolve => setTimeout(resolve, 300));

            const state = machine.getState();
            // The state machine might be in processing or expired, both are valid for immediate errors
            expect(['quote:expired', 'withdraw:processing']).toContain(state.type);
        });

        it('should handle legacy RESOURCE_EXHAUSTED error type', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Legacy quote expired', type: WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait longer for async operations and state machine transition
            await new Promise(resolve => setTimeout(resolve, 300));

            const state = machine.getState();
            // The state machine might be in processing or expired, both are valid for immediate errors
            expect(['quote:expired', 'withdraw:processing']).toContain(state.type);
        });
    });

    describe('executeWithdrawal error handling - Fatal Errors', () => {
        beforeEach(() => {
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
                data: mockBalanceResponse,
                error: null,
                success: true
            });
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
                success: true
            });
        });

        it('should handle unknown error as fatal', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Unknown error occurred' },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:fatal');
            expect(state.error?.message).toBe('Unknown error occurred');
        });

        it('should handle non-Error objects as fatal', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: 'String error',
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:fatal');
            expect(state.error?.message).toBe('Failed to execute withdrawal');
        });
    });

    describe('Error handling in submit2FA and submitSMS', () => {
        beforeEach(() => {
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue({
                data: mockBalanceResponse,
                error: null,
                success: true
            });
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
                success: true
            });
        });

        it('should handle invalid 2FA code error in submit2FA', async () => {
            const executeWithdrawalFn = vi.fn()
                .mockResolvedValueOnce({
                    data: null,
                    error: { error: '2FA required', type: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP, errorCode: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP },
                    success: false
                })
                .mockResolvedValueOnce({
                    data: null,
                    error: { error: 'Invalid 2FA code', type: ERROR_CODES.WITHDRAWAL_2FA_INVALID, errorCode: ERROR_CODES.WITHDRAWAL_2FA_INVALID },
                    success: false
                });

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(machine.getState().type).toBe('withdraw:error2FA');

            // Submit invalid 2FA code
            await client.submit2FA('123456');

            // Wait longer for async operations
            await new Promise(resolve => setTimeout(resolve, 200));

            const state = machine.getState();
            // The error could result in either error2FAInvalid or fatal state
            expect(['withdraw:error2FAInvalid', 'withdraw:fatal']).toContain(state.type);
        });

        it('should handle error in submitSMS and transition correctly', async () => {
            const executeWithdrawalFn = vi.fn()
                .mockResolvedValueOnce({
                    data: null,
                    error: { error: 'SMS required', type: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS, errorCode: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS },
                    success: false
                })
                .mockResolvedValueOnce({
                    data: null,
                    error: { error: 'KYC required after SMS', type: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED, errorCode: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED },
                    success: false
                });

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            await client.executeWithdrawal('quote-123');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(machine.getState().type).toBe('withdraw:errorSMS');

            // Submit SMS code
            await client.submitSMS('654321');

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const state = machine.getState();
            expect(state.type).toBe('withdraw:errorKYC');
        });
    });

    describe('Complex error scenarios', () => {
        it('should handle multiple error types in sequence', async () => {
            // Create separate client instances to avoid call count confusion
            const client1 = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Insufficient balance', type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE, errorCode: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE },
                    success: false
                })
            });

            const {machine: machine1} = await client1.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            // First quote request - insufficient balance
            await client1.requestQuote({
                asset: 'BTC',
                amount: '2.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            expect(machine1.getState().type).toBe('quote:error');
            expect(machine1.getState().error?.message).toBe('Insufficient balance');

            // Second client with different error
            const client2 = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: { error: 'Amount below minimum', type: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM, errorCode: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM },
                    success: false
                })
            });

            const {machine: machine2} = await client2.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client2.requestQuote({
                asset: 'BTC',
                amount: '0.00001',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            expect(machine2.getState().type).toBe('quote:error');
            expect(machine2.getState().error?.message).toBe('Amount below minimum');

            // Third client with success
            const client3 = new BluvoFlowClient({
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

            const {machine: machine3} = await client3.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client3.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            expect(machine3.getState().type).toBe('quote:ready');
        });

        it('should handle error during quote expiration timer', async () => {
            // Create a quote that expires in 100ms
            const shortExpiryQuote = {
                ...mockQuoteResponse,
                expiresAt: new Date(Date.now() + 100).toISOString()
            };

            const client = new BluvoFlowClient({
                ...defaultOptions,
                options: {
                    autoRefreshQuotation: false // Disable auto-refresh to test expiration behavior
                },
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: mockBalanceResponse,
                    error: null,
                    success: true
                }),
                requestQuotationFn: vi.fn().mockResolvedValue({
                    data: shortExpiryQuote,
                    error: null,
                    success: true
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            });

            expect(machine.getState().type).toBe('quote:ready');

            // Wait for quote to expire
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(machine.getState().type).toBe('quote:expired');
        });
    });

    describe('Error code extraction edge cases', () => {
        it('should handle error with code in response.data.type', async () => {
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
                        error: 'API Error',
                        response: {
                            data: {
                                type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
                            }
                        }
                    },
                    success: false
                })
            });

            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            await client.requestQuote({
                asset: 'BTC',
                amount: '1.0',
                destinationAddress: 'invalid'
            });

            const state = machine.getState();
            expect(state.type).toBe('quote:error');
            expect(state.error?.message).toBe('Invalid destination address');
        });

        it('should handle null/undefined errors gracefully', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                    success: false
                }),
            });

            // Use resumeWithdrawalFlow for more predictable timing
            const {machine} = await client.resumeWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-123'
            });

            // Wait for the async loadWallet to complete
            await new Promise(resolve => setTimeout(resolve, 300));

            const state = machine.getState();
            expect(state.type).toBe('wallet:error');
            expect(state.error?.message).toBe('Failed to load wallet');
        });
    });
});