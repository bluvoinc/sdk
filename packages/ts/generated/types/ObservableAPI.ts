import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions, mergeConfiguration } from '../configuration'
import type { Middleware } from '../middleware';
import { Observable, of, from } from '../rxjsStub';
import {mergeMap, map} from  '../rxjsStub';
import { Oauth2exchangeurlgeturl200Response } from '../models/Oauth2exchangeurlgeturl200Response';
import { Walletdelete200Response } from '../models/Walletdelete200Response';
import { Walletexchangeconnectconnectwallet200Response } from '../models/Walletexchangeconnectconnectwallet200Response';
import { WalletexchangeconnectconnectwalletRequest } from '../models/WalletexchangeconnectconnectwalletRequest';
import { Walletget200Response } from '../models/Walletget200Response';
import { Walletget200ResponseCreatedAt } from '../models/Walletget200ResponseCreatedAt';
import { Walletget404Response } from '../models/Walletget404Response';
import { Walletlistlistwallets200Response } from '../models/Walletlistlistwallets200Response';
import { Walletlistlistwallets200ResponsePagination } from '../models/Walletlistlistwallets200ResponsePagination';
import { Walletlistlistwallets200ResponseWalletsInner } from '../models/Walletlistlistwallets200ResponseWalletsInner';
import { Walletlistlistwallets200ResponseWalletsInnerBalancesValue } from '../models/Walletlistlistwallets200ResponseWalletsInnerBalancesValue';
import { Walletlistlistwallets200ResponseWalletsInnerBalancesValueAnyOf } from '../models/Walletlistlistwallets200ResponseWalletsInnerBalancesValueAnyOf';
import { Walletlistlistwallets200ResponseWalletsInnerInvalidApi } from '../models/Walletlistlistwallets200ResponseWalletsInnerInvalidApi';
import { Wallettransactionslisttransactions200Response } from '../models/Wallettransactionslisttransactions200Response';
import { Wallettransactionslisttransactions200ResponseTransactionsInner } from '../models/Wallettransactionslisttransactions200ResponseTransactionsInner';
import { Walletwithdrawbalancebalance200Response } from '../models/Walletwithdrawbalancebalance200Response';
import { Walletwithdrawbalancebalance200ResponseBalancesInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInner';
import { Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner';
import { Walletwithdrawquoteidexecutewithdraw200Response } from '../models/Walletwithdrawquoteidexecutewithdraw200Response';
import { Walletwithdrawquoteidexecutewithdraw400Response } from '../models/Walletwithdrawquoteidexecutewithdraw400Response';
import { WalletwithdrawquoteidexecutewithdrawRequest } from '../models/WalletwithdrawquoteidexecutewithdrawRequest';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { Walletwithdrawquotequotation400Response } from '../models/Walletwithdrawquotequotation400Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';
import { Workflowworkflowtypegetworkflowrunidget200Response } from '../models/Workflowworkflowtypegetworkflowrunidget200Response';
import { Workflowworkflowtypegetworkflowrunidget200ResponseDetails } from '../models/Workflowworkflowtypegetworkflowrunidget200ResponseDetails';

import { APIKeysApiRequestFactory, APIKeysApiResponseProcessor} from "../apis/APIKeysApi";
export class ObservableAPIKeysApi {
    private requestFactory: APIKeysApiRequestFactory;
    private responseProcessor: APIKeysApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: APIKeysApiRequestFactory,
        responseProcessor?: APIKeysApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new APIKeysApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new APIKeysApiResponseProcessor();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * @param walletexchangeconnectconnectwalletRequest
     */
    public walletexchangeconnectconnectwalletWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', idem: string, walletexchangeconnectconnectwalletRequest: WalletexchangeconnectconnectwalletRequest, _options?: ConfigurationOptions): Observable<HttpInfo<Walletexchangeconnectconnectwallet200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletexchangeconnectconnectwallet(exchange, idem, walletexchangeconnectconnectwalletRequest, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletexchangeconnectconnectwalletWithHttpInfo(rsp)));
            }));
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * @param walletexchangeconnectconnectwalletRequest
     */
    public walletexchangeconnectconnectwallet(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', idem: string, walletexchangeconnectconnectwalletRequest: WalletexchangeconnectconnectwalletRequest, _options?: ConfigurationOptions): Observable<Walletexchangeconnectconnectwallet200Response> {
        return this.walletexchangeconnectconnectwalletWithHttpInfo(exchange, idem, walletexchangeconnectconnectwalletRequest, _options).pipe(map((apiResponse: HttpInfo<Walletexchangeconnectconnectwallet200Response>) => apiResponse.data));
    }

}

import { OAuth2ApiRequestFactory, OAuth2ApiResponseProcessor} from "../apis/OAuth2Api";
export class ObservableOAuth2Api {
    private requestFactory: OAuth2ApiRequestFactory;
    private responseProcessor: OAuth2ApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: OAuth2ApiRequestFactory,
        responseProcessor?: OAuth2ApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new OAuth2ApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new OAuth2ApiResponseProcessor();
    }

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public oauth2exchangeurlgeturlWithHttpInfo(exchange: 'coinbase' | 'kraken', idem: string, _options?: ConfigurationOptions): Observable<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.oauth2exchangeurlgeturl(exchange, idem, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.oauth2exchangeurlgeturlWithHttpInfo(rsp)));
            }));
    }

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public oauth2exchangeurlgeturl(exchange: 'coinbase' | 'kraken', idem: string, _options?: ConfigurationOptions): Observable<Oauth2exchangeurlgeturl200Response> {
        return this.oauth2exchangeurlgeturlWithHttpInfo(exchange, idem, _options).pipe(map((apiResponse: HttpInfo<Oauth2exchangeurlgeturl200Response>) => apiResponse.data));
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
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     */
    public walletdeleteWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Walletdelete200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletdelete(_config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletdeleteWithHttpInfo(rsp)));
            }));
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     */
    public walletdelete(_options?: ConfigurationOptions): Observable<Walletdelete200Response> {
        return this.walletdeleteWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletdelete200Response>) => apiResponse.data));
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     */
    public walletgetWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Walletget200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletget(_config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletgetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     */
    public walletget(_options?: ConfigurationOptions): Observable<Walletget200Response> {
        return this.walletgetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletget200Response>) => apiResponse.data));
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
    public walletlistlistwalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: ConfigurationOptions): Observable<HttpInfo<Walletlistlistwallets200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletlistlistwallets(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletlistlistwalletsWithHttpInfo(rsp)));
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
    public walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: ConfigurationOptions): Observable<Walletlistlistwallets200Response> {
        return this.walletlistlistwalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, _options).pipe(map((apiResponse: HttpInfo<Walletlistlistwallets200Response>) => apiResponse.data));
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * List Transactions
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param [asset] Optional. Filter transactions by asset symbol.
     * @param [type] Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param [since] Optional. Filter transactions created on or after this date (ISO format).
     * @param [before] Optional. Filter transactions created before this date (ISO format).
     * @param [status] Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public wallettransactionslisttransactionsWithHttpInfo(page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: ConfigurationOptions): Observable<HttpInfo<Wallettransactionslisttransactions200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.wallettransactionslisttransactions(page, limit, asset, type, since, before, status, fields, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.wallettransactionslisttransactionsWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * List Transactions
     * @param [page] Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param [limit] Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param [asset] Optional. Filter transactions by asset symbol.
     * @param [type] Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param [since] Optional. Filter transactions created on or after this date (ISO format).
     * @param [before] Optional. Filter transactions created before this date (ISO format).
     * @param [status] Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param [fields] Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public wallettransactionslisttransactions(page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: ConfigurationOptions): Observable<Wallettransactionslisttransactions200Response> {
        return this.wallettransactionslisttransactionsWithHttpInfo(page, limit, asset, type, since, before, status, fields, _options).pipe(map((apiResponse: HttpInfo<Wallettransactionslisttransactions200Response>) => apiResponse.data));
    }

}

import { WithdrawalsApiRequestFactory, WithdrawalsApiResponseProcessor} from "../apis/WithdrawalsApi";
export class ObservableWithdrawalsApi {
    private requestFactory: WithdrawalsApiRequestFactory;
    private responseProcessor: WithdrawalsApiResponseProcessor;
    private configuration: Configuration;

    public constructor(
        configuration: Configuration,
        requestFactory?: WithdrawalsApiRequestFactory,
        responseProcessor?: WithdrawalsApiResponseProcessor
    ) {
        this.configuration = configuration;
        this.requestFactory = requestFactory || new WithdrawalsApiRequestFactory(configuration);
        this.responseProcessor = responseProcessor || new WithdrawalsApiResponseProcessor();
    }

    /**
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     */
    public walletwithdrawbalancebalanceWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Walletwithdrawbalancebalance200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletwithdrawbalancebalance(_config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletwithdrawbalancebalanceWithHttpInfo(rsp)));
            }));
    }

    /**
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     */
    public walletwithdrawbalancebalance(_options?: ConfigurationOptions): Observable<Walletwithdrawbalancebalance200Response> {
        return this.walletwithdrawbalancebalanceWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletwithdrawbalancebalance200Response>) => apiResponse.data));
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param idem Any UUID. This is used to track the Withdrawal flow and can be used to subscribe to updates.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: ConfigurationOptions): Observable<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletwithdrawquoteidexecutewithdraw(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletwithdrawquoteidexecutewithdrawWithHttpInfo(rsp)));
            }));
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param idem Any UUID. This is used to track the Withdrawal flow and can be used to subscribe to updates.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdraw(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: ConfigurationOptions): Observable<Walletwithdrawquoteidexecutewithdraw200Response> {
        return this.walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, _options).pipe(map((apiResponse: HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>) => apiResponse.data));
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: ConfigurationOptions): Observable<HttpInfo<Walletwithdrawquotequotation200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletwithdrawquotequotation(walletwithdrawquotequotationRequest, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletwithdrawquotequotationWithHttpInfo(rsp)));
            }));
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: ConfigurationOptions): Observable<Walletwithdrawquotequotation200Response> {
        return this.walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest, _options).pipe(map((apiResponse: HttpInfo<Walletwithdrawquotequotation200Response>) => apiResponse.data));
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
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param workflowRunId The unique identifier of the workflow run to query.
     * @param workflowType The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     */
    public workflowworkflowtypegetworkflowrunidgetWithHttpInfo(workflowRunId: string, workflowType: 'connect' | 'withdraw' | 'oauth2', _options?: ConfigurationOptions): Observable<HttpInfo<Workflowworkflowtypegetworkflowrunidget200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.workflowworkflowtypegetworkflowrunidget(workflowRunId, workflowType, _config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.workflowworkflowtypegetworkflowrunidgetWithHttpInfo(rsp)));
            }));
    }

    /**
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param workflowRunId The unique identifier of the workflow run to query.
     * @param workflowType The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     */
    public workflowworkflowtypegetworkflowrunidget(workflowRunId: string, workflowType: 'connect' | 'withdraw' | 'oauth2', _options?: ConfigurationOptions): Observable<Workflowworkflowtypegetworkflowrunidget200Response> {
        return this.workflowworkflowtypegetworkflowrunidgetWithHttpInfo(workflowRunId, workflowType, _options).pipe(map((apiResponse: HttpInfo<Workflowworkflowtypegetworkflowrunidget200Response>) => apiResponse.data));
    }

}
