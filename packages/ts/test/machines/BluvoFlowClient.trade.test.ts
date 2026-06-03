import { describe, it, expect, vi, beforeEach } from "vitest";
import { BluvoFlowClient, createFlowMachine } from "../../src/machines";

vi.mock("../../src/BluvoWebClient", () => {
	return {
		BluvoWebClient: {
			createClient: vi.fn(() => ({
				listen: vi.fn().mockResolvedValue({ topicName: "test-topic" }),
				unsubscribe: vi.fn().mockResolvedValue(undefined),
				oauth2: { openWindow: vi.fn().mockResolvedValue(() => {}) },
			})),
		},
	};
});

describe("BluvoFlowClient trading flow", () => {
	const mockBalances = [
		{
			asset: "DOGE",
			amount: 100,
			amountInFiat: 15,
			networks: [],
		},
	];

	const mockBalancesAfterTrade = {
		lastSyncAt: new Date().toISOString(),
		balances: [
			{
				asset: "USDC",
				amount: 10,
				amountInFiat: 10,
				networks: [
					{
						id: "base",
						name: "Base",
						displayName: "Base",
						minWithdrawal: "1",
						assetName: "USDC",
					},
				],
			},
		],
	};

	const mockTradableAssets = {
		schemaVersion: 1 as const,
		exchange: "kraken",
		generatedAt: new Date().toISOString(),
		source: {
			api: "AssetPairs",
			fetchedAt: new Date().toISOString(),
		},
		assets: [
			{
				assetId: "DOGE",
				symbol: "DOGE",
				exchangeSymbols: ["XXDG"],
			},
			{
				assetId: "USDC",
				symbol: "USDC",
				exchangeSymbols: ["USDC"],
			},
		],
		routes: [
			{
				routeId: "kraken:spot:DOGE/USDC",
				exchange: "kraken",
				marketType: "spot" as const,
				baseAsset: "DOGE",
				quoteAsset: "USDC",
				displaySymbol: "DOGE/USDC",
				exchangeSymbol: "DOGEUSDC",
				status: "online" as const,
				isTradingEnabled: true,
				margin: { isMarginEnabled: false },
				orderTypes: ["market" as const, "limit" as const],
				tradingRules: {
					quantity: {
						minBaseQty: "1",
						stepSize: "0.00000001",
					},
				},
			},
		],
		stats: {
			totalAssets: 2,
			totalRoutes: 1,
			tradableRoutes: 1,
		},
	};

	const mockPlacedOrder = {
		orderId: "trade-tx-1",
		txid: ["trade-tx-1"],
		exchange: "kraken",
		routeId: "kraken:spot:DOGE/USDC",
		description: "sell 100 DOGEUSDC @ market",
	};

	const mockFilledOrder = {
		orderId: "trade-tx-1",
		exchange: "kraken",
		status: "filled" as const,
		rawStatus: "closed",
		volume: "100",
		executedVolume: "100",
		cost: "10",
		averagePrice: "0.10",
		fee: "0.026",
		description: {
			pair: "DOGEUSDC",
			side: "sell",
			type: "market",
		},
	};

	const baseOptions = () => ({
		orgId: "test-org",
		projectId: "test-project",
		fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue({
			data: mockBalancesAfterTrade,
			error: null,
			success: true,
		}),
		requestQuotationFn: vi.fn(),
		executeWithdrawalFn: vi.fn(),
		getWalletByIdFn: vi.fn(),
		pingWalletByIdFn: vi.fn(),
		listExchangesFn: vi.fn(),
		getTradableAssetsFn: vi.fn().mockResolvedValue({
			data: mockTradableAssets,
			error: null,
			success: true,
		}),
		placeOrderFn: vi.fn().mockResolvedValue({
			data: mockPlacedOrder,
			error: null,
			success: true,
		}),
		getOrderFn: vi.fn().mockResolvedValue({
			data: mockFilledOrder,
			error: null,
			success: true,
		}),
		mkUUIDFn: () => "test-uuid",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads tradable assets into the flow state", async () => {
		const options = baseOptions();
		const client = new BluvoFlowClient(options);
		const { machine } = await client.silentResumeWithdrawalFlow({
			exchange: "kraken",
			walletId: "wallet-123",
			preloadedBalances: mockBalances as any,
		});

		const result = await client.loadTradableAssets();

		expect(result.success).toBe(true);
		expect(options.getTradableAssetsFn).toHaveBeenCalledWith("wallet-123");
		expect(machine.getState().type).toBe("trade:assetsReady");
		expect(machine.getState().context.tradableAssets).toEqual(mockTradableAssets);
	});

	it("places a single trade order and stores the returned txid", async () => {
		const options = baseOptions();
		const client = new BluvoFlowClient(options);
		const { machine } = await client.silentResumeWithdrawalFlow({
			exchange: "kraken",
			walletId: "wallet-123",
			preloadedBalances: mockBalances as any,
		});

		const result = await client.placeTradeOrder({
			routeId: "kraken:spot:DOGE/USDC",
			side: "sell",
			type: "market",
			volume: "100",
		});

		expect(result.success).toBe(true);
		expect(options.placeOrderFn).toHaveBeenCalledWith("wallet-123", {
			routeId: "kraken:spot:DOGE/USDC",
			side: "sell",
			type: "market",
			volume: "100",
		});
		expect(machine.getState().type).toBe("trade:orderPlaced");
		expect(machine.getState().context.tradeOrder?.orderId).toBe("trade-tx-1");
		expect(machine.getState().context.tradeOrder?.txid).toEqual(["trade-tx-1"]);
	});

	it("polls an order until filled and refreshes wallet balances for withdrawal", async () => {
		const options = baseOptions();
		options.getOrderFn
			.mockResolvedValueOnce({
				data: {
					...mockFilledOrder,
					status: "open",
					rawStatus: "open",
					executedVolume: "0",
				},
				error: null,
				success: true,
			})
			.mockResolvedValueOnce({
				data: mockFilledOrder,
				error: null,
				success: true,
			});

		const client = new BluvoFlowClient(options);
		const { machine } = await client.silentResumeWithdrawalFlow({
			exchange: "kraken",
			walletId: "wallet-123",
			preloadedBalances: mockBalances as any,
		});

		await client.placeTradeOrder({
			routeId: "kraken:spot:DOGE/USDC",
			side: "sell",
			type: "market",
			volume: "100",
		});

		const result = await client.pollTradeOrder("trade-tx-1", {
			intervalMs: 0,
			maxAttempts: 2,
		});

		expect(result.success).toBe(true);
		expect(result.result?.status).toBe("filled");
		expect(options.getOrderFn).toHaveBeenCalledTimes(2);
		expect(options.fetchWithdrawableBalanceFn).toHaveBeenCalledWith("wallet-123");
		expect(machine.getState().type).toBe("wallet:ready");
		expect(machine.getState().context.lastTradeOrderStatus).toEqual(mockFilledOrder);
		expect(machine.getState().context.walletBalances?.[0]?.asset).toBe("USDC");
	});

	it("moves to a trade error state when a terminal non-filled order is observed", async () => {
		const options = baseOptions();
		options.getOrderFn.mockResolvedValue({
			data: {
				...mockFilledOrder,
				status: "canceled",
				rawStatus: "canceled",
			},
			error: null,
			success: true,
		});
		const client = new BluvoFlowClient(options);
		const { machine } = await client.silentResumeWithdrawalFlow({
			exchange: "kraken",
			walletId: "wallet-123",
			preloadedBalances: mockBalances as any,
		});

		const result = await client.pollTradeOrder("trade-tx-1", {
			intervalMs: 0,
			maxAttempts: 1,
		});

		expect(result.success).toBe(false);
		expect(result.error).toContain("canceled");
		expect(machine.getState().type).toBe("trade:orderError");
	});
});

describe("FlowMachine trading states", () => {
	it("transitions through tradable asset, order placement, and filled order states", () => {
		const machine = createFlowMachine({
			orgId: "test-org",
			projectId: "test-project",
		});

		machine.send({
			type: "START_OAUTH",
			exchange: "kraken",
			walletId: "wallet-123",
			idem: "idem-123",
		});
		machine.send({ type: "OAUTH_WINDOW_OPENED" });
		machine.send({
			type: "OAUTH_COMPLETED",
			exchange: "kraken",
			walletId: "wallet-123",
		});
		machine.send({ type: "LOAD_WALLET" });
		machine.send({
			type: "WALLET_LOADED",
			balances: [{ asset: "DOGE", balance: "100" }],
		});

		machine.send({ type: "LOAD_TRADABLE_ASSETS" });
		expect(machine.getState().type).toBe("trade:assetsLoading");

		machine.send({
			type: "TRADABLE_ASSETS_LOADED",
			tradableAssets: {
				schemaVersion: 1,
				exchange: "kraken",
				generatedAt: new Date().toISOString(),
				source: { api: "AssetPairs", fetchedAt: new Date().toISOString() },
				assets: [],
				routes: [],
				stats: { totalAssets: 0, totalRoutes: 0, tradableRoutes: 0 },
			},
		});
		expect(machine.getState().type).toBe("trade:assetsReady");

		machine.send({
			type: "PLACE_TRADE_ORDER",
			request: {
				routeId: "kraken:spot:DOGE/USDC",
				side: "sell",
				type: "market",
				volume: "100",
			},
		});
		expect(machine.getState().type).toBe("trade:orderPlacing");

		machine.send({
			type: "TRADE_ORDER_PLACED",
			order: {
				orderId: "trade-tx-1",
				txid: ["trade-tx-1"],
				exchange: "kraken",
				routeId: "kraken:spot:DOGE/USDC",
				description: "sell 100 DOGEUSDC @ market",
			},
		});
		expect(machine.getState().type).toBe("trade:orderPlaced");

		machine.send({ type: "POLL_TRADE_ORDER", orderId: "trade-tx-1" });
		expect(machine.getState().type).toBe("trade:orderPolling");

		machine.send({
			type: "TRADE_ORDER_FILLED",
			orderStatus: {
				orderId: "trade-tx-1",
				exchange: "kraken",
				status: "filled",
				rawStatus: "closed",
			},
		});
		expect(machine.getState().type).toBe("trade:orderFilled");
		expect(machine.getState().context.lastTradeOrderStatus?.status).toBe(
			"filled",
		);
	});
});
