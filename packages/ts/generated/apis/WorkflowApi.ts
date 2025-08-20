// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { Workflowworkflowtypegetworkflowrunidget200Response } from '../models/Workflowworkflowtypegetworkflowrunidget200Response';

/**
 * no description
 */
export class WorkflowApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.
     * Get
     * @param workflowRunId The unique identifier of the workflow run to query.
     * @param workflowType The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;).
     */
    public async workflowworkflowtypegetworkflowrunidget(workflowRunId: string, workflowType: 'connect' | 'withdraw' | 'oauth2', _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'workflowRunId' is not null or undefined
        if (workflowRunId === null || workflowRunId === undefined) {
            throw new RequiredError("WorkflowApi", "workflowworkflowtypegetworkflowrunidget", "workflowRunId");
        }


        // verify required parameter 'workflowType' is not null or undefined
        if (workflowType === null || workflowType === undefined) {
            throw new RequiredError("WorkflowApi", "workflowworkflowtypegetworkflowrunidget", "workflowType");
        }


        // Path Params
        const localVarPath = '/v0/workflow/{workflowType}/get/{workflowRunId}'
            .replace('{' + 'workflowRunId' + '}', encodeURIComponent(String(workflowRunId)))
            .replace('{' + 'workflowType' + '}', encodeURIComponent(String(workflowType)));

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
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class WorkflowApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to workflowworkflowtypegetworkflowrunidget
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async workflowworkflowtypegetworkflowrunidgetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Workflowworkflowtypegetworkflowrunidget200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Workflowworkflowtypegetworkflowrunidget200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Workflowworkflowtypegetworkflowrunidget200Response", ""
            ) as Workflowworkflowtypegetworkflowrunidget200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Workflowworkflowtypegetworkflowrunidget200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Workflowworkflowtypegetworkflowrunidget200Response", ""
            ) as Workflowworkflowtypegetworkflowrunidget200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
