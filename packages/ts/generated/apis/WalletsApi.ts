// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { Walletdelete200Response } from '../models/Walletdelete200Response';
import { Walletget200Response } from '../models/Walletget200Response';
import { Walletlistlistwallets200Response } from '../models/Walletlistlistwallets200Response';
import { Wallettransactionslisttransactions200Response } from '../models/Wallettransactionslisttransactions200Response';
import { Walletwithdrawbalancebalance404Response } from '../models/Walletwithdrawbalancebalance404Response';

/**
 * no description
 */
export class WalletsApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Delete
     */
    public async walletdelete(_options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // Path Params
        const localVarPath = '/v0/wallet';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.DELETE);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoApiKey"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     */
    public async walletget(_options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // Path Params
        const localVarPath = '/v0/wallet';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoApiKey"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.
     * List Wallets
     * @param page Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param limit Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000.
     * @param exchange Optional. Filter wallets by exchange.
     * @param createdSince Optional. Filter wallets created on or after this date (ISO format).
     * @param createdBefore Optional. Filter wallets created before this date (ISO format).
     * @param lastSyncSince Optional. Filter wallets synchronized on or after this date (ISO format).
     * @param lastSyncBefore Optional. Filter wallets synchronized before this date (ISO format).
     * @param invalidApi Optional. Filter wallets by API validity status.
     * @param fields Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public async walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false', fields?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;










        // Path Params
        const localVarPath = '/v0/wallet/list';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (page !== undefined) {
            requestContext.setQueryParam("page", ObjectSerializer.serialize(page, "number", ""));
        }

        // Query Params
        if (limit !== undefined) {
            requestContext.setQueryParam("limit", ObjectSerializer.serialize(limit, "number", ""));
        }

        // Query Params
        if (exchange !== undefined) {
            requestContext.setQueryParam("exchange", ObjectSerializer.serialize(exchange, "'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda'", ""));
        }

        // Query Params
        if (createdSince !== undefined) {
            requestContext.setQueryParam("createdSince", ObjectSerializer.serialize(createdSince, "string", ""));
        }

        // Query Params
        if (createdBefore !== undefined) {
            requestContext.setQueryParam("createdBefore", ObjectSerializer.serialize(createdBefore, "string", ""));
        }

        // Query Params
        if (lastSyncSince !== undefined) {
            requestContext.setQueryParam("lastSyncSince", ObjectSerializer.serialize(lastSyncSince, "string", ""));
        }

        // Query Params
        if (lastSyncBefore !== undefined) {
            requestContext.setQueryParam("lastSyncBefore", ObjectSerializer.serialize(lastSyncBefore, "string", ""));
        }

        // Query Params
        if (invalidApi !== undefined) {
            requestContext.setQueryParam("invalidApi", ObjectSerializer.serialize(invalidApi, "'true' | 'false'", ""));
        }

        // Query Params
        if (fields !== undefined) {
            requestContext.setQueryParam("fields", ObjectSerializer.serialize(fields, "string", ""));
        }


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoApiKey"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * List Transactions
     * @param page Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param limit Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param asset Optional. Filter transactions by asset symbol.
     * @param type Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param since Optional. Filter transactions created on or after this date (ISO format).
     * @param before Optional. Filter transactions created before this date (ISO format).
     * @param status Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param fields Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public async wallettransactionslisttransactions(page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;









        // Path Params
        const localVarPath = '/v0/wallet/transactions';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (page !== undefined) {
            requestContext.setQueryParam("page", ObjectSerializer.serialize(page, "number", ""));
        }

        // Query Params
        if (limit !== undefined) {
            requestContext.setQueryParam("limit", ObjectSerializer.serialize(limit, "number", ""));
        }

        // Query Params
        if (asset !== undefined) {
            requestContext.setQueryParam("asset", ObjectSerializer.serialize(asset, "string", ""));
        }

        // Query Params
        if (type !== undefined) {
            requestContext.setQueryParam("type", ObjectSerializer.serialize(type, "string", ""));
        }

        // Query Params
        if (since !== undefined) {
            requestContext.setQueryParam("since", ObjectSerializer.serialize(since, "string", ""));
        }

        // Query Params
        if (before !== undefined) {
            requestContext.setQueryParam("before", ObjectSerializer.serialize(before, "string", ""));
        }

        // Query Params
        if (status !== undefined) {
            requestContext.setQueryParam("status", ObjectSerializer.serialize(status, "string", ""));
        }

        // Query Params
        if (fields !== undefined) {
            requestContext.setQueryParam("fields", ObjectSerializer.serialize(fields, "string", ""));
        }


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoApiKey"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class WalletsApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletdelete
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletdeleteWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletdelete200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletdelete200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletdelete200Response", ""
            ) as Walletdelete200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletwithdrawbalancebalance404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawbalancebalance404Response", ""
            ) as Walletwithdrawbalancebalance404Response;
            throw new ApiException<Walletwithdrawbalancebalance404Response>(response.httpStatusCode, "Not Found", body, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Walletdelete200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletdelete200Response", ""
            ) as Walletdelete200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletget
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletgetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletget200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletget200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget200Response", ""
            ) as Walletget200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletwithdrawbalancebalance404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawbalancebalance404Response", ""
            ) as Walletwithdrawbalancebalance404Response;
            throw new ApiException<Walletwithdrawbalancebalance404Response>(response.httpStatusCode, "Not Found", body, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Walletget200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget200Response", ""
            ) as Walletget200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletlistlistwallets
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletlistlistwalletsWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletlistlistwallets200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletlistlistwallets200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletlistlistwallets200Response", ""
            ) as Walletlistlistwallets200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Walletlistlistwallets200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletlistlistwallets200Response", ""
            ) as Walletlistlistwallets200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to wallettransactionslisttransactions
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async wallettransactionslisttransactionsWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Wallettransactionslisttransactions200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Wallettransactionslisttransactions200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Wallettransactionslisttransactions200Response", ""
            ) as Wallettransactionslisttransactions200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Wallettransactionslisttransactions200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Wallettransactionslisttransactions200Response", ""
            ) as Wallettransactionslisttransactions200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
