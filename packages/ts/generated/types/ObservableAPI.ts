import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions, mergeConfiguration } from '../configuration'
import type { Middleware } from '../middleware';
import { Observable, of, from } from '../rxjsStub';
import {mergeMap, map} from  '../rxjsStub';
import { Oauth2exchangeslistexchanges200Response } from '../models/Oauth2exchangeslistexchanges200Response';
import { Oauth2exchangeslistexchanges200ResponseExchangesInner } from '../models/Oauth2exchangeslistexchanges200ResponseExchangesInner';
import { Oauth2exchangeurlgeturl200Response } from '../models/Oauth2exchangeurlgeturl200Response';
import { Walletdelete200Response } from '../models/Walletdelete200Response';
import { Walletget200Response } from '../models/Walletget200Response';
import { Walletget200ResponseCreatedAt } from '../models/Walletget200ResponseCreatedAt';
import { Walletget403Response } from '../models/Walletget403Response';
import { Walletget404Response } from '../models/Walletget404Response';
import { Walletlistlistwallets200Response } from '../models/Walletlistlistwallets200Response';
import { Walletlistlistwallets200ResponsePagination } from '../models/Walletlistlistwallets200ResponsePagination';
import { Walletlistlistwallets200ResponseWalletsInner } from '../models/Walletlistlistwallets200ResponseWalletsInner';
import { Walletlistlistwallets200ResponseWalletsInnerInvalidApi } from '../models/Walletlistlistwallets200ResponseWalletsInnerInvalidApi';
import { Walletpingping200Response } from '../models/Walletpingping200Response';
import { Wallettransactionslisttransactions200Response } from '../models/Wallettransactionslisttransactions200Response';
import { Wallettransactionslisttransactions200ResponsePagination } from '../models/Wallettransactionslisttransactions200ResponsePagination';
import { Wallettransactionslisttransactions200ResponseTransactionsInner } from '../models/Wallettransactionslisttransactions200ResponseTransactionsInner';
import { Walletwithdrawbalancebalance200Response } from '../models/Walletwithdrawbalancebalance200Response';
import { Walletwithdrawbalancebalance200ResponseBalancesInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInner';
import { Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner';
import { Walletwithdrawquoteidexecutewithdraw200Response } from '../models/Walletwithdrawquoteidexecutewithdraw200Response';
import { WalletwithdrawquoteidexecutewithdrawRequest } from '../models/WalletwithdrawquoteidexecutewithdrawRequest';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { Walletwithdrawquotequotation200ResponseAdditionalInfo } from '../models/Walletwithdrawquotequotation200ResponseAdditionalInfo';
import { Walletwithdrawquotequotation200ResponseFeeDetailsInner } from '../models/Walletwithdrawquotequotation200ResponseFeeDetailsInner';
import { Walletwithdrawquotequotation400Response } from '../models/Walletwithdrawquotequotation400Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';

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
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     */
    public oauth2exchangeslistexchangesWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Oauth2exchangeslistexchanges200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.oauth2exchangeslistexchanges(_config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.oauth2exchangeslistexchangesWithHttpInfo(rsp)));
            }));
    }

    /**
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     */
    public oauth2exchangeslistexchanges(_options?: ConfigurationOptions): Observable<Oauth2exchangeslistexchanges200Response> {
        return this.oauth2exchangeslistexchangesWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Oauth2exchangeslistexchanges200Response>) => apiResponse.data));
    }

    /**
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param exchange Exchange identifier.
     * @param idem Idempotency key.
     */
    public oauth2exchangeurlgeturlWithHttpInfo(exchange: 'coinbase' | 'kraken' | 'gemini' | 'local-cex', idem: string, _options?: ConfigurationOptions): Observable<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
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
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param exchange Exchange identifier.
     * @param idem Idempotency key.
     */
    public oauth2exchangeurlgeturl(exchange: 'coinbase' | 'kraken' | 'gemini' | 'local-cex', idem: string, _options?: ConfigurationOptions): Observable<Oauth2exchangeurlgeturl200Response> {
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
     * Delete a connected exchange wallet.  **Required API Key Scopes:** `read`, `delete`
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
     * Delete a connected exchange wallet.  **Required API Key Scopes:** `read`, `delete`
     * Delete
     */
    public walletdelete(_options?: ConfigurationOptions): Observable<Walletdelete200Response> {
        return this.walletdeleteWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletdelete200Response>) => apiResponse.data));
    }

    /**
     * Get wallet information and balances.  **Required API Key Scopes:** `read`
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
     * Get wallet information and balances.  **Required API Key Scopes:** `read`
     * Get
     */
    public walletget(_options?: ConfigurationOptions): Observable<Walletget200Response> {
        return this.walletgetWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletget200Response>) => apiResponse.data));
    }

    /**
     * List all connected exchange wallets.  **Required API Key Scopes:** `read`
     * List Wallets
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of wallets per page (max 1000).
     * @param [exchange] Filter by exchange.
     * @param [createdSince] Filter by creation date (from, ISO format).
     * @param [createdBefore] Filter by creation date (before, ISO format).
     * @param [lastSyncSince] Filter by last sync date (from, ISO format).
     * @param [lastSyncBefore] Filter by last sync date (before, ISO format).
     * @param [invalidApi] Filter by API validity status.
     * @param [fields] Comma-separated list of fields to include.
     */
    public walletlistlistwalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'local-cex' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: ConfigurationOptions): Observable<HttpInfo<Walletlistlistwallets200Response>> {
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
     * List all connected exchange wallets.  **Required API Key Scopes:** `read`
     * List Wallets
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of wallets per page (max 1000).
     * @param [exchange] Filter by exchange.
     * @param [createdSince] Filter by creation date (from, ISO format).
     * @param [createdBefore] Filter by creation date (before, ISO format).
     * @param [lastSyncSince] Filter by last sync date (from, ISO format).
     * @param [lastSyncBefore] Filter by last sync date (before, ISO format).
     * @param [invalidApi] Filter by API validity status.
     * @param [fields] Comma-separated list of fields to include.
     */
    public walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'local-cex' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: ConfigurationOptions): Observable<Walletlistlistwallets200Response> {
        return this.walletlistlistwalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, _options).pipe(map((apiResponse: HttpInfo<Walletlistlistwallets200Response>) => apiResponse.data));
    }

    /**
     * Test wallet connectivity and validate exchange API credentials. This endpoint verifies that the stored credentials are valid by making a test API call to the exchange. Use this to check if credentials need to be refreshed or if the wallet connection is still active.  **Required API Key Scopes:** `read`
     * Ping
     */
    public walletpingpingWithHttpInfo(_options?: ConfigurationOptions): Observable<HttpInfo<Walletpingping200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletpingping(_config);
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
                return middlewarePostObservable.pipe(map((rsp: ResponseContext) => this.responseProcessor.walletpingpingWithHttpInfo(rsp)));
            }));
    }

    /**
     * Test wallet connectivity and validate exchange API credentials. This endpoint verifies that the stored credentials are valid by making a test API call to the exchange. Use this to check if credentials need to be refreshed or if the wallet connection is still active.  **Required API Key Scopes:** `read`
     * Ping
     */
    public walletpingping(_options?: ConfigurationOptions): Observable<Walletpingping200Response> {
        return this.walletpingpingWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletpingping200Response>) => apiResponse.data));
    }

    /**
     * List transactions for a specific wallet or all wallets with filtering options.  **Required API Key Scopes:** `read`
     * List Transactions
     * @param [walletId] The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of transactions per page (max 1000).
     * @param [sinceDate] Filter transactions after this date (ISO format).
     */
    public wallettransactionslisttransactionsWithHttpInfo(walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: ConfigurationOptions): Observable<HttpInfo<Wallettransactionslisttransactions200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.wallettransactionslisttransactions(walletId, page, limit, sinceDate, _config);
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
     * List transactions for a specific wallet or all wallets with filtering options.  **Required API Key Scopes:** `read`
     * List Transactions
     * @param [walletId] The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of transactions per page (max 1000).
     * @param [sinceDate] Filter transactions after this date (ISO format).
     */
    public wallettransactionslisttransactions(walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: ConfigurationOptions): Observable<Wallettransactionslisttransactions200Response> {
        return this.wallettransactionslisttransactionsWithHttpInfo(walletId, page, limit, sinceDate, _options).pipe(map((apiResponse: HttpInfo<Wallettransactionslisttransactions200Response>) => apiResponse.data));
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
     * Get withdrawable balances and supported networks.  **Required API Key Scopes:** `read`
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
     * Get withdrawable balances and supported networks.  **Required API Key Scopes:** `read`
     * Balance
     */
    public walletwithdrawbalancebalance(_options?: ConfigurationOptions): Observable<Walletwithdrawbalancebalance200Response> {
        return this.walletwithdrawbalancebalanceWithHttpInfo(_options).pipe(map((apiResponse: HttpInfo<Walletwithdrawbalancebalance200Response>) => apiResponse.data));
    }

    /**
     * Execute a withdrawal using a quote ID.  **Required API Key Scopes:** `read`, `quote`, `withdrawal`
     * Withdraw
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: ConfigurationOptions): Observable<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        const _config = mergeConfiguration(this.configuration, _options);

        const requestContextPromise = this.requestFactory.walletwithdrawquoteidexecutewithdraw(quoteId, walletwithdrawquoteidexecutewithdrawRequest, _config);
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
     * Execute a withdrawal using a quote ID.  **Required API Key Scopes:** `read`, `quote`, `withdrawal`
     * Withdraw
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdraw(quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: ConfigurationOptions): Observable<Walletwithdrawquoteidexecutewithdraw200Response> {
        return this.walletwithdrawquoteidexecutewithdrawWithHttpInfo(quoteId, walletwithdrawquoteidexecutewithdrawRequest, _options).pipe(map((apiResponse: HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>) => apiResponse.data));
    }

    /**
     * Get withdrawal quote with fees and estimates.  **Required API Key Scopes:** `read`, `quote`
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
     * Get withdrawal quote with fees and estimates.  **Required API Key Scopes:** `read`, `quote`
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: ConfigurationOptions): Observable<Walletwithdrawquotequotation200Response> {
        return this.walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest, _options).pipe(map((apiResponse: HttpInfo<Walletwithdrawquotequotation200Response>) => apiResponse.data));
    }

}
