// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { Oauth2exchangeurloauth2url200Response } from '../models/Oauth2exchangeurloauth2url200Response';
import { Walletwithdrawquotequotation200Response } from '../models/Walletwithdrawquotequotation200Response';
import { WalletwithdrawquotequotationRequest } from '../models/WalletwithdrawquotequotationRequest';

/**
 * no description
 */
export class OAuth2WithdrawalsApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers
     * OAuth2 URL
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public async oauth2exchangeurloauth2url(exchange: 'coinbase' | 'kraken', idem: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'exchange' is not null or undefined
        if (exchange === null || exchange === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "oauth2exchangeurloauth2url", "exchange");
        }


        // verify required parameter 'idem' is not null or undefined
        if (idem === null || idem === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "oauth2exchangeurloauth2url", "idem");
        }


        // Path Params
        const localVarPath = '/v0/oauth2/{exchange}/url'
            .replace('{' + 'exchange' + '}', encodeURIComponent(String(exchange)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (idem !== undefined) {
            requestContext.setQueryParam("idem", ObjectSerializer.serialize(idem, "string", ""));
        }


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOttActionId"]
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
     * See withdrawable balance of a wallet, and the networks available for each asset.
     * Balance
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public async walletwithdrawbalancebalance(exchange: 'coinbase' | 'kraken', idem: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'exchange' is not null or undefined
        if (exchange === null || exchange === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "walletwithdrawbalancebalance", "exchange");
        }


        // verify required parameter 'idem' is not null or undefined
        if (idem === null || idem === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "walletwithdrawbalancebalance", "idem");
        }


        // Path Params
        const localVarPath = '/v0/wallet/withdraw/balance'
            .replace('{' + 'exchange' + '}', encodeURIComponent(String(exchange)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (idem !== undefined) {
            requestContext.setQueryParam("idem", ObjectSerializer.serialize(idem, "string", ""));
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
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw
     * @param quoteId 
     * @param walletwithdrawquotequotationRequest 
     */
    public async walletwithdrawquoteidexecutewithdraw(quoteId: string, walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'quoteId' is not null or undefined
        if (quoteId === null || quoteId === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "walletwithdrawquoteidexecutewithdraw", "quoteId");
        }


        // verify required parameter 'walletwithdrawquotequotationRequest' is not null or undefined
        if (walletwithdrawquotequotationRequest === null || walletwithdrawquotequotationRequest === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "walletwithdrawquoteidexecutewithdraw", "walletwithdrawquotequotationRequest");
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

    /**
     * Get a quotation for a cryptocurrency withdrawal from an exchange wallet. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw/quote\' route. The request returns a quote ID that can be used to execute the withdrawal later.
     * Quotation
     * @param walletwithdrawquotequotationRequest 
     */
    public async walletwithdrawquotequotation(walletwithdrawquotequotationRequest: WalletwithdrawquotequotationRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'walletwithdrawquotequotationRequest' is not null or undefined
        if (walletwithdrawquotequotationRequest === null || walletwithdrawquotequotationRequest === undefined) {
            throw new RequiredError("OAuth2WithdrawalsApi", "walletwithdrawquotequotation", "walletwithdrawquotequotationRequest");
        }


        // Path Params
        const localVarPath = '/v0/wallet/withdraw/quote';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
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

export class OAuth2WithdrawalsApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to oauth2exchangeurloauth2url
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async oauth2exchangeurloauth2urlWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Oauth2exchangeurloauth2url200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Oauth2exchangeurloauth2url200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Oauth2exchangeurloauth2url200Response", ""
            ) as Oauth2exchangeurloauth2url200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Oauth2exchangeurloauth2url200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Oauth2exchangeurloauth2url200Response", ""
            ) as Oauth2exchangeurloauth2url200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to walletwithdrawbalancebalance
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async walletwithdrawbalancebalanceWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Oauth2exchangeurloauth2url200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Oauth2exchangeurloauth2url200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Oauth2exchangeurloauth2url200Response", ""
            ) as Oauth2exchangeurloauth2url200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Oauth2exchangeurloauth2url200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Oauth2exchangeurloauth2url200Response", ""
            ) as Oauth2exchangeurloauth2url200Response;
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
     public async walletwithdrawquoteidexecutewithdrawWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Walletwithdrawquotequotation200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Walletwithdrawquotequotation200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Walletwithdrawquotequotation200Response", ""
            ) as Walletwithdrawquotequotation200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
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
