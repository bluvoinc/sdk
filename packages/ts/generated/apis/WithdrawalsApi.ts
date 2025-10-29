// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { Walletget403Response } from '../models/Walletget403Response';
import { Walletget404Response } from '../models/Walletget404Response';
import { Walletwithdrawbalancebalance200Response } from '../models/Walletwithdrawbalancebalance200Response';
import { Walletwithdrawquoteidexecutewithdraw200Response } from '../models/Walletwithdrawquoteidexecutewithdraw200Response';
import { WalletwithdrawquoteidexecutewithdrawRequest } from '../models/WalletwithdrawquoteidexecutewithdrawRequest';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { Walletwithdrawquotequotation400Response } from '../models/Walletwithdrawquotequotation400Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';

/**
 * no description
 */
export class WithdrawalsApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Get withdrawable balances and supported networks.  **Required API Key Scopes:** `read`
     * Balance
     * @param refreshThresholdMinutes Override balance refresh threshold in minutes. Set to 0 to always refresh balances from the exchange. Defaults to 0.
     */
    public async walletwithdrawbalancebalance(refreshThresholdMinutes?: number, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;


        // Path Params
        const localVarPath = '/v0/wallet/withdraw/balance';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (refreshThresholdMinutes !== undefined) {
            requestContext.setQueryParam("refreshThresholdMinutes", ObjectSerializer.serialize(refreshThresholdMinutes, "number", ""));
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

    /**
     * Execute a withdrawal using a quote ID.  **Required API Key Scopes:** `read`, `quote`, `withdrawal`
     * Withdraw
     * @param quoteId 
     * @param walletwithdrawquoteidexecutewithdrawRequest 
     */
    public async walletwithdrawquoteidexecutewithdraw(quoteId: string, walletwithdrawquoteidexecutewithdrawRequest: WalletwithdrawquoteidexecutewithdrawRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'quoteId' is not null or undefined
        if (quoteId === null || quoteId === undefined) {
            throw new RequiredError("WithdrawalsApi", "walletwithdrawquoteidexecutewithdraw", "quoteId");
        }


        // verify required parameter 'walletwithdrawquoteidexecutewithdrawRequest' is not null or undefined
        if (walletwithdrawquoteidexecutewithdrawRequest === null || walletwithdrawquoteidexecutewithdrawRequest === undefined) {
            throw new RequiredError("WithdrawalsApi", "walletwithdrawquoteidexecutewithdraw", "walletwithdrawquoteidexecutewithdrawRequest");
        }


        // Path Params
        const localVarPath = '/v0/wallet/withdraw/{quoteId}/execute'
            .replace('{' + 'quoteId' + '}', encodeURIComponent(String(quoteId)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.PUT);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(walletwithdrawquoteidexecutewithdrawRequest, "WalletwithdrawquoteidexecutewithdrawRequest", ""),
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
     * Get withdrawal quote with fees and estimates.  **Required API Key Scopes:** `read`, `quote`
     * Quotation
     * @param walletwithdrawquotequotationRequest 
     */
    public async walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'walletwithdrawquotequotationRequest' is not null or undefined
        if (walletwithdrawquotequotationRequest === null || walletwithdrawquotequotationRequest === undefined) {
            throw new RequiredError("WithdrawalsApi", "walletwithdrawquotequotation", "walletwithdrawquotequotationRequest");
        }


        // Path Params
        const localVarPath = '/v0/wallet/withdraw/quote';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.POST);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(walletwithdrawquotequotationRequest, "WalletwithdrawquotequotationRequest", ""),
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

export class WithdrawalsApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletwithdrawbalancebalance
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletwithdrawbalancebalanceWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletwithdrawbalancebalance200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletwithdrawbalancebalance200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawbalancebalance200Response", ""
            ) as Walletwithdrawbalancebalance200Response;
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
            const body: Walletwithdrawbalancebalance200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawbalancebalance200Response", ""
            ) as Walletwithdrawbalancebalance200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletwithdrawquoteidexecutewithdraw
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletwithdrawquoteidexecutewithdrawWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletwithdrawquoteidexecutewithdraw200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletwithdrawquoteidexecutewithdraw200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquoteidexecutewithdraw200Response", ""
            ) as Walletwithdrawquoteidexecutewithdraw200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            const body: Walletwithdrawquotequotation400Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation400Response", ""
            ) as Walletwithdrawquotequotation400Response;
            throw new ApiException<Walletwithdrawquotequotation400Response>(response.httpStatusCode, "Bad Request", body, response.headers);
        }
        if (isCodeInRange("403", response.httpStatusCode)) {
            const body: Walletget403Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletget403Response", ""
            ) as Walletget403Response;
            throw new ApiException<Walletget403Response>(response.httpStatusCode, "Forbidden - Insufficient API key permissions", body, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: Walletwithdrawquotequotation400Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation400Response", ""
            ) as Walletwithdrawquotequotation400Response;
            throw new ApiException<Walletwithdrawquotequotation400Response>(response.httpStatusCode, "Not Found", body, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Walletwithdrawquoteidexecutewithdraw200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquoteidexecutewithdraw200Response", ""
            ) as Walletwithdrawquoteidexecutewithdraw200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletwithdrawquotequotation
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletwithdrawquotequotationWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletwithdrawquotequotation200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletwithdrawquotequotation200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation200Response", ""
            ) as Walletwithdrawquotequotation200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            const body: Walletwithdrawquotequotation400Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation400Response", ""
            ) as Walletwithdrawquotequotation400Response;
            throw new ApiException<Walletwithdrawquotequotation400Response>(response.httpStatusCode, "Bad Request", body, response.headers);
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
            const body: Walletwithdrawquotequotation200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation200Response", ""
            ) as Walletwithdrawquotequotation200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
