import {
    createConfiguration, OAuth2Api,
    PromiseConfigurationOptions, server1, server2,
    ServerConfiguration,
    WalletsApi, WithdrawalsApi,
} from "../generated";

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
     * @param sandbox
     * @param dev
     * @private Use the static `createClient` method or the global `createClient` function instead.
     */
    private constructor(
        private readonly orgId: string,
        private readonly projectId: string,
        private readonly apiKey: string,
        private readonly sandbox: boolean = false,
        private readonly dev: boolean = false
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
    static createClient({orgId, projectId, apiKey, sandbox,dev}: { orgId: string; projectId: string; apiKey: string, sandbox?: boolean, dev?: boolean }) {
        return new BluvoClient(
            orgId,
            projectId,
            apiKey,
            sandbox,
            dev
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

        get: (walletId: string, _options?: PromiseConfigurationOptions) => {
            return new WalletsApi(this.configuration(walletId))
                .walletget(_options);
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
                .walletdelete(_options);
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
                .walletlistlistwallets(page, limit, exchange as any, undefined, undefined, undefined, undefined, undefined, undefined, _options);
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

            list: (
                walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: PromiseConfigurationOptions
            ) => {
                return new WalletsApi(this.configuration(walletId))
                    .wallettransactionslisttransactions(
                        walletId, page, limit, sinceDate, _options
                    );
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

            // withdraw: ({
            //                quoteId,
            //                walletId,
            //                destinationAddress,
            //                amount,
            //                asset,
            //                network,
            //                tag
            //            }: {
            //     quoteId: string;
            //     walletId: string;
            //     destinationAddress: string;
            //     amount: string | number;
            //     asset: string;
            //     network?: string;
            //     tag?: string;
            // }, _options?: PromiseConfigurationOptions) => {
            //     return new WithdrawalsApi(this.configuration(walletId))
            //         .walletwithdrawquoteidexecutewithdraw(
            //             quoteId,
            //             {
            //                 asset,
            //                 amount: typeof amount === 'string' ? parseFloat(amount) : amount,
            //                 address: destinationAddress,
            //                 tag,
            //                 params: {
            //                     network
            //                 }
            //             },
            //             _options
            //         );
            // }

        },

        withdrawals: {

            getWithdrawableBalance: (walletId: string) => {
                return new WithdrawalsApi(this.configuration(walletId))
                    .walletwithdrawbalancebalance();
            },

            // request a quotation
            requestQuotation: (walletId: string, body: {
                asset: string;
                amount: string;
                address: string;
                tag?: string;
                network?: string;
                includeFee?: boolean;
            }) => {
                return new WithdrawalsApi(this.configuration(walletId))
                    .walletwithdrawquotequotation({
                        asset: body.asset,
                        amount: body.amount,
                        address: body.address,
                        tag: body.tag,
                        network: body.network,
                        includeFee: body.includeFee ?? true,
                    });
            },

            // give a quotation ID, execute the withdrawal
            executeWithdrawal: (
                walletId: string,
                idem: string,
                quotationId: string,
                args?: {
                    twofa?: string;
                }
            ) => {
                return new WithdrawalsApi(this.configuration(walletId))
                    .walletwithdrawquoteidexecutewithdraw(
                        quotationId,
                        {
                            twofa: args?.twofa!,
                        }
                    );
            }
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
                .oauth2exchangeurlgeturl(exchange, idem!, _options)
        },

        listExchanges: async (
            status?: 'live' | 'offline' | 'maintenance' | 'coming_soon',
        ) => {
            const res = await new OAuth2Api(this.configuration())
                .oauth2exchangeslistexchanges();
            if (res?.exchanges) {
                if(!!status) {
                    return res
                        .exchanges
                        .filter(r=>r.status === status);
                }
                return res
                    .exchanges;
            }
            return [];
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

        const serverDev = new ServerConfiguration<{  }>("http://localhost:8787", {  })

        const baseServer = this.sandbox ?
            server2 :
            this.dev ? serverDev : server1;

        // TODO: delete concept of OTT at all
        if(!!ott) {
            return createConfiguration({

                baseServer: baseServer,

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
            baseServer: baseServer,

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