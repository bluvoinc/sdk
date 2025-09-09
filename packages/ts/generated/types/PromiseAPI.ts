import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, PromiseConfigurationOptions, wrapOptions } from '../configuration'
import { PromiseMiddleware, Middleware, PromiseMiddlewareWrapper } from '../middleware';

import { Oauth2exchangeurlgeturl200Response } from '../models/Oauth2exchangeurlgeturl200Response';
import { Walletdelete200Response } from '../models/Walletdelete200Response';
import { WalletexchangeconnectconnectwalletRequest } from '../models/WalletexchangeconnectconnectwalletRequest';
import { Walletget200Response } from '../models/Walletget200Response';
import { Walletget200ResponseCreatedAt } from '../models/Walletget200ResponseCreatedAt';
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
import { Walletwithdrawbalancebalance404Response } from '../models/Walletwithdrawbalancebalance404Response';
import { Walletwithdrawquoteidexecutewithdraw200Response } from '../models/Walletwithdrawquoteidexecutewithdraw200Response';
import { Walletwithdrawquoteidexecutewithdraw400Response } from '../models/Walletwithdrawquoteidexecutewithdraw400Response';
import { WalletwithdrawquoteidexecutewithdrawRequest } from '../models/WalletwithdrawquoteidexecutewithdrawRequest';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { Walletwithdrawquotequotation400Response } from '../models/Walletwithdrawquotequotation400Response';
import { Walletwithdrawquotequotation404Response } from '../models/Walletwithdrawquotequotation404Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';
import { Workflowworkflowtypegetworkflowrunidget200Response } from '../models/Workflowworkflowtypegetworkflowrunidget200Response';
import { Workflowworkflowtypegetworkflowrunidget200ResponseDetails } from '../models/Workflowworkflowtypegetworkflowrunidget200ResponseDetails';
import { ObservableAPIKeysApi } from './ObservableAPI';

import { APIKeysApiRequestFactory, APIKeysApiResponseProcessor} from "../apis/APIKeysApi";
export class PromiseAPIKeysApi {
    private api: ObservableAPIKeysApi

    public constructor(
        configuration: Configuration,
        requestFactory?: APIKeysApiRequestFactory,
        responseProcessor?: APIKeysApiResponseProcessor
    ) {
        this.api = new ObservableAPIKeysApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * @param walletexchangeconnectconnectwalletRequest
     */
    public walletexchangeconnectconnectwalletWithHttpInfo(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', idem: string, walletexchangeconnectconnectwalletRequest: WalletexchangeconnectconnectwalletRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletexchangeconnectconnectwalletWithHttpInfo(exchange, idem, walletexchangeconnectconnectwalletRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/connect/:exchange\' route. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * @param walletexchangeconnectconnectwalletRequest
     */
    public walletexchangeconnectconnectwallet(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', idem: string, walletexchangeconnectconnectwalletRequest: WalletexchangeconnectconnectwalletRequest, _options?: PromiseConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletexchangeconnectconnectwallet(exchange, idem, walletexchangeconnectconnectwalletRequest, observableOptions);
        return result.toPromise();
    }


}



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
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public oauth2exchangeurlgeturlWithHttpInfo(exchange: 'coinbase' | 'kraken', idem: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Oauth2exchangeurlgeturl200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.oauth2exchangeurlgeturlWithHttpInfo(exchange, idem, observableOptions);
        return result.toPromise();
    }

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response.
     * Get URL
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
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
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     */
    public walletdeleteWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletdelete200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletdeleteWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     */
    public walletdelete(_options?: PromiseConfigurationOptions): Promise<Walletdelete200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletdelete(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     */
    public walletgetWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletget200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletgetWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     */
    public walletget(_options?: PromiseConfigurationOptions): Promise<Walletget200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletget(observableOptions);
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
    public walletlistlistwalletsWithHttpInfo(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletlistlistwallets200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletlistlistwalletsWithHttpInfo(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
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
    public walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: PromiseConfigurationOptions): Promise<Walletlistlistwallets200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletlistlistwallets(page, limit, exchange, createdSince, createdBefore, lastSyncSince, lastSyncBefore, invalidApi, fields, observableOptions);
        return result.toPromise();
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
    public wallettransactionslisttransactionsWithHttpInfo(page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Wallettransactionslisttransactions200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.wallettransactionslisttransactionsWithHttpInfo(page, limit, asset, type, since, before, status, fields, observableOptions);
        return result.toPromise();
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
    public wallettransactionslisttransactions(page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: PromiseConfigurationOptions): Promise<Wallettransactionslisttransactions200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.wallettransactionslisttransactions(page, limit, asset, type, since, before, status, fields, observableOptions);
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
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     */
    public walletwithdrawbalancebalanceWithHttpInfo(_options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawbalancebalance200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawbalancebalanceWithHttpInfo(observableOptions);
        return result.toPromise();
    }

    /**
     * See withdrawable balance of a wallet, and the networks available for each asset given the exchange\'s withdrawal options.
     * Balance
     */
    public walletwithdrawbalancebalance(_options?: PromiseConfigurationOptions): Promise<Walletwithdrawbalancebalance200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawbalancebalance(observableOptions);
        return result.toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param idem Any UUID. This is used to track the Withdrawal flow and can be used to subscribe to updates.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquoteidexecutewithdrawWithHttpInfo(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param idem Any UUID. This is used to track the Withdrawal flow and can be used to subscribe to updates.
     * @param quoteId
     * @param walletwithdrawquoteidexecutewithdrawRequest
     */
    public walletwithdrawquoteidexecutewithdraw(idem: string, quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: PromiseConfigurationOptions): Promise<Walletwithdrawquoteidexecutewithdraw200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquoteidexecutewithdraw(idem, quoteId, walletwithdrawquoteidexecutewithdrawRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: PromiseConfigurationOptions): Promise<HttpInfo<Walletwithdrawquotequotation200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquotequotationWithHttpInfo(walletwithdrawquotequotationRequest, observableOptions);
        return result.toPromise();
    }

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param walletwithdrawquotequotationRequest
     */
    public walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: PromiseConfigurationOptions): Promise<Walletwithdrawquotequotation200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.walletwithdrawquotequotation(walletwithdrawquotequotationRequest, observableOptions);
        return result.toPromise();
    }


}



import { ObservableWorkflowApi } from './ObservableAPI';

import { WorkflowApiRequestFactory, WorkflowApiResponseProcessor} from "../apis/WorkflowApi";
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
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param workflowRunId The unique identifier of the workflow run to query.
     * @param workflowType The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     */
    public workflowworkflowtypegetworkflowrunidgetWithHttpInfo(workflowRunId: string, workflowType: 'connect' | 'withdraw' | 'oauth2', _options?: PromiseConfigurationOptions): Promise<HttpInfo<Workflowworkflowtypegetworkflowrunidget200Response>> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.workflowworkflowtypegetworkflowrunidgetWithHttpInfo(workflowRunId, workflowType, observableOptions);
        return result.toPromise();
    }

    /**
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param workflowRunId The unique identifier of the workflow run to query.
     * @param workflowType The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     */
    public workflowworkflowtypegetworkflowrunidget(workflowRunId: string, workflowType: 'connect' | 'withdraw' | 'oauth2', _options?: PromiseConfigurationOptions): Promise<Workflowworkflowtypegetworkflowrunidget200Response> {
        const observableOptions = wrapOptions(_options);
        const result = this.api.workflowworkflowtypegetworkflowrunidget(workflowRunId, workflowType, observableOptions);
        return result.toPromise();
    }


}



