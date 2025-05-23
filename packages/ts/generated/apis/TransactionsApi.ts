// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { WalletTransactions200Response } from '../models/WalletTransactions200Response';
import { WithdrawFunds200Response } from '../models/WithdrawFunds200Response';
import { WithdrawFundsRequest } from '../models/WithdrawFundsRequest';

/**
 * no description
 */
export class TransactionsApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.
     * Wallet Transactions
     * @param walletId The unique identifier of the connected wallet to query transactions for.
     * @param page Optional. Page number for pagination (0-indexed). Defaults to 0.
     * @param limit Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000.
     * @param asset Optional. Filter transactions by asset symbol.
     * @param type Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;).
     * @param since Optional. Filter transactions created on or after this date (ISO format).
     * @param before Optional. Filter transactions created before this date (ISO format).
     * @param status Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;).
     * @param fields Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included.
     */
    public async walletTransactions(walletId: string, page?: number, limit?: number, asset?: string, type?: string, since?: string, before?: string, status?: string, fields?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'walletId' is not null or undefined
        if (walletId === null || walletId === undefined) {
            throw new RequiredError("TransactionsApi", "walletTransactions", "walletId");
        }










        // Path Params
        const localVarPath = '/v0/cex/cex/wallet/{walletId}/transactions'
            .replace('{' + 'walletId' + '}', encodeURIComponent(String(walletId)));

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
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint requires authentication via a valid Bluvo API Key. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds
     * @param walletId The unique identifier of the wallet to withdraw funds from.
     * @param withdrawFundsRequest 
     */
    public async withdrawFunds(walletId: string, withdrawFundsRequest: WithdrawFundsRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'walletId' is not null or undefined
        if (walletId === null || walletId === undefined) {
            throw new RequiredError("TransactionsApi", "withdrawFunds", "walletId");
        }


        // verify required parameter 'withdrawFundsRequest' is not null or undefined
        if (withdrawFundsRequest === null || withdrawFundsRequest === undefined) {
            throw new RequiredError("TransactionsApi", "withdrawFunds", "withdrawFundsRequest");
        }


        // Path Params
        const localVarPath = '/v0/cex/cex/wallet/{walletId}/transact/out'
            .replace('{' + 'walletId' + '}', encodeURIComponent(String(walletId)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.PUT);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(withdrawFundsRequest, "WithdrawFundsRequest", ""),
            contentType
        );
        requestContext.setBody(serializedBody);

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
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class TransactionsApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletTransactions
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletTransactionsWithHttpInfo(response: ResponseContext): Promise<HttpInfo<WalletTransactions200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: WalletTransactions200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WalletTransactions200Response", ""
            ) as WalletTransactions200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: WalletTransactions200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WalletTransactions200Response", ""
            ) as WalletTransactions200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to withdrawFunds
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async withdrawFundsWithHttpInfo(response: ResponseContext): Promise<HttpInfo<WithdrawFunds200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: WithdrawFunds200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WithdrawFunds200Response", ""
            ) as WithdrawFunds200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: WithdrawFunds200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WithdrawFunds200Response", ""
            ) as WithdrawFunds200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
