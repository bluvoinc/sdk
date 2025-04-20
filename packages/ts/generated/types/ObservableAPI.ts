import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions, mergeConfiguration } from '../configuration'
import type { Middleware } from '../middleware';
import { Observable, of, from } from '../rxjsStub';
import {mergeMap, map} from  '../rxjsStub';
import { Asset200Response } from '../models/Asset200Response';
import { Asset200ResponseAssetsInner } from '../models/Asset200ResponseAssetsInner';
import { ConnectWallet200Response } from '../models/ConnectWallet200Response';
import { ConnectWalletRequest } from '../models/ConnectWalletRequest';
import { DeleteWallet200Response } from '../models/DeleteWallet200Response';
import { GetWallet200Response } from '../models/GetWallet200Response';
import { GetWorkflow200Response } from '../models/GetWorkflow200Response';
import { GetWorkflow200ResponseStepsInner } from '../models/GetWorkflow200ResponseStepsInner';
import { ListAssets200Response } from '../models/ListAssets200Response';
import { ListAssets200ResponseAssetsInner } from '../models/ListAssets200ResponseAssetsInner';
import { ListPairs200Response } from '../models/ListPairs200Response';
import { ListWallets200Response } from '../models/ListWallets200Response';
import { ListWallets200ResponsePagination } from '../models/ListWallets200ResponsePagination';
import { ListWallets200ResponseWalletsInner } from '../models/ListWallets200ResponseWalletsInner';
import { WalletTransactions200Response } from '../models/WalletTransactions200Response';
import { WalletTransactions200ResponsePagination } from '../models/WalletTransactions200ResponsePagination';
import { WalletTransactions200ResponseTransactionsInner } from '../models/WalletTransactions200ResponseTransactionsInner';
import { WithdrawFunds200Response } from '../models/WithdrawFunds200Response';
import { WithdrawFundsRequest } from '../models/WithdrawFundsRequest';

import { BasicApiRequestFactory, BasicApiResponseProcessor} from "../apis/BasicApi";
export class ObservableBasicApi {
    private requestFactory: BasicApiRequestFactory;
    private responseProcessor: BasicApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: BasicApiRequestFactory,
        responseProcessor?: BasicApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new BasicApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new BasicApiResponseProcessor();
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param asset The asset symbol to query (e.g. BTC, ETH).
     * @param [img] Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant).
     */
    public assetWithHttpInfo(asset: string, img?: 'false' | '32' | '64' | '128', _options?: ConfigurationOptions): Observable<HttpInfo<Asset200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.asset(asset, img, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.assetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param asset The asset symbol to query (e.g. BTC, ETH).
     * @param [img] Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant).
     */
    public asset(asset: string, img?: 'false' | '32' | '64' | '128', _options?: ConfigurationOptions): Observable<Asset200Response> {
        return this.assetWithHttpInfo(asset, img, _options).pipe(map((apiResponse: HttpInfo<Asset200Response>) => apiResponse.data));
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param [img] Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant).
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of assets to return per page. Defaults to 100.
     */
    public listAssetsWithHttpInfo(img?: 'false' | '32' | '64' | '128', page?: number, limit?: number, _options?: ConfigurationOptions): Observable<HttpInfo<ListAssets200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.listAssets(img, page, limit, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.listAssetsWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param [img] Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant).
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of assets to return per page. Defaults to 100.
     */
    public listAssets(img?: 'false' | '32' | '64' | '128', page?: number, limit?: number, _options?: ConfigurationOptions): Observable<ListAssets200Response> {
        return this.listAssetsWithHttpInfo(img, page, limit, _options).pipe(map((apiResponse: HttpInfo<ListAssets200Response>) => apiResponse.data));
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param exchange The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     */
    public listPairsWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', _options?: ConfigurationOptions): Observable<HttpInfo<ListPairs200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.listPairs(exchange, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.listPairsWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param exchange The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     */
    public listPairs(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', _options?: ConfigurationOptions): Observable<ListPairs200Response> {
        return this.listPairsWithHttpInfo(exchange, _options).pipe(map((apiResponse: HttpInfo<ListPairs200Response>) => apiResponse.data));
    }

}

import { PricesApiRequestFactory, PricesApiResponseProcessor} from "../apis/PricesApi";
export class ObservablePricesApi {
    private requestFactory: PricesApiRequestFactory;
    private responseProcessor: PricesApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: PricesApiRequestFactory,
        responseProcessor?: PricesApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new PricesApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new PricesApiResponseProcessor();
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
    public candlesticksWithHttpInfo(asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: ConfigurationOptions): Observable<HttpInfo<Array<Array<any>>>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.candlesticks(asset, quote, since, until, exchange, granularity, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.candlesticksWithHttpInfo(rsp)));
            }));
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
    public candlesticks(asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: ConfigurationOptions): Observable<Array<Array<any>>> {
        return this.candlesticksWithHttpInfo(asset, quote, since, until, exchange, granularity, _options).pipe(map((apiResponse: HttpInfo<Array<Array<any>>>) => apiResponse.data));
    }

}

import { TransactionsApiRequestFactory, TransactionsApiResponseProcessor} from "../apis/TransactionsApi";
export class ObservableTransactionsApi {
    private requestFactory: TransactionsApiRequestFactory;
    private responseProcessor: TransactionsApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: TransactionsApiRequestFactory,
        responseProcessor?: TransactionsApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new TransactionsApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new TransactionsApiResponseProcessor();
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * Wallet Transactions
     * @param walletId The unique identifier of the connected wallet to query transactions for.
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param [asset] Optional. Filter transactions by asset symbol.
     * @param [type] Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param [since] Optional. Filter transactions created on or after this date (ISO format).
     * @param [before] Optional. Filter transactions created before this date (ISO format).
     * @param [status] Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public walletTransactionsWithHttpInfo(walletId: string, page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: ConfigurationOptions): Observable<HttpInfo<WalletTransactions200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletTransactions(walletId, page, limit, asset, type, since, before, status, fields, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletTransactionsWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * Wallet Transactions
     * @param walletId The unique identifier of the connected wallet to query transactions for.
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param [asset] Optional. Filter transactions by asset symbol.
     * @param [type] Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param [since] Optional. Filter transactions created on or after this date (ISO format).
     * @param [before] Optional. Filter transactions created before this date (ISO format).
     * @param [status] Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public walletTransactions(walletId: string, page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: ConfigurationOptions): Observable<WalletTransactions200Response> {
        return this.walletTransactionsWithHttpInfo(walletId, page, limit, asset, type, since, before, status, fields, _options).pipe(map((apiResponse: HttpInfo<WalletTransactions200Response>) => apiResponse.data));
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint requires authentication via a valid Bluvo API Key. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds
     * @param walletId The unique identifier of the wallet to withdraw funds from.
     * @param withdrawFundsRequest
     */
    public withdrawFundsWithHttpInfo(walletId: string, withdrawFundsRequest: WithdrawFundsRequest, _options?: ConfigurationOptions): Observable<HttpInfo<WithdrawFunds200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.withdrawFunds(walletId, withdrawFundsRequest, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.withdrawFundsWithHttpInfo(rsp)));
            }));
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint requires authentication via a valid Bluvo API Key. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds
     * @param walletId The unique identifier of the wallet to withdraw funds from.
     * @param withdrawFundsRequest
     */
    public withdrawFunds(walletId: string, withdrawFundsRequest: WithdrawFundsRequest, _options?: ConfigurationOptions): Observable<WithdrawFunds200Response> {
        return this.withdrawFundsWithHttpInfo(walletId, withdrawFundsRequest, _options).pipe(map((apiResponse: HttpInfo<WithdrawFunds200Response>) => apiResponse.data));
    }

}

import { WalletsApiRequestFactory, WalletsApiResponseProcessor} from "../apis/WalletsApi";
export class ObservableWalletsApi {
    private requestFactory: WalletsApiRequestFactory;
    private responseProcessor: WalletsApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: WalletsApiRequestFactory,
        responseProcessor?: WalletsApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new WalletsApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new WalletsApiResponseProcessor();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param connectWalletRequest
     */
    public connectWalletWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', connectWalletRequest: ConnectWalletRequest, _options?: ConfigurationOptions): Observable<HttpInfo<ConnectWallet200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.connectWallet(exchange, connectWalletRequest, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.connectWalletWithHttpInfo(rsp)));
            }));
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param connectWalletRequest
     */
    public connectWallet(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', connectWalletRequest: ConnectWalletRequest, _options?: ConfigurationOptions): Observable<ConnectWallet200Response> {
        return this.connectWalletWithHttpInfo(exchange, connectWalletRequest, _options).pipe(map((apiResponse: HttpInfo<ConnectWallet200Response>) => apiResponse.data));
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param walletId The unique identifier of the connected wallet to delete.
     */
    public deleteWalletWithHttpInfo(walletId: string, _options?: ConfigurationOptions): Observable<HttpInfo<DeleteWallet200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.deleteWallet(walletId, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.deleteWalletWithHttpInfo(rsp)));
            }));
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param walletId The unique identifier of the connected wallet to delete.
     */
    public deleteWallet(walletId: string, _options?: ConfigurationOptions): Observable<DeleteWallet200Response> {
        return this.deleteWalletWithHttpInfo(walletId, _options).pipe(map((apiResponse: HttpInfo<DeleteWallet200Response>) => apiResponse.data));
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param walletId The unique identifier of the connected wallet to query.
     */
    public getWalletWithHttpInfo(walletId: string, _options?: ConfigurationOptions): Observable<HttpInfo<GetWallet200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.getWallet(walletId, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.getWalletWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param walletId The unique identifier of the connected wallet to query.
     */
    public getWallet(walletId: string, _options?: ConfigurationOptions): Observable<GetWallet200Response> {
        return this.getWalletWithHttpInfo(walletId, _options).pipe(map((apiResponse: HttpInfo<GetWallet200Response>) => apiResponse.data));
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
    public listWalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: ConfigurationOptions): Observable<HttpInfo<ListWallets200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.listWallets(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.listWalletsWithHttpInfo(rsp)));
            }));
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
    public listWallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: ConfigurationOptions): Observable<ListWallets200Response> {
        return this.listWalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, _options).pipe(map((apiResponse: HttpInfo<ListWallets200Response>) => apiResponse.data));
    }

}

import { WorkflowApiRequestFactory, WorkflowApiResponseProcessor} from "../apis/WorkflowApi";
export class ObservableWorkflowApi {
    private requestFactory: WorkflowApiRequestFactory;
    private responseProcessor: WorkflowApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: WorkflowApiRequestFactory,
        responseProcessor?: WorkflowApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new WorkflowApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new WorkflowApiResponseProcessor();
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param workflowRunId The unique identifier of the workflow run to query.
     */
    public getWorkflowWithHttpInfo(workflowRunId: string, _options?: ConfigurationOptions): Observable<HttpInfo<GetWorkflow200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.getWorkflow(workflowRunId, _config);
        // build promise chain
        let middlewarePreObservable = from<RequestContext>(requestContextPromise);
        for (const middleware of _config.middleware) {
            middlewarePreObservable = middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => middleware.pre(ctx)));
        }

        return middlewarePreObservable.pipe(mergeMap((ctx: RequestContext) => _config.httpApi.send(ctx))).
            pipe(mergeMap((response: ResponseContext) => {
                let middlewarePostObservable = of(response);
                for (const middleware of _config.middleware.reverse()) {
                    middlewarePostObservable = middlewarePostObservable.pipe(mergeMap((rsp: ResponseContext) => middleware.post(rsp)));
                }
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.getWorkflowWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param workflowRunId The unique identifier of the workflow run to query.
     */
    public getWorkflow(workflowRunId: string, _options?: ConfigurationOptions): Observable<GetWorkflow200Response> {
        return this.getWorkflowWithHttpInfo(workflowRunId, _options).pipe(map((apiResponse: HttpInfo<GetWorkflow200Response>) => apiResponse.data));
    }

}
