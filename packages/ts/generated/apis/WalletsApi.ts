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
import { Walletget403Response } from '../models/Walletget403Response';
import { Walletget404Response } from '../models/Walletget404Response';
import { Walletlistlistwallets200Response } from '../models/Walletlistlistwallets200Response';
import { Walletpingping200Response } from '../models/Walletpingping200Response';
import { Wallettransactionslisttransactions200Response } from '../models/Wallettransactionslisttransactions200Response';

/**
 * no description
 */
export class WalletsApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Delete a connected exchange wallet.  **Required API Key Scopes:** `read`, `delete`
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
     * Get wallet information and balances.  **Required API Key Scopes:** `read`
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
     * List all connected exchange wallets.  **Required API Key Scopes:** `read`
     * List Wallets
     * @param page Page number (0-indexed).
     * @param limit Number of wallets per page (max 1000).
     * @param exchange Filter by exchange.
     * @param createdSince Filter by creation date (from, ISO format).
     * @param createdBefore Filter by creation date (before, ISO format).
     * @param lastSyncSince Filter by last sync date (from, ISO format).
     * @param lastSyncBefore Filter by last sync date (before, ISO format).
     * @param invalidApi Filter by API validity status.
     * @param fields Comma-separated list of fields to include.
     */
    public async walletlistlistwallets(page?: number, limit?: number, exchange?: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'local-cex' | 'null', createdSince?: string, createdBefore?: string, lastSyncSince?: string, lastSyncBefore?: string, invalidApi?: 'true' | 'false' | 'null', fields?: string, _options?: Configuration): Promise<RequestContext> {
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
            requestContext.setQueryParam("exchange", ObjectSerializer.serialize(exchange, "'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bybit' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda' | 'local-cex' | 'null'", ""));
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
            requestContext.setQueryParam("invalidApi", ObjectSerializer.serialize(invalidApi, "'true' | 'false' | 'null'", ""));
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
     * Test wallet connectivity and validate exchange API credentials. This endpoint verifies that the stored credentials are valid by making a test API call to the exchange.  **Required API Key Scopes:** `read`
     * Ping
     */
    public async walletpingping(_options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // Path Params
        const localVarPath = '/v0/wallet/ping';

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
     * List transactions for a specific wallet or all wallets with filtering options.  **Required API Key Scopes:** `read`
     * List Transactions
     * @param walletId The wallet ID to list transactions for. If not provided, returns transactions for all wallets.
     * @param page Page number (0-indexed).
     * @param limit Number of transactions per page (max 1000).
     * @param sinceDate Filter transactions after this date (ISO format).
     */
    public async wallettransactionslisttransactions(walletId?: string, page?: number, limit?: number, sinceDate?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;





        // Path Params
        const localVarPath = '/v0/wallet/transactions';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (walletId !== undefined) {
            requestContext.setQueryParam("walletId", ObjectSerializer.serialize(walletId, "string", ""));
        }

        // Query Params
        if (page !== undefined) {
            requestContext.setQueryParam("page", ObjectSerializer.serialize(page, "number", ""));
        }

        // Query Params
        if (limit !== undefined) {
            requestContext.setQueryParam("limit", ObjectSerializer.serialize(limit, "number", ""));
        }

        // Query Params
        if (sinceDate !== undefined) {
            requestContext.setQueryParam("sinceDate", ObjectSerializer.serialize(sinceDate, "string", ""));
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
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletget404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget404Response", ""
            ) as Walletget404Response;
            throw new ApiException<Walletget404Response>(response.httpStatusCode, "Not Found", body, response.headers);
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
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletget404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget404Response", ""
            ) as Walletget404Response;
            throw new ApiException<Walletget404Response>(response.httpStatusCode, "Not Found", body, response.headers);
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
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
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
     * @params response Response returned by the server for a request to walletpingping
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletpingpingWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletpingping200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletpingping200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletpingping200Response", ""
            ) as Walletpingping200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletget404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget404Response", ""
            ) as Walletget404Response;
            throw new ApiException<Walletget404Response>(response.httpStatusCode, "Not Found", body, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Walletpingping200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletpingping200Response", ""
            ) as Walletpingping200Response;
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
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
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
