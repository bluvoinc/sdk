import {
    ConnectWalletRequest,
    createConfiguration,
    PricesApi,
    PromiseConfigurationOptions,
    WalletsApi
} from "./generated";

export function createClient(
    {orgId,projectId, apiKey}: { orgId: string; projectId: string; apiKey: string }
) {
    return BluvoClient.createClient({orgId,projectId, apiKey});
}

export class BluvoClient {

    private constructor(
        private readonly orgId: string,
        private readonly projectId: string,
        private readonly apiKey: string,
    ) {}

    static createClient({orgId, projectId, apiKey}: { orgId: string; projectId: string; apiKey: string }) {
        return new BluvoClient(
            orgId,
            projectId,
            apiKey
        );
    }

    prices = {

        /**
         * Fetch historical candlestick (OHLCV) data for a given asset and quote currency. You may optionally filter the data using query parameters: \'since\' and \'until\' for the time range, \'exchange\' to specify the data source, and \'granularity\' to set the time interval for each candlestick.
         * Candlesticks
         * @param asset The asset symbol to retrieve candlestick data for (e.g. BTC, ETH).
         * @param quote The quote currency used in the trading pair (e.g. USDT).
         * @param [since] Optional. The start timestamp (in UNIX milliseconds) for the candlestick data range.
         * @param [until] Optional. The end timestamp (in UNIX milliseconds) for the candlestick data range.
         * @param [exchange] Optional. The exchange from which to retrieve candlestick data. Defaults to \&#39;binance\&#39;.
         * @param [granularity] Optional. The time interval for each candlestick. Allowed values include \&#39;1m\&#39;, \&#39;15m\&#39;, \&#39;30m\&#39;, \&#39;1h\&#39;, \&#39;4h\&#39;, \&#39;1d\&#39;.
         */
        candlesticks: (asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: PromiseConfigurationOptions) => {
            return new PricesApi(this.configuration)
                .candlesticks(asset,quote,since,until,exchange,granularity,_options);
        }
    }

    wallet = {
        /**
         * Connect an external cryptocurrency exchange account to your Bluvo project.
         * @param exchange The identifier of the exchange to connect (e.g. 'binance', 'kraken').
         * @param walletId Wallet ID within the project
         * @param apiKey API key for the exchange account
         * @param apiSecret API secret for the exchange account
         * @param apiPassphrase Optional. API passphrase (required for some exchanges like Kuasset)
         * @param apiUid Optional. API user ID (required for some exchanges)
         */
        connect: (
            exchange: 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'okx' | string,
            walletId: string,
            apiKey: string,
            apiSecret: string,
            apiPassphrase?: string,
            apiUid?: string,
            _options?: PromiseConfigurationOptions
        ) => {
            const request: ConnectWalletRequest = {
                projectId: this.projectId,
                walletId,
                apiKey,
                apiSecret,
                apiPassphrase,
                apiUid
            };
            return new WalletsApi(this.configuration)
                .connectWallet(exchange, request, _options);
        },

        /**
         * Retrieve basic information about a connected exchange wallet.
         * @param walletId The unique identifier of the connected wallet to query.
         */
        get: (walletId: string, _options?: PromiseConfigurationOptions) => {
            return new WalletsApi(this.configuration)
                .getWallet(walletId, _options);
        },

        /**
         * Delete a connected exchange wallet.
         * @param walletId The unique identifier of the connected wallet to delete.
         */
        delete: (walletId: string, _options?: PromiseConfigurationOptions) => {
            return new WalletsApi(this.configuration)
                .deleteWallet(walletId, _options);
        },

        /**
         * Retrieve a paginated list of connected exchange wallets.
         * @param page Optional. Page number for pagination (0-indexed). Defaults to 0.
         * @param limit Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
         * @param exchange Optional. Filter wallets by exchange.
         */
        list: (
            page?: number, 
            limit?: number, 
            exchange?: 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'okx' | string,
            _options?: PromiseConfigurationOptions
        ) => {
            return new WalletsApi(this.configuration)
                .listWallets(page, limit, exchange, undefined, undefined, undefined, undefined, undefined, undefined, _options);
        }
    }

    private get configuration() {
        return createConfiguration({
            authMethods: {
                bluvoApiKey: this.apiKey,
                bluvoOrgId: this.orgId,
            }
        });
    }
}