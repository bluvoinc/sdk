import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions } from '../configuration'
import type { Middleware } from '../middleware';

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

import { ObservableBasicApi } from "./ObservableAPI";
import { BasicApiRequestFactory, BasicApiResponseProcessor} from "../apis/BasicApi";

export interface BasicApiAssetRequest {
    /**
     * The asset symbol to query (e.g. BTC, ETH).
     * Defaults to: undefined
     * @type string
     * @memberof BasicApiasset
     */
    asset: string
    /**
     * Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant).
     * Defaults to: undefined
     * @type &#39;false&#39; | &#39;32&#39; | &#39;64&#39; | &#39;128&#39;
     * @memberof BasicApiasset
     */
    img?: 'false' | '32' | '64' | '128'
}

export interface BasicApiListAssetsRequest {
    /**
     * Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant).
     * Defaults to: undefined
     * @type &#39;false&#39; | &#39;32&#39; | &#39;64&#39; | &#39;128&#39;
     * @memberof BasicApilistAssets
     */
    img?: 'false' | '32' | '64' | '128'
    /**
     * Optional. Page number for pagination (0-indexed). Defaults to 0.
     * Minimum: 0
     * Maximum: 20000
     * Defaults to: undefined
     * @type number
     * @memberof BasicApilistAssets
     */
    page?: number
    /**
     * Optional. Maximum number of assets to return per page. Defaults to 100.
     * Minimum: 0
     * Maximum: 100
     * Defaults to: undefined
     * @type number
     * @memberof BasicApilistAssets
     */
    limit?: number
}

export interface BasicApiListPairsRequest {
    /**
     * The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;
     * @memberof BasicApilistPairs
     */
    exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'
}

export class ObjectBasicApi {
    private api: ObservableBasicApi

    public constructor(configuration: Configuration, requestFactory?: BasicApiRequestFactory, responseProcessor?: BasicApiResponseProcessor) {
        this.api = new ObservableBasicApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param param the request object
     */
    public assetWithHttpInfo(param: BasicApiAssetRequest, options?: ConfigurationOptions): Promise<HttpInfo<Asset200Response>> {
        return this.api.assetWithHttpInfo(param.asset, param.img,  options).toPromise();
    }

    /**
     * Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.
     * Asset
     * @param param the request object
     */
    public asset(param: BasicApiAssetRequest, options?: ConfigurationOptions): Promise<Asset200Response> {
        return this.api.asset(param.asset, param.img,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param param the request object
     */
    public listAssetsWithHttpInfo(param: BasicApiListAssetsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<ListAssets200Response>> {
        return this.api.listAssetsWithHttpInfo(param.img, param.page, param.limit,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.
     * List Assets
     * @param param the request object
     */
    public listAssets(param: BasicApiListAssetsRequest = {}, options?: ConfigurationOptions): Promise<ListAssets200Response> {
        return this.api.listAssets(param.img, param.page, param.limit,  options).toPromise();
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param param the request object
     */
    public listPairsWithHttpInfo(param: BasicApiListPairsRequest, options?: ConfigurationOptions): Promise<HttpInfo<ListPairs200Response>> {
        return this.api.listPairsWithHttpInfo(param.exchange,  options).toPromise();
    }

    /**
     * Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.
     * List Pairs
     * @param param the request object
     */
    public listPairs(param: BasicApiListPairsRequest, options?: ConfigurationOptions): Promise<ListPairs200Response> {
        return this.api.listPairs(param.exchange,  options).toPromise();
    }

}

import { ObservablePricesApi } from "./ObservableAPI";
import { PricesApiRequestFactory, PricesApiResponseProcessor} from "../apis/PricesApi";

export interface PricesApiCandlesticksRequest {
    /**
     * The asset symbol to retrieve candlestick data for (e.g. BTC, ETH).
     * Defaults to: undefined
     * @type string
     * @memberof PricesApicandlesticks
     */
    asset: string
    /**
     * The quote currency used in the trading pair (e.g. USDT).
     * Defaults to: undefined
     * @type &#39;USDT&#39;
     * @memberof PricesApicandlesticks
     */
    quote: 'USDT'
    /**
     * Optional. The start timestamp (in UNIX milliseconds) for the candlestick data range.
     * Minimum: 0
     * Defaults to: undefined
     * @type number
     * @memberof PricesApicandlesticks
     */
    since?: number
    /**
     * Optional. The end timestamp (in UNIX milliseconds) for the candlestick data range.
     * Minimum: 0
     * Defaults to: undefined
     * @type number
     * @memberof PricesApicandlesticks
     */
    until?: number
    /**
     * Optional. The exchange from which to retrieve candlestick data. Defaults to \&#39;binance\&#39;.
     * Defaults to: undefined
     * @type &#39;binance&#39; | &#39;kraken&#39; | &#39;bitget&#39; | &#39;bitmart&#39; | &#39;bybit&#39; | &#39;coinbase&#39; | &#39;cryptocom&#39; | &#39;gateio&#39; | &#39;kraken&#39; | &#39;kucoin&#39; | &#39;okx&#39;
     * @memberof PricesApicandlesticks
     */
    exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx'
    /**
     * Optional. The time interval for each candlestick. Allowed values include \&#39;1m\&#39;, \&#39;15m\&#39;, \&#39;30m\&#39;, \&#39;1h\&#39;, \&#39;4h\&#39;, \&#39;1d\&#39;.
     * Defaults to: undefined
     * @type &#39;1h&#39;
     * @memberof PricesApicandlesticks
     */
    granularity?: '1h'
}

export class ObjectPricesApi {
    private api: ObservablePricesApi

    public constructor(configuration: Configuration, requestFactory?: PricesApiRequestFactory, responseProcessor?: PricesApiResponseProcessor) {
        this.api = new ObservablePricesApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Fetch historical candlestick (OHLCV) data for a given asset and quote currency. You may optionally filter the data using query parameters: \'since\' and \'until\' for the time range, \'exchange\' to specify the data source, and \'granularity\' to set the time interval for each candlestick.
     * Candlesticks
     * @param param the request object
     */
    public candlesticksWithHttpInfo(param: PricesApiCandlesticksRequest, options?: ConfigurationOptions): Promise<HttpInfo<Array<Array<any>>>> {
        return this.api.candlesticksWithHttpInfo(param.asset, param.quote, param.since, param.until, param.exchange, param.granularity,  options).toPromise();
    }

    /**
     * Fetch historical candlestick (OHLCV) data for a given asset and quote currency. You may optionally filter the data using query parameters: \'since\' and \'until\' for the time range, \'exchange\' to specify the data source, and \'granularity\' to set the time interval for each candlestick.
     * Candlesticks
     * @param param the request object
     */
    public candlesticks(param: PricesApiCandlesticksRequest, options?: ConfigurationOptions): Promise<Array<Array<any>>> {
        return this.api.candlesticks(param.asset, param.quote, param.since, param.until, param.exchange, param.granularity,  options).toPromise();
    }

}

import { ObservableTransactionsApi } from "./ObservableAPI";
import { TransactionsApiRequestFactory, TransactionsApiResponseProcessor} from "../apis/TransactionsApi";

export interface TransactionsApiWalletTransactionsRequest {
    /**
     * The unique identifier of the connected wallet to query transactions for.
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    walletId: string
    /**
     * Optional. Page number for pagination (0-indexed). Defaults to 0.
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof TransactionsApiwalletTransactions
     */
    page?: number
    /**
     * Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof TransactionsApiwalletTransactions
     */
    limit?: number
    /**
     * Optional. Filter transactions by asset symbol.
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    asset?: string
    /**
     * Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    type?: string
    /**
     * Optional. Filter transactions created on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    since?: string
    /**
     * Optional. Filter transactions created before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    before?: string
    /**
     * Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    status?: string
    /**
     * Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwalletTransactions
     */
    fields?: string
}

export interface TransactionsApiWithdrawFundsRequest {
    /**
     * The unique identifier of the wallet to withdraw funds from.
     * Defaults to: undefined
     * @type string
     * @memberof TransactionsApiwithdrawFunds
     */
    walletId: string
    /**
     * 
     * @type WithdrawFundsRequest
     * @memberof TransactionsApiwithdrawFunds
     */
    withdrawFundsRequest: WithdrawFundsRequest
}

export class ObjectTransactionsApi {
    private api: ObservableTransactionsApi

    public constructor(configuration: Configuration, requestFactory?: TransactionsApiRequestFactory, responseProcessor?: TransactionsApiResponseProcessor) {
        this.api = new ObservableTransactionsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * Wallet Transactions
     * @param param the request object
     */
    public walletTransactionsWithHttpInfo(param: TransactionsApiWalletTransactionsRequest, options?: ConfigurationOptions): Promise<HttpInfo<WalletTransactions200Response>> {
        return this.api.walletTransactionsWithHttpInfo(param.walletId, param.page, param.limit, param.asset, param.type, param.since, param.before, param.status, param.fields,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * Wallet Transactions
     * @param param the request object
     */
    public walletTransactions(param: TransactionsApiWalletTransactionsRequest, options?: ConfigurationOptions): Promise<WalletTransactions200Response> {
        return this.api.walletTransactions(param.walletId, param.page, param.limit, param.asset, param.type, param.since, param.before, param.status, param.fields,  options).toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint requires authentication via a valid Bluvo API Key. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds
     * @param param the request object
     */
    public withdrawFundsWithHttpInfo(param: TransactionsApiWithdrawFundsRequest, options?: ConfigurationOptions): Promise<HttpInfo<WithdrawFunds200Response>> {
        return this.api.withdrawFundsWithHttpInfo(param.walletId, param.withdrawFundsRequest,  options).toPromise();
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint requires authentication via a valid Bluvo API Key. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds
     * @param param the request object
     */
    public withdrawFunds(param: TransactionsApiWithdrawFundsRequest, options?: ConfigurationOptions): Promise<WithdrawFunds200Response> {
        return this.api.withdrawFunds(param.walletId, param.withdrawFundsRequest,  options).toPromise();
    }

}

import { ObservableWalletsApi } from "./ObservableAPI";
import { WalletsApiRequestFactory, WalletsApiResponseProcessor} from "../apis/WalletsApi";

export interface WalletsApiConnectWalletRequest {
    /**
     * The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;
     * @memberof WalletsApiconnectWallet
     */
    exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'
    /**
     * 
     * @type ConnectWalletRequest
     * @memberof WalletsApiconnectWallet
     */
    connectWalletRequest: ConnectWalletRequest
}

export interface WalletsApiDeleteWalletRequest {
    /**
     * The unique identifier of the connected wallet to delete.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApideleteWallet
     */
    walletId: string
}

export interface WalletsApiGetWalletRequest {
    /**
     * The unique identifier of the connected wallet to query.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApigetWallet
     */
    walletId: string
}

export interface WalletsApiListWalletsRequest {
    /**
     * Optional. Page number for pagination (0-indexed). Defaults to 0.
     * Minimum: 0
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApilistWallets
     */
    page?: number
    /**
     * Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
     * Minimum: 1
     * Maximum: 1000
     * Defaults to: undefined
     * @type number
     * @memberof WalletsApilistWallets
     */
    limit?: number
    /**
     * Optional. Filter wallets by exchange.
     * Defaults to: undefined
     * @type &#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;
     * @memberof WalletsApilistWallets
     */
    exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'
    /**
     * Optional. Filter wallets created on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApilistWallets
     */
    createdSince?: string
    /**
     * Optional. Filter wallets created before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApilistWallets
     */
    createdBefore?: string
    /**
     * Optional. Filter wallets synchronized on or after this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApilistWallets
     */
    lastSyncSince?: string
    /**
     * Optional. Filter wallets synchronized before this date (ISO format).
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApilistWallets
     */
    lastSyncBefore?: string
    /**
     * Optional. Filter wallets by API validity status.
     * Defaults to: undefined
     * @type &#39;true&#39; | &#39;false&#39;
     * @memberof WalletsApilistWallets
     */
    invalidApi?: 'true' | 'false'
    /**
     * Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     * Defaults to: undefined
     * @type string
     * @memberof WalletsApilistWallets
     */
    fields?: string
}

export class ObjectWalletsApi {
    private api: ObservableWalletsApi

    public constructor(configuration: Configuration, requestFactory?: WalletsApiRequestFactory, responseProcessor?: WalletsApiResponseProcessor) {
        this.api = new ObservableWalletsApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param param the request object
     */
    public connectWalletWithHttpInfo(param: WalletsApiConnectWalletRequest, options?: ConfigurationOptions): Promise<HttpInfo<ConnectWallet200Response>> {
        return this.api.connectWalletWithHttpInfo(param.exchange, param.connectWalletRequest,  options).toPromise();
    }

    /**
     * Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet
     * @param param the request object
     */
    public connectWallet(param: WalletsApiConnectWalletRequest, options?: ConfigurationOptions): Promise<ConnectWallet200Response> {
        return this.api.connectWallet(param.exchange, param.connectWalletRequest,  options).toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param param the request object
     */
    public deleteWalletWithHttpInfo(param: WalletsApiDeleteWalletRequest, options?: ConfigurationOptions): Promise<HttpInfo<DeleteWallet200Response>> {
        return this.api.deleteWalletWithHttpInfo(param.walletId,  options).toPromise();
    }

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete Wallet
     * @param param the request object
     */
    public deleteWallet(param: WalletsApiDeleteWalletRequest, options?: ConfigurationOptions): Promise<DeleteWallet200Response> {
        return this.api.deleteWallet(param.walletId,  options).toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param param the request object
     */
    public getWalletWithHttpInfo(param: WalletsApiGetWalletRequest, options?: ConfigurationOptions): Promise<HttpInfo<GetWallet200Response>> {
        return this.api.getWalletWithHttpInfo(param.walletId,  options).toPromise();
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Wallet
     * @param param the request object
     */
    public getWallet(param: WalletsApiGetWalletRequest, options?: ConfigurationOptions): Promise<GetWallet200Response> {
        return this.api.getWallet(param.walletId,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param param the request object
     */
    public listWalletsWithHttpInfo(param: WalletsApiListWalletsRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<ListWallets200Response>> {
        return this.api.listWalletsWithHttpInfo(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param param the request object
     */
    public listWallets(param: WalletsApiListWalletsRequest = {}, options?: ConfigurationOptions): Promise<ListWallets200Response> {
        return this.api.listWallets(param.page, param.limit, param.exchange, param.createdSince, param.createdBefore, param.lastSyncSince, param.lastSyncBefore, param.invalidApi, param.fields,  options).toPromise();
    }

}

import { ObservableWorkflowApi } from "./ObservableAPI";
import { WorkflowApiRequestFactory, WorkflowApiResponseProcessor} from "../apis/WorkflowApi";

export interface WorkflowApiGetWorkflowRequest {
    /**
     * The unique identifier of the workflow run to query.
     * Defaults to: undefined
     * @type string
     * @memberof WorkflowApigetWorkflow
     */
    workflowRunId: string
}

export class ObjectWorkflowApi {
    private api: ObservableWorkflowApi

    public constructor(configuration: Configuration, requestFactory?: WorkflowApiRequestFactory, responseProcessor?: WorkflowApiResponseProcessor) {
        this.api = new ObservableWorkflowApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param param the request object
     */
    public getWorkflowWithHttpInfo(param: WorkflowApiGetWorkflowRequest, options?: ConfigurationOptions): Promise<HttpInfo<GetWorkflow200Response>> {
        return this.api.getWorkflowWithHttpInfo(param.workflowRunId,  options).toPromise();
    }

    /**
     * Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get Workflow
     * @param param the request object
     */
    public getWorkflow(param: WorkflowApiGetWorkflowRequest, options?: ConfigurationOptions): Promise<GetWorkflow200Response> {
        return this.api.getWorkflow(param.workflowRunId,  options).toPromise();
    }

}
