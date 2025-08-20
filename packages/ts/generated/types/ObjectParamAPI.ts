import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions } from '../configuration'
import type { Middleware } from '../middleware';

import { Oauth2exchangeurlgeturl200Response } from '../models/Oauth2exchangeurlgeturl200Response';
import { Ottgenerate200Response } from '../models/Ottgenerate200Response';
import { Ottgenerate200ResponseTopic } from '../models/Ottgenerate200ResponseTopic';
import { Walletdelete200Response } from '../models/Walletdelete200Response';
import { WalletexchangeconnectconnectwalletRequest } from '../models/WalletexchangeconnectconnectwalletRequest';
import { Walletget200Response } from '../models/Walletget200Response';
import { Walletlistlistwallets200Response } from '../models/Walletlistlistwallets200Response';
import { Walletlistlistwallets200ResponsePagination } from '../models/Walletlistlistwallets200ResponsePagination';
import { Walletlistlistwallets200ResponseWalletsInner } from '../models/Walletlistlistwallets200ResponseWalletsInner';
import { Walletlistlistwallets200ResponseWalletsInnerBalancesValue } from '../models/Walletlistlistwallets200ResponseWalletsInnerBalancesValue';
import { Walletlistlistwallets200ResponseWalletsInnerBalancesValueAnyOf } from '../models/Walletlistlistwallets200ResponseWalletsInnerBalancesValueAnyOf';
import { Walletlistlistwallets200ResponseWalletsInnerCreatedAt } from '../models/Walletlistlistwallets200ResponseWalletsInnerCreatedAt';
import { Walletlistlistwallets200ResponseWalletsInnerInvalidApi } from '../models/Walletlistlistwallets200ResponseWalletsInnerInvalidApi';
import { Wallettransactionslisttransactions200Response } from '../models/Wallettransactionslisttransactions200Response';
import { Wallettransactionslisttransactions200ResponseTransactionsInner } from '../models/Wallettransactionslisttransactions200ResponseTransactionsInner';
import { Walletwithdrawbalancebalance200Response } from '../models/Walletwithdrawbalancebalance200Response';
import { Walletwithdrawbalancebalance200ResponseBalancesInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInner';
import { Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner } from '../models/Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner';
import { Walletwithdrawquoteidexecutewithdraw200Response } from '../models/Walletwithdrawquoteidexecutewithdraw200Response';
import { WalletwithdrawquoteidexecutewithdrawRequest } from '../models/WalletwithdrawquoteidexecutewithdrawRequest';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';
import { Workflowworkflowtypegetworkflowrunidget200Response } from '../models/Workflowworkflowtypegetworkflowrunidget200Response';
import { Workflowworkflowtypegetworkflowrunidget200ResponseDetails } from '../models/Workflowworkflowtypegetworkflowrunidget200ResponseDetails';

import { ObservableAPIKeysApi } from "./ObservableAPI";
import { APIKeysApiRequestFactory, APIKeysApiResponseProcessor} from "../apis/APIKeysApi";

export interface APIKeysApiWalletexchangeconnectconnectwalletRequest {
    /**
     * The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bybit&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;
     * @memberof APIKeysApiwalletexchangeconnectconnectwallet
     */
    exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'
    /**
     * The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * Defaults to: undefined
     * @type string
     * @memberof APIKeysApiwalletexchangeconnectconnectwallet
     */
    idem: string
    /**
     * 
     * @type WalletexchangeconnectconnectwalletRequest
     * @memberof APIKeysApiwalletexchangeconnectconnectwallet
     */
    walletexchangeconnectconnectwalletRequest: WalletexchangeconnectconnectwalletRequest
}

export class ObjectAPIKeysApi {
    private api: ObservableAPIKeysApi

    public constructor(configuration: Configuration, requestFactory?: APIKeysApiRequestFactory, responseProcessor?: APIKeysApiResponseProcessor) {
        this.api = new ObservableAPIKeysApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param param the request object
     */
    public walletexchangeconnectconnectwalletWithHttpInfo(param: APIKeysApiWalletexchangeconnectconnectwalletRequest, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        return this.api.walletexchangeconnectconnectwalletWithHttpInfo(param.exchange, param.idem, param.walletexchangeconnectconnectwalletRequest,  options).toPromise();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param param the request object
     */
    public walletexchangeconnectconnectwallet(param: APIKeysApiWalletexchangeconnectconnectwalletRequest, options?: ConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        return this.api.walletexchangeconnectconnectwallet(param.exchange, param.idem, param.walletexchangeconnectconnectwalletRequest,  options).toPromise();
    }

}

import { ObservableOAuth2Api } from "./ObservableAPI";
import { OAuth2ApiRequestFactory, OAuth2ApiResponseProcessor} from "../apis/OAuth2Api";

export interface OAuth2ApiOauth2exchangeurlgeturlRequest {
    /**
     * The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * Defaults to: undefined
     * @type &#39;coinbase&#39; | &#39;kraken&#39;
     * @memberof OAuth2Apioauth2exchangeurlgeturl
     */
    exchange: 'coinbase' | 'kraken'
    /**
     * The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
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
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param param the request object
     */
    public oauth2exchangeurlgeturlWithHttpInfo(param: OAuth2ApiOauth2exchangeurlgeturlRequest, options?: ConfigurationOptions): Promise<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
        return this.api.oauth2exchangeurlgeturlWithHttpInfo(param.exchange, param.idem,  options).toPromise();
    }

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param param the request object
     */
    public oauth2exchangeurlgeturl(param: OAuth2ApiOauth2exchangeurlgeturlRequest, options?: ConfigurationOptions): Promise<Oauth2exchangeurlgeturl200Response> {
        return this.api.oauth2exchangeurlgeturl(param.exchange, param.idem,  options).toPromise();
    }

}

import { ObservableOneTimeTokenApi } from "./ObservableAPI";
import { OneTimeTokenApiRequestFactory, OneTimeTokenApiResponseProcessor} from "../apis/OneTimeTokenApi";

export interface OneTimeTokenApiOttgenerateRequest {
    /**
     * Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints.
     * Defaults to: undefined
     * @type &#39;true&#39; | &#39;false&#39;
     * @memberof OneTimeTokenApiottgenerate
     */
    wantOtt?: 'true' | 'false'
    /**
     * Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates.
     * Defaults to: undefined
     * @type &#39;true&#39; | &#39;false&#39;
     * @memberof OneTimeTokenApiottgenerate
     */
    wantSubscribe?: 'true' | 'false'
}

export class ObjectOneTimeTokenApi {
    private api: ObservableOneTimeTokenApi

    public constructor(configuration: Configuration, requestFactory?: OneTimeTokenApiRequestFactory, responseProcessor?: OneTimeTokenApiResponseProcessor) {
        this.api = new ObservableOneTimeTokenApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.
     * Generate
     * @param param the request object
     */
    public ottgenerateWithHttpInfo(param: OneTimeTokenApiOttgenerateRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Ottgenerate200Response>> {
        return this.api.ottgenerateWithHttpInfo(param.wantOtt, param.wantSubscribe,  options).toPromise();
    }

    /**
     * Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.
     * Generate
     * @param param the request object
     */
    public ottgenerate(param: OneTimeTokenApiOttgenerateRequest = {}, options?: ConfigurationOptions): Promise<Ottgenerate200Response> {
        return this.api.ottgenerate(param.wantOtt, param.wantSubscribe,  options).toPromise();
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
     * Optional. Page number for pagination (0-indexed). Defaults to 0.
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwalletlistlistwallets
     */
    page?: number
    /**
     * Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwalletlistlistwallets
     */
    limit?: number
    /**
     * Optional. Filter wallets by exchange.
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bybit&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;
     * @memberof WalletsApiwalletlistlistwallets
     */
    exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'
    /**
     * Optional. Filter wallets created on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    createdSince?: string
    /**
     * Optional. Filter wallets created before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    createdBefore?: string
    /**
     * Optional. Filter wallets synchronized on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    lastSyncSince?: string
    /**
     * Optional. Filter wallets synchronized before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    lastSyncBefore?: string
    /**
     * Optional. Filter wallets by API validity status.
     * Defaults to: undefined
     * @type &#39;true&#39; | &#39;false&#39;
     * @memberof WalletsApiwalletlistlistwallets
     */
    invalidApi?: 'true' | 'false'
    /**
     * Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwalletlistlistwallets
     */
    fields?: string
}

export interface WalletsApiWallettransactionslisttransactionsRequest {
    /**
     * Optional. Page number for pagination (0-indexed). Defaults to 0.
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    page?: number
    /**
     * Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    limit?: number
    /**
     * Optional. Filter transactions by asset symbol.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    asset?: string
    /**
     * Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    type?: string
    /**
     * Optional. Filter transactions created on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    since?: string
    /**
     * Optional. Filter transactions created before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    before?: string
    /**
     * Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    status?: string
    /**
     * Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApiwallettransactionslisttransactions
     */
    fields?: string
}

export class ObjectWalletsApi {
    private api: ObservableWalletsApi

    public constructor(configuration: Configuration, requestFactory?: WalletsApiRequestFactory, responseProcessor?: WalletsApiResponseProcessor) {
        this.api = new ObservableWalletsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     * @param param the request object
     */
    public walletdeleteWithHttpInfo(param: WalletsApiWalletdeleteRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletdelete200Response>> {
        return this.api.walletdeleteWithHttpInfo( options).toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     * @param param the request object
     */
    public walletdelete(param: WalletsApiWalletdeleteRequest = {}, options?: ConfigurationOptions): Promise<Walletdelete200Response> {
        return this.api.walletdelete( options).toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param param the request object
     */
    public walletgetWithHttpInfo(param: WalletsApiWalletgetRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletget200Response>> {
        return this.api.walletgetWithHttpInfo( options).toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param param the request object
     */
    public walletget(param: WalletsApiWalletgetRequest = {}, options?: ConfigurationOptions): Promise<Walletget200Response> {
        return this.api.walletget( options).toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param param the request object
     */
    public walletlistlistwalletsWithHttpInfo(param: WalletsApiWalletlistlistwalletsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletlistlistwallets200Response>> {
        return this.api.walletlistlistwalletsWithHttpInfo(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param param the request object
     */
    public walletlistlistwallets(param: WalletsApiWalletlistlistwalletsRequest = {}, options?: ConfigurationOptions): Promise<Walletlistlistwallets200Response> {
        return this.api.walletlistlistwallets(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * List Transactions
     * @param param the request object
     */
    public wallettransactionslisttransactionsWithHttpInfo(param: WalletsApiWallettransactionslisttransactionsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Wallettransactionslisttransactions200Response>> {
        return this.api.wallettransactionslisttransactionsWithHttpInfo(param.page, param.limit, param.asset, param.type, param.since, param.before, param.status, param.fields,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * List Transactions
     * @param param the request object
     */
    public wallettransactionslisttransactions(param: WalletsApiWallettransactionslisttransactionsRequest = {}, options?: ConfigurationOptions): Promise<Wallettransactionslisttransactions200Response> {
        return this.api.wallettransactionslisttransactions(param.page, param.limit, param.asset, param.type, param.since, param.before, param.status, param.fields,  options).toPromise();
    }

}

import { ObservableWithdrawalsApi } from "./ObservableAPI";
import { WithdrawalsApiRequestFactory, WithdrawalsApiResponseProcessor} from "../apis/WithdrawalsApi";

export interface WithdrawalsApiWalletwithdrawbalancebalanceRequest {
}

export interface WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest {
    /**
     * The idem provided by OTT or used to identify the workflow run. This is used to track the Withdrawal flow and can be used to subscribe to updates.
     * Defaults to: undefined
     * @type string
     * @memberof WithdrawalsApiwalletwithdrawquoteidexecutewithdraw
     */
    idem: string
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
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     * @param param the request object
     */
    public walletwithdrawbalancebalanceWithHttpInfo(param: WithdrawalsApiWalletwithdrawbalancebalanceRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawbalancebalance200Response>> {
        return this.api.walletwithdrawbalancebalanceWithHttpInfo( options).toPromise();
    }

    /**
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     * @param param the request object
     */
    public walletwithdrawbalancebalance(param: WithdrawalsApiWalletwithdrawbalancebalanceRequest = {}, options?: ConfigurationOptions): Promise<Walletwithdrawbalancebalance200Response> {
        return this.api.walletwithdrawbalancebalance( options).toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param param the request object
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(param: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        return this.api.walletwithdrawquoteidexecutewithdrawWithHttpInfo(param.idem, param.quoteId, param.walletwithdrawquoteidexecutewithdrawRequest,  options).toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param param the request object
     */
    public walletwithdrawquoteidexecutewithdraw(param: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest, options?: ConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        return this.api.walletwithdrawquoteidexecutewithdraw(param.idem, param.quoteId, param.walletwithdrawquoteidexecutewithdrawRequest,  options).toPromise();
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param param the request object
     */
    public walletwithdrawquotequotationWithHttpInfo(param: WithdrawalsApiWalletwithdrawquotequotationRequest, options?: ConfigurationOptions): Promise<HttpInfo<Walletwithdrawquotequotation200Response>> {
        return this.api.walletwithdrawquotequotationWithHttpInfo(param.walletwithdrawquotequotationRequest,  options).toPromise();
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param param the request object
     */
    public walletwithdrawquotequotation(param: WithdrawalsApiWalletwithdrawquotequotationRequest, options?: ConfigurationOptions): Promise<Walletwithdrawquotequotation200Response> {
        return this.api.walletwithdrawquotequotation(param.walletwithdrawquotequotationRequest,  options).toPromise();
    }

}

import { ObservableWorkflowApi } from "./ObservableAPI";
import { WorkflowApiRequestFactory, WorkflowApiResponseProcessor} from "../apis/WorkflowApi";

export interface WorkflowApiWorkflowworkflowtypegetworkflowrunidgetRequest {
    /**
     * The unique identifier of the workflow run to query.
     * Defaults to: undefined
     * @type string
     * @memberof WorkflowApiworkflowworkflowtypegetworkflowrunidget
     */
    workflowRunId: string
    /**
     * The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     * Defaults to: undefined
     * @type &#39;connect&#39; | &#39;withdraw&#39; | &#39;oauth2&#39;
     * @memberof WorkflowApiworkflowworkflowtypegetworkflowrunidget
     */
    workflowType: 'connect' | 'withdraw' | 'oauth2'
}

export class ObjectWorkflowApi {
    private api: ObservableWorkflowApi

    public constructor(configuration: Configuration, requestFactory?: WorkflowApiRequestFactory, responseProcessor?: WorkflowApiResponseProcessor) {
        this.api = new ObservableWorkflowApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param param the request object
     */
    public workflowworkflowtypegetworkflowrunidgetWithHttpInfo(param: WorkflowApiWorkflowworkflowtypegetworkflowrunidgetRequest, options?: ConfigurationOptions): Promise<HttpInfo<Workflowworkflowtypegetworkflowrunidget200Response>> {
        return this.api.workflowworkflowtypegetworkflowrunidgetWithHttpInfo(param.workflowRunId, param.workflowType,  options).toPromise();
    }

    /**
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param param the request object
     */
    public workflowworkflowtypegetworkflowrunidget(param: WorkflowApiWorkflowworkflowtypegetworkflowrunidgetRequest, options?: ConfigurationOptions): Promise<Workflowworkflowtypegetworkflowrunidget200Response> {
        return this.api.workflowworkflowtypegetworkflowrunidget(param.workflowRunId, param.workflowType,  options).toPromise();
    }

}
