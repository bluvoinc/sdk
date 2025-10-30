import {
	type Oauth2ExchangeslistexchangesResponses,
	type Oauth2ExchangeurlgeturlData,
	oauth2Exchangeslistexchanges,
	oauth2Exchangeurlgeturl,
	type WalletlistlistwalletsData,
	type WallettransactionslisttransactionsData,
	type WalletwithdrawbalancebalanceData,
	type WalletwithdrawquoteidexecutewithdrawData,
	type WalletwithdrawquoteidexecutewithdrawResponse,
	type WalletwithdrawquotequotationData,
	walletdelete,
	walletget,
	walletlistlistwallets,
	walletpingping,
	wallettransactionslisttransactions,
	walletwithdrawbalancebalance,
	walletwithdrawquoteidexecutewithdraw,
	walletwithdrawquotequotation,
} from "../generated";
import { createClient, createConfig } from "../generated/client";
import type {
	Client,
	ClientOptions as ClientOptions2,
} from "../generated/client/types.gen";
import { transformResponse } from "./helpers";
/**
 * The core client class for interacting with Bluvo's cryptocurrency exchange integration platform.
 *
 * BluvoClient provides a comprehensive, strongly-typed interface to Bluvo's API services,
 * enabling seamless integration with cryptocurrency exchanges, market data, and blockchain functionality.
 * It handles authentication, request formatting, and response parsing, allowing you to focus on
 * building your application logic rather than API integration details.
 *
 * This class is not typically instantiated directly; use the `createClient` function instead.
 */
export class BluvoClient {
	private readonly wsBase: string;
	private readonly apiBase?: string;
	private readonly client: Client;

	/**
	 * Creates a new BluvoClient instance with the specified credentials.
	 *
	 * @param orgId Your Bluvo organization identifier.
	 * @param projectId Your Bluvo project identifier.
	 * @param apiKey Your Bluvo API access key.
	 * @param sandbox
	 * @param dev
	 * @param customDomain Custom domain configuration to override default api-bluvo.com
	 * @private Use the static `createClient` method or the global `createClient` function instead.
	 */
	private constructor(
		private readonly orgId: string,
		private readonly projectId: string,
		private readonly apiKey: string,
		readonly sandbox: boolean = false,
		readonly dev: boolean = false,
		readonly customDomain?:
			| string
			| "api-bluvo.com"
			| { api: string; ws: string },
	) {
		// Configure WebSocket and API base URLs based on customDomain first, then environment
		if (customDomain && typeof customDomain === "object") {
			// Custom domain with separate API and WebSocket URLs
			this.apiBase = `https://${customDomain.api}`;
			this.wsBase = `wss://${customDomain.ws}`;
		} else if (
			customDomain &&
			typeof customDomain === "string" &&
			customDomain !== "api-bluvo.com"
		) {
			// Custom domain for both API and WebSocket
			this.apiBase = `https://${customDomain}`;
			this.wsBase = `wss://${customDomain}`;
		} else if (dev) {
			this.apiBase = "http://localhost:8787";
			this.wsBase = "ws://localhost:8787";
		} else if (sandbox) {
			this.apiBase = "https://test.api-bluvo.com";
			this.wsBase = "wss://test.api-bluvo.com";
		} else {
			// Production default or explicit "api-bluvo.com"
			this.apiBase = "https://api-bluvo.com";
			this.wsBase = "wss://api-bluvo.com";
		}

		this.client = createClient(
			createConfig<ClientOptions2>({
				baseUrl: this.apiBase,
				auth: this.apiKey,
				headers: {
					"x-bluvo-api-key": this.apiKey,
					"x-bluvo-org-id": this.orgId,
					"x-bluvo-project-id": this.projectId,
				},
			}),
		);
	}

	/**
	 * Creates and initializes a new BluvoClient instance with the provided credentials.
	 *
	 * This factory method is the recommended way to create BluvoClient instances when not using
	 * the global `createClient` function. It ensures proper initialization and configuration
	 * of the client with your Bluvo API credentials.
	 *
	 * @param credentials An object containing your Bluvo API credentials:
	 *   @param orgId Your unique organization identifier.
	 *   @param projectId Your specific project identifier.
	 *   @param apiKey Your secret API key for authentication.
	 *   @param sandbox Optional flag to use sandbox environment.
	 *   @param dev Optional flag to use local development environment.
	 *   @param customDomain Optional custom domain configuration.
	 *
	 * @returns A fully configured BluvoClient instance ready for use.
	 */
	static createClient({
		orgId,
		projectId,
		apiKey,
		sandbox,
		dev,
		customDomain,
	}: {
		orgId: string;
		projectId: string;
		apiKey: string;
		sandbox?: boolean;
		dev?: boolean;
		customDomain?: string | "api-bluvo.com" | { api: string; ws: string };
	}) {
		return new BluvoClient(
			orgId,
			projectId,
			apiKey,
			sandbox,
			dev,
			customDomain,
		);
	}

	wallet = {
		/**
		 * Retrieve comprehensive details about a connected exchange wallet, including balances, permissions, and connection status.
		 *
		 * This method provides a complete snapshot of your connected exchange wallet, giving you real-time visibility into
		 * available funds, account permissions, and the health of the API connection. The data returned is fetched directly
		 * from the exchange API at the time of the request, ensuring you always have the most up-to-date information.
		 *
		 * Use this method to verify connections, check available balances across different assets, or determine
		 * the permission scope of your connected API keys before executing transactions.
		 *
		 * @param walletId The unique identifier of the connected wallet to query. This ID was specified during the initial
		 *                 wallet connection and uniquely identifies this particular exchange integration within your project.
		 *
		 * @returns A promise resolving to a detailed wallet information object containing:
		 *          - Connection status and health
		 *          - Exchange identifier and account details
		 *          - Available balances for all assets
		 *          - API key permissions and restrictions
		 *          - Last synchronization timestamp
		 *
		 * @example
		 * // Get details about a connected Binance wallet
		 * const walletDetails = await client.wallet.get('primary-trading-account');
		 * console.log(`Connection status: ${walletDetails.status}`);
		 * console.log(`BTC Balance: ${walletDetails.balances.BTC?.available || 0}`);
		 */

		get: async (walletId: string) => {
			const response = await walletget({
				client: this.client,
				headers: {
					"x-bluvo-wallet-id": walletId,
				},
			});
			return transformResponse(response);
		},

		/**
		 * Ping
		 */
		ping: async (walletId: string) => {
			const response = await walletpingping({
				client: this.client,
				headers: {
					"x-bluvo-wallet-id": walletId,
				},
			});
			return transformResponse(response);
		},

		/**
		 * Securely disconnect and remove a previously connected exchange wallet from your Bluvo project.
		 *
		 * This method completely removes the stored API credentials and terminates the connection between your Bluvo
		 * project and the exchange account. This is useful when you need to rotate API keys, remove unused connections,
		 * or comply with user requests to delete their account information.
		 *
		 * The deletion is immediate and permanent. After deletion, any operations that were using this wallet connection
		 * will fail until a new connection is established with the `connect` method.
		 *
		 * @param walletId The unique identifier of the connected wallet to permanently delete from your project.
		 *                 This is the same ID that was used when initially connecting the wallet.
		 *
		 * @returns A promise resolving to a confirmation object indicating successful deletion with a timestamp.
		 *          All API keys and secrets associated with this connection are immediately and permanently deleted
		 *          from Bluvo's secure storage.
		 *
		 * @example
		 * // Remove a wallet connection that's no longer needed
		 * await client.wallet.delete('old-trading-account');
		 *
		 * // You can also handle the confirmation response if needed
		 * const result = await client.wallet.delete('temporary-connection');
		 * console.log(`Wallet deleted at: ${new Date(result.timestamp).toLocaleString()}`);
		 */

		delete: async (walletId: string) => {
			const response = await walletdelete({
				client: this.client,
				headers: {
					"x-bluvo-wallet-id": walletId,
				},
			});
			return transformResponse(response);
		},

		/**
		 * Retrieve a comprehensive, paginated list of all exchange wallets connected to your Bluvo project with powerful filtering options.
		 *
		 * This method provides a complete overview of all your integrated exchange accounts, making it easy to manage multiple
		 * connections across different exchanges or for different purposes. Results are paginated to handle large numbers of
		 * connections efficiently, with flexible page size configuration.
		 *
		 * Each wallet entry includes essential information like connection status, exchange type, and last activity timestamp,
		 * giving you a quick overview without needing to query each wallet individually. For detailed information about a specific
		 * wallet, use the `get` method with the wallet's ID.
		 *
		 * @param page Optional pagination control parameter (0-indexed). Defaults to 0 (first page).
		 *             Use this parameter in combination with the `limit` parameter to navigate through large result sets.
		 *             For example, page=1 with limit=50 will return wallets 51-100.
		 *
		 * @param limit Optional maximum number of wallet records to return per page. Defaults to 10.
		 *              Can be increased up to 1000 for retrieving larger batches in a single request.
		 *              Larger values reduce the number of API calls needed but increase response size.
		 *
		 * @param exchange Optional filter to retrieve wallets from a specific exchange only.
		 *                 Supports major exchanges including 'binance', 'coinbase', 'kraken', 'kucoin', and 'okx'.
		 *                 When omitted, wallets from all exchanges are returned.
		 *
		 * @returns A promise resolving to a paginated list response containing:
		 *          - Array of wallet objects with their connection details
		 *          - Pagination metadata (total count, current page, total pages)
		 *          - Navigation links for next/previous pages when applicable
		 *
		 * @example
		 * // List all connected wallets with default pagination (10 per page)
		 * const allWallets = await client.wallet.list();
		 *
		 * // Get the second page of results with 20 wallets per page
		 * const page2 = await client.wallet.list(1, 20);
		 *
		 * // Get only Binance wallets
		 * const binanceWallets = await client.wallet.list(0, 50, 'binance');
		 * console.log(`Found ${binanceWallets.pagination.total} Binance connections`);
		 */

		list: async (
			page?: Required<WalletlistlistwalletsData>["query"]["page"],
			limit?: Required<WalletlistlistwalletsData>["query"]["limit"],
			exchange?: Required<WalletlistlistwalletsData>["query"]["exchange"],
		) => {
			const response = await walletlistlistwallets({
				client: this.client,
				query: {
					page,
					limit,
					exchange,
				},
			});
			return transformResponse(response);
		},

		transaction: {
			/**
			 * Retrieve a comprehensive, paginated list of all transactions for a specific wallet with powerful filtering capabilities.
			 *
			 * This method provides detailed visibility into the complete transaction history of a connected exchange wallet,
			 * including deposits, withdrawals, trades, and internal transfers. The flexible filtering system allows you to precisely
			 * target specific transaction types, assets, date ranges, or statuses to streamline your analysis and reporting.
			 *
			 * Transaction data is normalized across different exchanges into a consistent format, making it easy to work with
			 * multiple exchange integrations using the same code. Each transaction includes timestamps, amounts, fees, status
			 * information, and exchange-specific details when available.
			 *
			 * @param walletId The unique identifier of the connected wallet whose transactions you want to retrieve.
			 *                 This must be a valid wallet ID that was previously connected via the `connect` method.
			 *
			 * @param page Optional pagination control parameter (0-indexed). Defaults to 0 (first page).
			 *             Use this parameter with the `limit` parameter to navigate through large transaction histories.
			 *
			 * @param limit Optional maximum number of transaction records to return per page. Defaults to a platform-specific value.
			 *              Increasing this value reduces the number of API calls needed for large datasets but increases response size.
			 *
			 * @param asset Optional filter to retrieve transactions for a specific cryptocurrency only (e.g., 'BTC', 'ETH').
			 *              When omitted, transactions for all assets are returned.
			 *
			 * @param type Optional filter for transaction type. Common values include:
			 *            - 'deposit': Funds received into the exchange account
			 *            - 'withdrawal': Funds sent out from the exchange account
			 *            - 'trade': Exchange between different cryptocurrencies
			 *            - 'transfer': Internal movement between sub-accounts or wallets
			 *            - 'fee': Exchange fees charged
			 *            - 'rebate': Fee rebates or rewards received
			 *
			 * @param since Optional filter for transactions after a specific timestamp (ISO 8601 format or UNIX timestamp).
			 *              Use this to set the starting point of your transaction history query.
			 *
			 * @param before Optional filter for transactions before a specific timestamp (ISO 8601 format or UNIX timestamp).
			 *               Use this to set the ending point of your transaction history query.
			 *
			 * @param status Optional filter for transaction status. Common values include:
			 *               - 'completed': Fully processed and confirmed transactions
			 *               - 'pending': Transactions that are still being processed
			 *               - 'failed': Transactions that encountered errors
			 *               - 'cancelled': Transactions that were cancelled
			 *
			 * @param fields Optional comma-separated list of specific fields to include in the response.
			 *               This can optimize response size when you only need specific transaction attributes.
			 *
			 * @returns A promise resolving to a paginated transaction list containing:
			 *          - Array of normalized transaction objects with detailed information
			 *          - Pagination metadata (total count, current page, total pages)
			 *          - Navigation links for next/previous pages when applicable
			 *
			 * @example
			 * // Get all BTC transactions for a wallet
			 * const btcTx = await client.wallet.transaction.list('my-exchange-wallet', 0, 100, 'BTC');
			 *
			 * // Get only completed withdrawals in a date range
			 * const withdrawals = await client.wallet.transaction.list(
			 *   'my-exchange-wallet',
			 *   0,
			 *   50,
			 *   undefined,
			 *   'withdrawal',
			 *   '2023-01-01T00:00:00Z',
			 *   '2023-12-31T23:59:59Z',
			 *   'completed'
			 * );
			 */

			list: async (
				walletId?: Required<WallettransactionslisttransactionsData>["query"]["walletId"],
				page?: Required<WallettransactionslisttransactionsData>["query"]["page"],
				limit?: Required<WallettransactionslisttransactionsData>["query"]["limit"],
				sinceDate?: Required<WallettransactionslisttransactionsData>["query"]["sinceDate"],
			) => {
				const response = await wallettransactionslisttransactions({
					client: this.client,
					query: {
						walletId,
						page,
						limit,
						sinceDate,
					},
					headers: {
						"x-bluvo-wallet-id": walletId,
					},
				});
				return transformResponse(response);
			},
		},

		withdrawals: {
			getWithdrawableBalance: async (
				walletId: string,
				query?: WalletwithdrawbalancebalanceData["query"],
			) => {
				const response = await walletwithdrawbalancebalance({
					client: this.client,
					query,
					headers: {
						"x-bluvo-wallet-id": walletId,
					},
				});
				return transformResponse(response);
			},

			// request a quotation
			requestQuotation: async (
				walletId: string,
				body: WalletwithdrawquotequotationData["body"],
			) => {
				const response = await walletwithdrawquotequotation({
					client: this.client,
					headers: {
						"x-bluvo-wallet-id": walletId,
					},
					body,
				});
				return transformResponse(response);
			},

			// give a quotation ID, execute the withdrawal
			executeWithdrawal: async (
				walletId: string,
				idem: string,
				quotationId: string,
				args: WalletwithdrawquoteidexecutewithdrawData["body"],
				// enforce legacy type for backwards compatibility
			): Promise<WalletwithdrawquoteidexecutewithdrawResponse> => {
				const response = await walletwithdrawquoteidexecutewithdraw({
					client: this.client,
					path: {
						quoteId: quotationId,
					},
					headers: {
						"x-bluvo-wallet-id": walletId,
					},
					body: args,
				}).then(transformResponse);

				const data = response.data;
				// we need to reconsile data object that has shape like this:
				// {
				//     success: boolean;
				//     error?: string;
				//     type?: TypeEnum2;
				//     result?: unknown;
				// }
				const success = data?.success ?? response.success ?? false;
				const error = data?.error ?? response.error?.error;
				const type = data?.type ?? response.error?.type;
				const result = data?.result;

				return {
					success,
					error,
					type,
					result,
				};
			},
		},
	};

	oauth2 = {
		getLink: async (
			exchange: Oauth2ExchangeurlgeturlData["path"]["exchange"],
			walletId: string,
			idem: string,
		) => {
			const response = await oauth2Exchangeurlgeturl({
				client: this.client,
				path: {
					exchange,
				},
				headers: {
					"x-bluvo-wallet-id": walletId,
				},
				query: {
					idem,
				},
			});
			return transformResponse(response);
		},

		listExchanges: async (
			status?: Oauth2ExchangeslistexchangesResponses["200"]["exchanges"][number]["status"],
		) => {
			const response = await oauth2Exchangeslistexchanges({});
			const exchanges =
				response?.data?.exchanges?.filter((r) => r.status === status) || [];
			return exchanges;
		},
	};
}
