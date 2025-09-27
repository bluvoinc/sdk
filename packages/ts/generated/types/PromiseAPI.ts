import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, PromiseConfigurationOptions, wrapOptions } from '../configuration'
import { PromiseMiddleware, Middleware, PromiseMiddlewareWrapper } from '../middleware';

import { Oauth2exchangeslistexchanges200Response } from '../models/Oauth2exchangeslistexchanges200Response';
import { Oauth2exchangeslistexchanges200ResponseExchangesInner } from '../models/Oauth2exchangeslistexchanges200ResponseExchangesInner';
import { Oauth2exchangeurlgeturl200Response } from '../models/Oauth2exchangeurlgeturl200Response';
import { Walletdelete200Response } from '../models/Walletdelete200Response';
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
import { Wallettransactionslisttransactions200ResponsePagination } from '../models/Wallettransactionslisttransactions200ResponsePagination';
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
import { ObservableOAuth2Api } from './ObservableAPI';

import { OAuth2ApiRequestFactory, OAuth2ApiResponseProcessor} from "../apis/OAuth2Api";
export class PromiseOAuth2Api {
    private api: ObservableOAuth2Api

    public constructor(
        configuration: Configuration,
        requestFactory?: OAuth2ApiRequestFactory,
        responseProcessor?: OAuth2ApiResponseProcessor
    ) {
        this.api = new ObservableOAuth2Api(configuration, requestFactory, responseProcessor);
    }

    /**
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     */
    public oauth2exchangeslistexchangesWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Oauth2exchangeslistexchanges200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.oauth2exchangeslistexchangesWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     */
    public oauth2exchangeslistexchanges(_options?: PromiseConfigurationOptions): Promise<Oauth2exchangeslistexchanges200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.oauth2exchangeslistexchanges(observableOptions);
        return result.toPromise();
    }

    /**
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param exchange Exchange identifier.
     * @param idem Idempotency key.
     */
    public oauth2exchangeurlgeturlWithHttpInfo(exchange: 'coinbase' | 'kraken', idem: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.oauth2exchangeurlgeturlWithHttpInfo(exchange, idem, observableOptions);
        return result.toPromise();
    }

    /**
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param exchange Exchange identifier.
     * @param idem Idempotency key.
     */
    public oauth2exchangeurlgeturl(exchange: 'coinbase' | 'kraken', idem: string, _options?: PromiseConfigurationOptions): Promise<Oauth2exchangeurlgeturl200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.oauth2exchangeurlgeturl(exchange, idem, observableOptions);
        return result.toPromise();
    }


}



import { ObservableWalletsApi } from './ObservableAPI';

import { WalletsApiRequestFactory, WalletsApiResponseProcessor} from "../apis/WalletsApi";
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
     * Delete a connected exchange wallet.
     * Delete
     */
    public walletdeleteWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletdelete200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletdeleteWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Delete a connected exchange wallet.
     * Delete
     */
    public walletdelete(_options?: PromiseConfigurationOptions): Promise<Walletdelete200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletdelete(observableOptions);
        return result.toPromise();
    }

    /**
     * Get wallet information and balances.
     * Get
     */
    public walletgetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletget200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletgetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Get wallet information and balances.
     * Get
     */
    public walletget(_options?: PromiseConfigurationOptions): Promise<Walletget200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletget(observableOptions);
        return result.toPromise();
    }

    /**
     * List all connected exchange wallets.
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
    public walletlistlistwalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletlistlistwallets200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletlistlistwalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
        return result.toPromise();
    }

    /**
     * List all connected exchange wallets.
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
    public walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: PromiseConfigurationOptions): Promise<Walletlistlistwallets200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletlistlistwallets(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
        return result.toPromise();
    }

    /**
     * List transactions for a specific wallet or all wallets with filtering options.
     * List Transactions
     * @param [walletId] The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of transactions per page (max 1000).
     * @param [sinceDate] Filter transactions after this date (ISO format).
     */
    public wallettransactionslisttransactionsWithHttpInfo(walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Wallettransactionslisttransactions200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.wallettransactionslisttransactionsWithHttpInfo(walletId, page, limit, sinceDate, observableOptions);
        return result.toPromise();
    }

    /**
     * List transactions for a specific wallet or all wallets with filtering options.
     * List Transactions
     * @param [walletId] The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * @param [page] Page number (0-indexed).
     * @param [limit] Number of transactions per page (max 1000).
     * @param [sinceDate] Filter transactions after this date (ISO format).
     */
    public wallettransactionslisttransactions(walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: PromiseConfigurationOptions): Promise<Wallettransactionslisttransactions200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.wallettransactionslisttransactions(walletId, page, limit, sinceDate, observableOptions);
        return result.toPromise();
    }


}



import { ObservableWithdrawalsApi } from './ObservableAPI';

import { WithdrawalsApiRequestFactory, WithdrawalsApiResponseProcessor} from "../apis/WithdrawalsApi";
export class PromiseWithdrawalsApi {
    private api: ObservableWithdrawalsApi

    public constructor(
        configuration: Configuration,
        requestFactory?: WithdrawalsApiRequestFactory,
        responseProcessor?: WithdrawalsApiResponseProcessor
    ) {
        this.api = new ObservableWithdrawalsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Get withdrawable balances and supported networks.
     * Balance
     */
    public walletwithdrawbalancebalanceWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawbalancebalance200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawbalancebalanceWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Get withdrawable balances and supported networks.
     * Balance
     */
    public walletwithdrawbalancebalance(_options?: PromiseConfigurationOptions): Promise<Walletwithdrawbalancebalance200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawbalancebalance(observableOptions);
        return result.toPromise();
    }

    /**
     * Execute a withdrawal using a quote ID.
     * Withdraw
     * @param idem UUID for tracking withdrawal flow.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Execute a withdrawal using a quote ID.
     * Withdraw
     * @param idem UUID for tracking withdrawal flow.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdraw(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: PromiseConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquoteidexecutewithdraw(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Get withdrawal quote with fees and estimates.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawquotequotation200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Get withdrawal quote with fees and estimates.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: PromiseConfigurationOptions): Promise<Walletwithdrawquotequotation200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquotequotation(walletwithdrawquotequotationRequest, observableOptions);
        return result.toPromise();
    }


}



