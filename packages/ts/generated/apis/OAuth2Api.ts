// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { OAuth2Link200Response } from '../models/OAuth2Link200Response';

/**
 * no description
 */
export class OAuth2ApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers
     * OAuth2 Link
     * @param exchange The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
     */
    public async oAuth2Link(exchange: 'coinbase' | 'kraken', idem: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'exchange' is not null or undefined
        if (exchange === null || exchange === undefined) {
            throw new RequiredError("OAuth2Api", "oAuth2Link", "exchange");
        }


        // verify required parameter 'idem' is not null or undefined
        if (idem === null || idem === undefined) {
            throw new RequiredError("OAuth2Api", "oAuth2Link", "idem");
        }


        // Path Params
        const localVarPath = '/v0/oauth2/{exchange}/link'
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

}

export class OAuth2ApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to oAuth2Link
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async oAuth2LinkWithHttpInfo(response: ResponseContext): Promise<HttpInfo<OAuth2Link200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: OAuth2Link200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "OAuth2Link200Response", ""
            ) as OAuth2Link200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: OAuth2Link200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "OAuth2Link200Response", ""
            ) as OAuth2Link200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
