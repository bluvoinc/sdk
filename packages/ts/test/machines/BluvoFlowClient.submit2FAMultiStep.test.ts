import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluvoFlowClient } from '../../src/machines';

/**
 * Multi-step 2FA submission behavior.
 *
 * KuCoin's broker withdrawal API validates ALL factors in a single call:
 * submitting a partial factor set (e.g. only the Google code when email+Google
 * are required with relation AND) makes KuCoin answer 200000 with no ids and
 * the challenge dies. The client must therefore collect every required code
 * before re-executing the withdrawal.
 *
 * Binance-web (and similar) verify factors incrementally server-side, so for
 * those exchanges each submitted code still triggers an immediate re-execution.
 */
describe('BluvoFlowClient.submit2FAMultiStep', () => {
	let flowClient: BluvoFlowClient;
	let mockExecuteWithdrawalFn: ReturnType<typeof vi.fn>;
	let mockListExchangesFn: ReturnType<typeof vi.fn>;
	let mockFetchWithdrawableBalanceFn: ReturnType<typeof vi.fn>;
	let mockRequestQuotationFn: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockExecuteWithdrawalFn = vi.fn().mockResolvedValue({
			data: { transactionId: 'tx-123' },
			error: null,
			success: true,
		});
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

	async function setupMultiStep2FAState(options: {
		exchange: string;
		relation: 'AND' | 'OR';
		steps?: Array<{
			type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS' | 'ROAMING_FIDO';
			status: 'pending' | 'success' | 'failed';
			required: boolean;
		}>;
		mfa?: { verified: Record<string, boolean> };
	}) {
		await flowClient.loadExchanges();

		const machine = (flowClient as any).flowMachine;
		machine.send({
			type: 'START_OAUTH',
			exchange: options.exchange,
			walletId: 'test-wallet-id',
			idem: 'test-idem',
		});
		machine.send({ type: 'OAUTH_WINDOW_OPENED' });
		machine.send({
			type: 'OAUTH_COMPLETED',
			walletId: 'test-wallet-id',
			exchange: options.exchange,
		});
		machine.send({ type: 'LOAD_WALLET' });
		machine.send({ type: 'WALLET_LOADED', balances: [] });
		machine.send({
			type: 'REQUEST_QUOTE',
			asset: 'USDT',
			amount: '10',
			destinationAddress: 'test-address',
		});
		machine.send({
			type: 'QUOTE_RECEIVED',
			quote: {
				id: 'test-quote-id',
				asset: 'USDT',
				amount: '10',
				estimatedFee: '0.25',
				estimatedTotal: '10.25',
				expiresAt: Date.now() + 60000,
			},
		});
		machine.send({ type: 'START_WITHDRAWAL', quoteId: 'test-quote-id' });
		machine.send({
			type: 'WITHDRAWAL_REQUIRES_2FA_MULTI_STEPS',
			result: {
				bizNo: 'kucoin-tx-123',
				relation: options.relation,
				steps: options.steps ?? [
					{ type: 'EMAIL', status: 'pending', required: true },
					{ type: 'GOOGLE', status: 'pending', required: true },
				],
				...(options.mfa ? { mfa: options.mfa } : {}),
			},
		});

		return machine;
	}

	describe('KuCoin (batch factor validation, relation AND)', () => {
		it('does not re-execute the withdrawal until all required codes are collected', async () => {
			const machine = await setupMultiStep2FAState({ exchange: 'kucoin', relation: 'AND' });

			const result = await flowClient.submit2FAMultiStep('EMAIL', '142262');

			expect(result.success).toBe(true);
			expect(mockExecuteWithdrawalFn).not.toHaveBeenCalled();

			const state = machine.getState();
			expect(state.type).toBe('withdraw:error2FAMultiStep');
			expect(state.context.multiStep2FA.collectedCodes).toEqual({ emailCode: '142262' });
		});

		it('marks the collected step as success so the UI advances to the next step', async () => {
			const machine = await setupMultiStep2FAState({ exchange: 'kucoin', relation: 'AND' });

			await flowClient.submit2FAMultiStep('EMAIL', '142262');

			const steps = machine.getState().context.multiStep2FA.steps;
			expect(steps.find((s: any) => s.type === 'EMAIL')?.status).toBe('success');
			expect(steps.find((s: any) => s.type === 'GOOGLE')?.status).toBe('pending');
		});

		it('executes exactly once with bizNo and every collected code after the final code', async () => {
			await setupMultiStep2FAState({ exchange: 'kucoin', relation: 'AND' });

			await flowClient.submit2FAMultiStep('EMAIL', '142262');
			const result = await flowClient.submit2FAMultiStep('GOOGLE', '616566');

			expect(result.success).toBe(true);
			expect(mockExecuteWithdrawalFn).toHaveBeenCalledTimes(1);
			expect(mockExecuteWithdrawalFn).toHaveBeenCalledWith(
				'test-wallet-id',
				expect.any(String),
				'test-quote-id',
				{
					bizNo: 'kucoin-tx-123',
					emailCode: '142262',
					twofa: '616566',
				},
			);
		});

		it('treats steps already verified via mfa as satisfied', async () => {
			await setupMultiStep2FAState({
				exchange: 'kucoin',
				relation: 'AND',
				mfa: { verified: { GOOGLE: true } },
			});

			await flowClient.submit2FAMultiStep('EMAIL', '142262');

			expect(mockExecuteWithdrawalFn).toHaveBeenCalledTimes(1);
			expect(mockExecuteWithdrawalFn).toHaveBeenCalledWith(
				'test-wallet-id',
				expect.any(String),
				'test-quote-id',
				{
					bizNo: 'kucoin-tx-123',
					emailCode: '142262',
				},
			);
		});
	});

	describe('KuCoin (relation OR)', () => {
		it('re-executes immediately after a single code', async () => {
			await setupMultiStep2FAState({ exchange: 'kucoin', relation: 'OR' });

			await flowClient.submit2FAMultiStep('GOOGLE', '616566');

			expect(mockExecuteWithdrawalFn).toHaveBeenCalledTimes(1);
			expect(mockExecuteWithdrawalFn).toHaveBeenCalledWith(
				'test-wallet-id',
				expect.any(String),
				'test-quote-id',
				{
					bizNo: 'kucoin-tx-123',
					twofa: '616566',
				},
			);
		});
	});

	describe('exchanges with incremental verification (e.g. binance-web)', () => {
		it('keeps re-executing after each submitted code', async () => {
			await setupMultiStep2FAState({ exchange: 'binance-web', relation: 'AND' });

			await flowClient.submit2FAMultiStep('EMAIL', '142262');

			expect(mockExecuteWithdrawalFn).toHaveBeenCalledTimes(1);
			expect(mockExecuteWithdrawalFn).toHaveBeenCalledWith(
				'test-wallet-id',
				expect.any(String),
				'test-quote-id',
				{
					bizNo: 'kucoin-tx-123',
					emailCode: '142262',
				},
			);
		});
	});
});
