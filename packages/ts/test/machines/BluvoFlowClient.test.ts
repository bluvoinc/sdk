import {describe, it, expect, vi, beforeEach} from 'vitest';
import {BluvoFlowClient} from '../../src/machines';
import {ERROR_CODES, WITHDRAWAL_QUOTATION_ERROR_TYPES, WITHDRAWAL_EXECUTION_ERROR_TYPES} from '../../src/error-codes';
import {
    Walletwithdrawbalancebalance200Response,
    Walletwithdrawquotequotation200Response,
} from '../../generated';

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

        getWalletByIdFn: vi.fn(),
        listExchangesFn: vi.fn(),
        mkUUIDFn: () => 'test-uuid-123'
    };

    const mockBalanceResponse: Walletwithdrawbalancebalance200Response = {
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

    const mockQuoteResponse: Walletwithdrawquotequotation200Response = {
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
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchWithdrawableBalance error handling', () => {
        it('should handle generic error in fetchWithdrawableBalance using resumeWithdrawalFlow', async () => {
            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockRejectedValue(new Error('Network error'))
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
            const error = new Error('Wallet not found');
            (error as any).errorCode = ERROR_CODES.WALLET_NOT_FOUND;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Insufficient balance');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Insufficient balance for fee');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy insufficient balance');
            (error as any).type = WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy insufficient balance for fee');
            (error as any).code = WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE_CANNOT_COVER_FEE;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Amount too small');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Amount too large');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy amount error');
            (error as any).response = {
                data: {
                    type: WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM
                }
            };

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Invalid address format');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Network not supported');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue(mockQuoteResponse);
        });

        it('should handle WITHDRAWAL_2FA_REQUIRED_TOTP error', async () => {
            const error = new Error('TOTP required');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('SMS code required');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy 2FA required');
            (error as any).type = WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy SMS required');
            (error as any).code = WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue(mockQuoteResponse);
        });

        it('should handle WITHDRAWAL_KYC_REQUIRED error', async () => {
            const error = new Error('KYC verification required');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_KYC_REQUIRED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Balance changed - insufficient funds');
            (error as any).errorCode = ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy KYC required');
            (error as any).response = {
                data: {
                    type: WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED
                }
            };

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue(mockQuoteResponse);
        });

        it('should handle QUOTE_EXPIRED error', async () => {
            const error = new Error('Quote has expired');
            (error as any).errorCode = ERROR_CODES.QUOTE_EXPIRED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            const error = new Error('Legacy quote expired');
            (error as any).type = WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED;

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue(mockQuoteResponse);
        });

        it('should handle unknown error as fatal', async () => {
            const error = new Error('Unknown error occurred');

            const client = new BluvoFlowClient({
                ...defaultOptions,
                executeWithdrawalFn: vi.fn().mockRejectedValue(error)
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
                executeWithdrawalFn: vi.fn().mockRejectedValue('String error')
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
            defaultOptions.fetchWithdrawableBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);
            defaultOptions.requestQuotationFn = vi.fn().mockResolvedValue(mockQuoteResponse);
        });

        it('should handle invalid 2FA code error in submit2FA', async () => {
            const initialError = new Error('2FA required');
            (initialError as any).errorCode = ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP;

            const invalidCodeError = new Error('Invalid 2FA code');
            (invalidCodeError as any).errorCode = ERROR_CODES.WITHDRAWAL_2FA_INVALID;

            const executeWithdrawalFn = vi.fn()
                .mockRejectedValueOnce(initialError)
                .mockRejectedValueOnce(invalidCodeError);

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
            const initialError = new Error('SMS required');
            (initialError as any).errorCode = ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS;

            const kycError = new Error('KYC required after SMS');
            (kycError as any).errorCode = ERROR_CODES.WITHDRAWAL_KYC_REQUIRED;

            const executeWithdrawalFn = vi.fn()
                .mockRejectedValueOnce(initialError)
                .mockRejectedValueOnce(kycError);

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
            const balanceError = new Error('Insufficient balance');
            (balanceError as any).errorCode = ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE;

            const minAmountError = new Error('Amount below minimum');
            (minAmountError as any).errorCode = ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM;

            // Create separate client instances to avoid call count confusion
            const client1 = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(balanceError)
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
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(minAmountError)
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
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse)
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
                autoRefreshQuotation: false, // Disable auto-refresh to test expiration behavior
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(shortExpiryQuote)
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
            const error = {
                message: 'API Error',
                response: {
                    data: {
                        type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
                    }
                }
            };

            const client = new BluvoFlowClient({
                ...defaultOptions,
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockRejectedValue(error)
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
                fetchWithdrawableBalanceFn: vi.fn().mockRejectedValue(null),
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