// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { Ottgenerate200Response } from '../models/Ottgenerate200Response';

/**
 * no description
 */
export class OneTimeTokenApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.
     * Generate
     * @param wantOtt Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints.
     * @param wantSubscribe Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates.
     */
    public async ottgenerate(wantOtt?: 'true' | 'false', wantSubscribe?: 'true' | 'false', _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/v0/ott';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (wantOtt !== undefined) {
            requestContext.setQueryParam("wantOtt", ObjectSerializer.serialize(wantOtt, "'true' | 'false'", ""));
        }

        // Query Params
        if (wantSubscribe !== undefined) {
            requestContext.setQueryParam("wantSubscribe", ObjectSerializer.serialize(wantSubscribe, "'true' | 'false'", ""));
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

export class OneTimeTokenApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to ottgenerate
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async ottgenerateWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Ottgenerate200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Ottgenerate200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Ottgenerate200Response", ""
            ) as Ottgenerate200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Ottgenerate200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Ottgenerate200Response", ""
            ) as Ottgenerate200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
