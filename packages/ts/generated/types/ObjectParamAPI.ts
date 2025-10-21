import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions } from '../configuration'
import type { Middleware } from '../middleware';

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
import { Walletwithdrawquotequotation200ResponseFeeDetailsInner } from '../models/Walletwithdrawquotequotation200ResponseFeeDetailsInner';
import { Walletwithdrawquotequotation400Response } from '../models/Walletwithdrawquotequotation400Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';

import { ObservableOAuth2Api } from "./ObservableAPI";
import { OAuth2ApiRequestFactory, OAuth2ApiResponseProcessor} from "../apis/OAuth2Api";

export interface OAuth2ApiOauth2exchangeslistexchangesRequest {
}

export interface OAuth2ApiOauth2exchangeurlgeturlRequest {
    /**
     * Exchange identifier.
     * Defaults to: undefined
     * @type &#39;coinbase&#39; | &#39;kraken&#39; | &#39;gemini&#39;
     * @memberof OAuth2Apioauth2exchangeurlgeturl
     */
    exchange: 'coinbase' | 'kraken' | 'gemini'
    /**
     * Idempotency key.
     * Defaults to: undefined
     * @type string
     * @memberof OAuth2Apioauth2exchangeurlgeturl
     */
    idem: string
}

export class ObjectOAuth2Api {
    private api: ObservableOAuth2Api

    public constructor(configuration: Configuration, requestFactory?: OAuth2ApiRequestFactory, responseProcessor?: OAuth2ApiResponseProcessor) {
        this.api = new ObservableOAuth2Api(configuration, requestFactory, responseProcessor);
    }

    /**
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     * @param param the request object
     */
    public oauth2exchangeslistexchangesWithHttpInfo(param: OAuth2ApiOauth2exchangeslistexchangesRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Oauth2exchangeslistexchanges200Response>> {
        return this.api.oauth2exchangeslistexchangesWithHttpInfo( options).toPromise();
    }

    /**
     * List supported exchanges for OAuth2 connections.
     * List Exchanges
     * @param param the request object
     */
    public oauth2exchangeslistexchanges(param: OAuth2ApiOauth2exchangeslistexchangesRequest = {}, options?: ConfigurationOptions): Promise<Oauth2exchangeslistexchanges200Response> {
        return this.api.oauth2exchangeslistexchanges( options).toPromise();
    }

    /**
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param param the request object
     */
    public oauth2exchangeurlgeturlWithHttpInfo(param: OAuth2ApiOauth2exchangeurlgeturlRequest, options?: ConfigurationOptions): Promise<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
        return this.api.oauth2exchangeurlgeturlWithHttpInfo(param.exchange, param.idem,  options).toPromise();
    }

    /**
     * Get OAuth2 authorization URL for exchange connection.
     * Get URL
     * @param param the request object
     */
    public oauth2exchangeurlgeturl(param: OAuth2ApiOauth2exchangeurlgeturlRequest, options?: ConfigurationOptions): Promise<Oauth2exchangeurlgeturl200Response> {
        return this.api.oauth2exchangeurlgeturl(param.exchange, param.idem,  options).toPromise();
    }

}

import { ObservableWalletsApi } from "./ObservableAPI";
import { WalletsApiRequestFactory, WalletsApiResponseProcessor} from "../apis/WalletsApi";

export interface WalletsApiWalletdeleteRequest {
}

export interface WalletsApiWalletgetRequest {
}

export interface WalletsApiWalletlistlistwalletsRequest {
    /**
     * Page number (0-indexed).
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwalletlistlistwallets
     */
    page?: number
    /**
     * Number of wallets per page (max 1000).
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwalletlistlistwallets
     */
    limit?: number
    /**
     * Filter by exchange.
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bybit&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39; | &#39;null&#39;
     * @memberof WalletsApiwalletlistlistwallets
     */
    exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'null'
    /**
     * Filter by creation date (from, ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    createdSince?: string
    /**
     * Filter by creation date (before, ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    createdBefore?: string
    /**
     * Filter by last sync date (from, ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    lastSyncSince?: string
    /**
     * Filter by last sync date (before, ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    lastSyncBefore?: string
    /**
     * Filter by API validity status.
     * Defaults to: undefined
     * @type &#39;true&#39; | &#39;false&#39; | &#39;null&#39;
     * @memberof WalletsApiwalletlistlistwallets
     */
    invalidApi?: 'true' | 'false' | 'null'
    /**
     * Comma-separated list of fields to include.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    fields?: string
}

export interface WalletsApiWallettransactionslisttransactionsRequest {
    /**
     * The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    walletId?: string
    /**
     * Page number (0-indexed).
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    page?: number
    /**
     * Number of transactions per page (max 1000).
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    limit?: number
    /**
     * Filter transactions after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    sinceDate?: string
}

export class ObjectWalletsApi {
    private api: ObservableWalletsApi

    public constructor(configuration: Configuration, requestFactory?: WalletsApiRequestFactory, responseProcessor?: WalletsApiResponseProcessor) {
        this.api = new ObservableWalletsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Delete a connected exchange wallet.
     * Delete
     * @param param the request object
     */
    public walletdeleteWithHttpInfo(param: WalletsApiWalletdeleteRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletdelete200Response>> {
        return this.api.walletdeleteWithHttpInfo( options).toPromise();
    }

    /**
     * Delete a connected exchange wallet.
     * Delete
     * @param param the request object
     */
    public walletdelete(param: WalletsApiWalletdeleteRequest = {}, options?: ConfigurationOptions): Promise<Walletdelete200Response> {
        return this.api.walletdelete( options).toPromise();
    }

    /**
     * Get wallet information and balances.
     * Get
     * @param param the request object
     */
    public walletgetWithHttpInfo(param: WalletsApiWalletgetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletget200Response>> {
        return this.api.walletgetWithHttpInfo( options).toPromise();
    }

    /**
     * Get wallet information and balances.
     * Get
     * @param param the request object
     */
    public walletget(param: WalletsApiWalletgetRequest = {}, options?: ConfigurationOptions): Promise<Walletget200Response> {
        return this.api.walletget( options).toPromise();
    }

    /**
     * List all connected exchange wallets.
     * List Wallets
     * @param param the request object
     */
    public walletlistlistwalletsWithHttpInfo(param: WalletsApiWalletlistlistwalletsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletlistlistwallets200Response>> {
        return this.api.walletlistlistwalletsWithHttpInfo(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

    /**
     * List all connected exchange wallets.
     * List Wallets
     * @param param the request object
     */
    public walletlistlistwallets(param: WalletsApiWalletlistlistwalletsRequest = {}, options?: ConfigurationOptions): Promise<Walletlistlistwallets200Response> {
        return this.api.walletlistlistwallets(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

    /**
     * List transactions for a specific wallet or all wallets with filtering options.
     * List Transactions
     * @param param the request object
     */
    public wallettransactionslisttransactionsWithHttpInfo(param: WalletsApiWallettransactionslisttransactionsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Wallettransactionslisttransactions200Response>> {
        return this.api.wallettransactionslisttransactionsWithHttpInfo(param.walletId, param.page, param.limit, param.sinceDate,  options).toPromise();
    }

    /**
     * List transactions for a specific wallet or all wallets with filtering options.
     * List Transactions
     * @param param the request object
     */
    public wallettransactionslisttransactions(param: WalletsApiWallettransactionslisttransactionsRequest = {}, options?: ConfigurationOptions): Promise<Wallettransactionslisttransactions200Response> {
        return this.api.wallettransactionslisttransactions(param.walletId, param.page, param.limit, param.sinceDate,  options).toPromise();
    }

}

import { ObservableWithdrawalsApi } from "./ObservableAPI";
import { WithdrawalsApiRequestFactory, WithdrawalsApiResponseProcessor} from "../apis/WithdrawalsApi";

export interface WithdrawalsApiWalletwithdrawbalancebalanceRequest {
}

export interface WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest {
    /**
     * 
     * Defaults to: undefined
     * @type string
     * @memberof WithdrawalsApiwalletwithdrawquoteidexecutewithdraw
     */
    quoteId: string
    /**
     * 
     * @type WalletwithdrawquoteidexecutewithdrawRequest
     * @memberof WithdrawalsApiwalletwithdrawquoteidexecutewithdraw
     */
    walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest
}

export interface WithdrawalsApiWalletwithdrawquotequotationRequest {
    /**
     * 
     * @type WalletwithdrawquotequotationRequest
     * @memberof WithdrawalsApiwalletwithdrawquotequotation
     */
    walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest
}

export class ObjectWithdrawalsApi {
    private api: ObservableWithdrawalsApi

    public constructor(configuration: Configuration, requestFactory?: WithdrawalsApiRequestFactory, responseProcessor?: WithdrawalsApiResponseProcessor) {
        this.api = new ObservableWithdrawalsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Get withdrawable balances and supported networks.
     * Balance
     * @param param the request object
     */
    public walletwithdrawbalancebalanceWithHttpInfo(param: WithdrawalsApiWalletwithdrawbalancebalanceRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawbalancebalance200Response>> {
        return this.api.walletwithdrawbalancebalanceWithHttpInfo( options).toPromise();
    }

    /**
     * Get withdrawable balances and supported networks.
     * Balance
     * @param param the request object
     */
    public walletwithdrawbalancebalance(param: WithdrawalsApiWalletwithdrawbalancebalanceRequest = {}, options?: ConfigurationOptions): Promise<Walletwithdrawbalancebalance200Response> {
        return this.api.walletwithdrawbalancebalance( options).toPromise();
    }

    /**
     * Execute a withdrawal using a quote ID.
     * Withdraw
     * @param param the request object
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(param: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        return this.api.walletwithdrawquoteidexecutewithdrawWithHttpInfo(param.quoteId, param.walletwithdrawquoteidexecutewithdrawRequest,  options).toPromise();
    }

    /**
     * Execute a withdrawal using a quote ID.
     * Withdraw
     * @param param the request object
     */
    public walletwithdrawquoteidexecutewithdraw(param: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest, options?: ConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        return this.api.walletwithdrawquoteidexecutewithdraw(param.quoteId, param.walletwithdrawquoteidexecutewithdrawRequest,  options).toPromise();
    }

    /**
     * Get withdrawal quote with fees and estimates.
     * Quotation
     * @param param the request object
     */
    public walletwithdrawquotequotationWithHttpInfo(param: WithdrawalsApiWalletwithdrawquotequotationRequest, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawquotequotation200Response>> {
        return this.api.walletwithdrawquotequotationWithHttpInfo(param.walletwithdrawquotequotationRequest,  options).toPromise();
    }

    /**
     * Get withdrawal quote with fees and estimates.
     * Quotation
     * @param param the request object
     */
    public walletwithdrawquotequotation(param: WithdrawalsApiWalletwithdrawquotequotationRequest, options?: ConfigurationOptions): Promise<Walletwithdrawquotequotation200Response> {
        return this.api.walletwithdrawquotequotation(param.walletwithdrawquotequotationRequest,  options).toPromise();
    }

}
