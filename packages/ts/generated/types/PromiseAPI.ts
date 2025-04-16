import {HttpInfo} from '../http/http';
import {Configuration, PromiseConfigurationOptions, wrapOptions} from '../configuration'

import {Asset200Response} from '../models/Asset200Response';
import {ConnectWallet200Response} from '../models/ConnectWallet200Response';
import {ConnectWalletRequest} from '../models/ConnectWalletRequest';
import {DeleteWallet200Response} from '../models/DeleteWallet200Response';
import {GetWallet200Response} from '../models/GetWallet200Response';
import {GetWorkflow200Response} from '../models/GetWorkflow200Response';
import {ListAssets200Response} from '../models/ListAssets200Response';
import {ListPairs200Response} from '../models/ListPairs200Response';
import {ListWallets200Response} from '../models/ListWallets200Response';
import {ObservableBasicApi, ObservablePricesApi, ObservableWalletsApi, ObservableWorkflowApi} from './ObservableAPI';

import {BasicApiRequestFactory, BasicApiResponseProcessor} from "../apis/BasicApi";

import {PricesApiRequestFactory, PricesApiResponseProcessor} from "../apis/PricesApi";

import {WalletsApiRequestFactory, WalletsApiResponseProcessor} from "../apis/WalletsApi";

import {WorkflowApiRequestFactory, WorkflowApiResponseProcessor} from "../apis/WorkflowApi";

export class PromiseBasicApi {
    private api: ObservableBasicApi

    public constructor(
        configuration: Configuration,
        requestFactory?: BasicApiRequestFactory,
        responseProcessor?: BasicApiResponseProcessor
    ) {
        this.api = new ObservableBasicApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param asset The asset symbol to query (e.g. BTC, ETH).
     * @param [img] Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant).
     */
    public assetWithHttpInfo(asset: string, img?: 'false' | '32' | '64' | '128', _options?: PromiseConfigurationOptions): Promise<HttpInfo<Asset200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.assetWithHttpInfo(asset, img, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param asset The asset symbol to query (e.g. BTC, ETH).
     * @param [img] Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant).
     */
    public asset(asset: string, img?: 'false' | '32' | '64' | '128', _options?: PromiseConfigurationOptions): Promise<Asset200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.asset(asset, img, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param [img] Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant).
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of assets to return per page. Defaults to 100.
     */
    public listAssetsWithHttpInfo(img?: 'false' | '32' | '64' | '128', page?: number, limit?: number, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ListAssets200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listAssetsWithHttpInfo(img, page, limit, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param [img] Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant).
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of assets to return per page. Defaults to 100.
     */
    public listAssets(img?: 'false' | '32' | '64' | '128', page?: number, limit?: number, _options?: PromiseConfigurationOptions): Promise<ListAssets200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listAssets(img, page, limit, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param exchange The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     */
    public listPairsWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', _options?: PromiseConfigurationOptions): Promise<HttpInfo<ListPairs200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listPairsWithHttpInfo(exchange, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param exchange The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     */
    public listPairs(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', _options?: PromiseConfigurationOptions): Promise<ListPairs200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listPairs(exchange, observableOptions);
        return result.toPromise();
    }


}


export class PromisePricesApi {
    private api: ObservablePricesApi

    public constructor(
        configuration: Configuration,
        requestFactory?: PricesApiRequestFactory,
        responseProcessor?: PricesApiResponseProcessor
    ) {
        this.api = new ObservablePricesApi(configuration, requestFactory, responseProcessor);
    }

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
    public candlesticksWithHttpInfo(asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: PromiseConfigurationOptions): Promise<HttpInfo<Array<Array<any>>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.candlesticksWithHttpInfo(asset, quote, since, until, exchange, granularity, observableOptions);
        return result.toPromise();
    }

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
    public candlesticks(asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: PromiseConfigurationOptions): Promise<Array<Array<any>>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.candlesticks(asset, quote, since, until, exchange, granularity, observableOptions);
        return result.toPromise();
    }


}


export class PromiseWalletsApi {
    private api: ObservableWalletsApi

    public constructor(
        configuration: Configuration,
        requestFactory?: WalletsApiRequestFactory,
        responseProcessor?: WalletsApiResponseProcessor
    ) {
        this.api = new ObservableWalletsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param connectWalletRequest
     */
    public connectWalletWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', connectWalletRequest: ConnectWalletRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ConnectWallet200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.connectWalletWithHttpInfo(exchange, connectWalletRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param connectWalletRequest
     */
    public connectWallet(exchange: 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'okx' | string, connectWalletRequest: ConnectWalletRequest, _options?: PromiseConfigurationOptions): Promise<ConnectWallet200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.connectWallet(exchange as any, connectWalletRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param walletId The unique identifier of the connected wallet to delete.
     */
    public deleteWalletWithHttpInfo(walletId: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<DeleteWallet200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.deleteWalletWithHttpInfo(walletId, observableOptions);
        return result.toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param walletId The unique identifier of the connected wallet to delete.
     */
    public deleteWallet(walletId: string, _options?: PromiseConfigurationOptions): Promise<DeleteWallet200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.deleteWallet(walletId, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param walletId The unique identifier of the connected wallet to query.
     */
    public getWalletWithHttpInfo(walletId: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<GetWallet200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.getWalletWithHttpInfo(walletId, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param walletId The unique identifier of the connected wallet to query.
     */
    public getWallet(walletId: string, _options?: PromiseConfigurationOptions): Promise<GetWallet200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.getWallet(walletId, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
     * @param [exchange] Optional. Filter wallets by exchange.
     * @param [createdSince] Optional. Filter wallets created on or after this date (ISO format).
     * @param [createdBefore] Optional. Filter wallets created before this date (ISO format).
     * @param [lastSyncSince] Optional. Filter wallets synchronized on or after this date (ISO format).
     * @param [lastSyncBefore] Optional. Filter wallets synchronized before this date (ISO format).
     * @param [invalidApi] Optional. Filter wallets by API validity status.
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public listWalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<ListWallets200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listWalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
     * @param [exchange] Optional. Filter wallets by exchange.
     * @param [createdSince] Optional. Filter wallets created on or after this date (ISO format).
     * @param [createdBefore] Optional. Filter wallets created before this date (ISO format).
     * @param [lastSyncSince] Optional. Filter wallets synchronized on or after this date (ISO format).
     * @param [lastSyncBefore] Optional. Filter wallets synchronized before this date (ISO format).
     * @param [invalidApi] Optional. Filter wallets by API validity status.
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public listWallets(page?: number, limit?: number, exchange?: 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'okx' | string, createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: PromiseConfigurationOptions): Promise<ListWallets200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.listWallets(page, limit, exchange as any, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
        return result.toPromise();
    }


}


export class PromiseWorkflowApi {
    private api: ObservableWorkflowApi

    public constructor(
        configuration: Configuration,
        requestFactory?: WorkflowApiRequestFactory,
        responseProcessor?: WorkflowApiResponseProcessor
    ) {
        this.api = new ObservableWorkflowApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param workflowRunId The unique identifier of the workflow run to query.
     */
    public getWorkflowWithHttpInfo(workflowRunId: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<GetWorkflow200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.getWorkflowWithHttpInfo(workflowRunId, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param workflowRunId The unique identifier of the workflow run to query.
     */
    public getWorkflow(workflowRunId: string, _options?: PromiseConfigurationOptions): Promise<GetWorkflow200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.getWorkflow(workflowRunId, observableOptions);
        return result.toPromise();
    }


}



