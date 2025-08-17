import {
    ConnectWalletRequest, createConfiguration, OAuth2Api, OneTimeTokenApi,
    PricesApi,
    PromiseConfigurationOptions,
    TransactionsApi,
    WalletsApi,
    WorkflowApi
} from "../generated";

type SupportedExchanges = 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'

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

    /**
     * Creates a new BluvoClient instance with the specified credentials.
     *
     * @param orgId Your Bluvo organization identifier.
     * @param projectId Your Bluvo project identifier.
     * @param apiKey Your Bluvo API access key.
     * @private Use the static `createClient` method or the global `createClient` function instead.
     */
    private constructor(
        private readonly orgId: string,
        private readonly projectId: string,
        private readonly apiKey: string,
    ) {
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
     *
     * @returns A fully configured BluvoClient instance ready for use.
     */
    static createClient({orgId, projectId, apiKey}: { orgId: string; projectId: string; apiKey: string }) {
        return new BluvoClient(
            orgId,
            projectId,
            apiKey
        );
    }

    prices = {

        /**
         * Fetch comprehensive historical candlestick (OHLCV) data across multiple exchanges with powerful filtering capabilities.
         *
         * This powerful method provides access to high-quality, normalized candlestick data that can be used for technical analysis,
         * backtesting trading strategies, building custom charting interfaces, or powering algorithmic trading systems. The data
         * is collected from reliable exchange APIs and normalized into a consistent format regardless of the source exchange.
         *
         * Candlestick data includes open, high, low, close prices and volume (OHLCV) for each time interval, enabling
         * comprehensive market analysis and visualization. Data is provided in chronological order with precise timestamps.
         *
         * @param asset The cryptocurrency asset symbol to retrieve data for (e.g., 'BTC', 'ETH', 'SOL').
         *              Case-insensitive and supports all major cryptocurrencies and many altcoins.
         * @param quote The quote currency used in the trading pair, currently supporting 'USDT' as the standard quote currency
         *             for maximum data availability and consistency across exchanges.
         * @param [since] Optional timestamp (UNIX milliseconds) marking the beginning of the requested data range.
         *                If omitted, returns data starting from the earliest available record, subject to other constraints.
         * @param [until] Optional timestamp (UNIX milliseconds) marking the end of the requested data range.
         *                If omitted, returns data up to the most recent available record, subject to other constraints.
         * @param [exchange] Optional exchange identifier to source data from a specific platform. Defaults to 'binance'.
         *                   Supported exchanges include major platforms like Binance, Bitget, Bitmart, Bybit, Coinbase,
         *                   Crypto.com, Gate.io, Kraken, KuCoin, and OKX.
         * @param [granularity] Optional time interval for each candlestick, allowing different time-frame analysis.
         *                       Currently defaults to '1h' (1 hour intervals). Supported values include:
         *                       - '1m': 1 minute (highest resolution, suitable for short-term trading)
         *                       - '15m': 15 minutes
         *                       - '30m': 30 minutes
         *                       - '1h': 1 hour (default, balanced between detail and range)
         *                       - '4h': 4 hours
         *                       - '1d': 1 day (best for long-term trend analysis)
         *
         * @returns A promise resolving to an array of candlestick objects, each containing timestamp, open, high, low, close prices,
         *          and volume data in a consistent format regardless of the source exchange.
         *
         * @example
         * // Fetch hourly BTC/USDT candlesticks from Binance for the last 7 days
         * const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
         * const candlesticks = await client.prices.candlesticks('BTC', 'USDT', sevenDaysAgo);
         *
         * // Fetch daily ETH/USDT candlesticks from Coinbase for a specific date range
         * const startDate = new Date('2023-01-01').getTime();
         * const endDate = new Date('2023-12-31').getTime();
         * const dailyCandles = await client.prices.candlesticks('ETH', 'USDT', startDate, endDate, 'coinbase', '1d');
         */
        candlesticks: (asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: PromiseConfigurationOptions) => {
            return new PricesApi(this.configuration())
                .candlesticks(asset, quote, since, until, exchange, granularity, _options);
        }
    }

    wallet = {
        /**
         * Seamlessly connect an external cryptocurrency exchange account to your Bluvo project, enabling secure API-level
         * access for automated trading, portfolio tracking, and exchange integrations.
         *
         * This method securely stores your exchange credentials and establishes a persistent connection that maintains
         * synchronization between your Bluvo project and the exchange account. All credentials are encrypted at rest
         * and in transit using industry-standard encryption protocols.
         *
         * @param exchange The identifier of the exchange to connect (e.g. 'binance', 'kraken'). Supports major exchanges
         *                 including Binance, Coinbase, Kraken, Kucoin, and OKX with consistent API interfaces across all platforms.
         * @param walletId A unique identifier for this wallet connection within your project. Use a descriptive ID that helps
         *                 you easily identify this particular connection in your application logic.
         * @param request
         * @param _options
         *               the operations you intend to perform (e.g., read-only for portfolio tracking, trading permissions for order execution).
         *                  encryption on Bluvo servers.
         *                      Consult your specific exchange's API documentation for requirements.
         *               Refer to the exchange-specific documentation to determine if this is needed.
         *
         * @returns A promise that resolves to a confirmation object with connection status and wallet details.
         *
         * @example
         * // Connect a Binance account
         * const connection = await client.wallet.connect(
         *   'binance',
         *   'primary-trading-account',
         *   'your-api-key',
         *   'your-api-secret'
         * );
         */
        connect: (
            exchange: SupportedExchanges | string,
            walletId: string,
            idem: string,
            request: ConnectWalletRequest,
            _options?: PromiseConfigurationOptions
        ) => {
            return new WalletsApi(this.configuration(walletId, undefined, idem))
                .connectWallet(
                    exchange as any,
                    idem,
                    request,
                    _options
                );
        },

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

        get: (walletId: string, _options?: PromiseConfigurationOptions) => {
            return new WalletsApi(this.configuration(walletId))
                .getWallet(_options);
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

        delete: (walletId: string, _options?: PromiseConfigurationOptions) => {
            return new WalletsApi(this.configuration(walletId))
                .deleteWallet(_options);
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

        list: (
            page?: number,
            limit?: number,
            exchange?: 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'okx' | string,
            _options?: PromiseConfigurationOptions
        ) => {
            return new WalletsApi(this.configuration())
                .listWallets(page, limit, exchange as any, undefined, undefined, undefined, undefined, undefined, undefined, _options);
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

            list: (walletId: string, page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: PromiseConfigurationOptions) => {
                return new TransactionsApi(this.configuration(walletId))
                    .listTransactions(page, limit, asset, type, since, before, status, fields, _options);
            },

            /**
             * Securely withdraw cryptocurrency from a connected exchange wallet to any external blockchain address with
             * comprehensive validation and confirmation capabilities.
             *
             * This powerful method enables programmatic withdrawals from exchange accounts via their API, with multiple
             * safety features including address validation, network selection, and optional destination tags for platforms
             * that require them. The withdrawal process is handled securely through the exchange's official API using your
             * connected API credentials, which must have withdrawal permissions enabled.
             *
             * For maximum security, each withdrawal request undergoes multiple validation checks before submission:
             * - Asset and network compatibility verification
             * - Address format validation for the specified network
             * - Sufficient balance confirmation
             * - Withdrawal limit compliance
             *
             * @param withdrawalDetails An object containing all details needed for the withdrawal:
             *   @param sourceWalletId The unique identifier of the wallet to withdraw from. Must be a valid, connected
             *                         exchange wallet with sufficient balance and withdrawal permissions enabled.
             *   @param destinationAddress The blockchain address to send funds to. Must be a valid address format for the
             *                            selected asset and network. Always double-check this value for accuracy.
             *   @param amount The precise amount to withdraw. Must be a string or number representing the amount in the
             *                 asset's base units (e.g., BTC amount in BTC, not satoshis).
             *   @param asset The cryptocurrency asset code to withdraw (e.g., 'BTC', 'ETH', 'USDT').
             *                Must be supported by the exchange and available in your wallet.
             *   @param network Optional blockchain network to use for assets that exist on multiple networks (e.g., 'ERC20',
             *                  'TRC20', 'BEP20' for USDT). If omitted, the exchange default network will be used.
             *   @param tag Optional destination tag/memo required by some blockchains (e.g., XRP, XLM, EOS) or exchanges.
             *              Critical for deposits to exchanges and certain wallets.
             *
             * @returns A promise resolving to a withdrawal confirmation object containing:
             *          - Transaction ID assigned by the exchange
             *          - Withdrawal status (usually 'pending' initially)
             *          - Timestamp of the withdrawal request
             *          - Fee charged by the exchange (when available)
             *          - Estimated completion time (when available)
             *
             * @example
             * // Withdraw Bitcoin to an external wallet
             * const withdrawal = await client.wallet.transaction.withdraw({
             *   sourceWalletId: 'my-exchange-wallet',
             *   destinationAddress: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
             *   amount: '0.05',
             *   asset: 'BTC'
             * });
             *
             * // Withdraw USDT on the Tron network with a memo
             * const usdtWithdrawal = await client.wallet.transaction.withdraw({
             *   sourceWalletId: 'my-exchange-wallet',
             *   destinationAddress: 'TJYeasTPa6gpEEsQiGNh1XBVnhPx5dTRVv',
             *   amount: '100',
             *   asset: 'USDT',
             *   network: 'TRC20',
             *   tag: '123456'
             * });
             */

            withdraw: ({
                           walletId,
                           destinationAddress,
                           amount,
                           asset,
                           network,
                           tag
                       }: {
                walletId: string;
                destinationAddress: string;
                amount: string | number;
                asset: string;
                network?: string;
                tag?: string;
            }, _options?: PromiseConfigurationOptions) => {
                return new TransactionsApi(this.configuration(walletId))
                    .withdrawFunds(
                        {
                            asset,
                            amount: typeof amount === 'string' ? parseFloat(amount) : amount,
                            address: destinationAddress,
                            tag,
                            params: {
                                network
                            }
                        },
                        _options
                    );
            }

        }
    }

    workflow = {
        get: (
            workflowRunId: string,
            workflowType: "connect" | "withdraw" | "oauth2",
            _options?: PromiseConfigurationOptions) => {
            return new WorkflowApi(this.configuration())
                .getWorkflow(
                    workflowRunId,
                    workflowType,
                )
        }
    }


    oauth2 = {
        getLink : (
            exchange: 'coinbase' | 'kraken',
            walletId?: string,
            idem?: string,
            _options?: PromiseConfigurationOptions
        ) => {
            return new OAuth2Api(this.configuration(walletId, undefined, idem))
                .oAuth2Link(exchange, idem!, _options)
        }
    }

    ott = {


        /**
         * Retrieve a one-time token (OTT) for secure, temporary access to Bluvo's API services.
         *
         * This method generates a one-time token that can be used to authenticate API requests without exposing your
         * permanent API key. The token is valid for a limited time and can be used to perform specific actions like
         * subscribing to services or accessing sensitive data.
         *
         * @param walletId Optional wallet identifier to scope the OTT to a specific wallet connection.
         *                 If provided, the OTT will be tied to this wallet's permissions and access.
         * @param wantOtt Optional flag indicating whether to generate a new OTT token. Defaults to true.
         * @param wantSubscribe Optional flag indicating whether to subscribe the OTT for future use. Defaults to false.
         *
         * @returns A promise resolving to an object containing the generated OTT token and its expiration details.
         */
        get: (
            walletId?: string,
        ) => {
            return new OneTimeTokenApi(this.configuration(walletId))
                .getOTTToken(
                    "true",
                    "false",
                )
        },

        getWithSubscribe: (
            walletId?: string,
        ) => {
            return new OneTimeTokenApi(this.configuration(walletId))
                .getOTTToken(
                    "true",
                    "true",
                )
        },

        connect: (
            {
                exchange,
                walletId,
                idem,
                ott
            }: {
                exchange: SupportedExchanges | string;
                walletId: string;
                idem: string;
                ott: string;
            },
            request: ConnectWalletRequest,
            _options?: PromiseConfigurationOptions
        ) => {
            return new OneTimeTokenApi(this.configuration(walletId, ott, idem))
                .connectWalletOTT(
                    exchange as any,
                    idem,
                    request,
                    _options
                )
        }
    }

    /**
     * Creates and returns a properly configured API client configuration object.
     *
     * This private getter method centralizes the creation of API configuration objects,
     * ensuring consistent authentication and request handling across all API calls made
     * through this client. It automatically injects the organization ID and API key
     * credentials that were provided when the client was initialized.
     *
     * The configuration includes:
     * - Authentication credentials for the Bluvo API
     * - Request middleware setup
     * - Response handling configuration
     * - Base URL and endpoint configuration
     *
     * @private
     * @returns A fully configured API configuration object ready for use with API clients
     */
    private configuration(walletId?:string, ott?:string, idem?:string) {
        if(!!ott) {
            return createConfiguration({
                // baseServer: server2, // test
                // baseServer: new ServerConfiguration<{  }>("http://localhost:8787", {  }),

                authMethods: {
                    bluvoOtt: ott,

                    bluvoOrgId: this.orgId,
                    bluvoProjectId: this.projectId,
                    bluvoWalletId: walletId,
                    bluvoOttActionId: idem,
                },
            });
        }


        return createConfiguration({
            authMethods: {
                bluvoApiKey: this.apiKey,
                bluvoOrgId: this.orgId,
                bluvoProjectId: this.projectId,
                bluvoWalletId: walletId,
                bluvoOttActionId: idem,
            }
        });
    }
}