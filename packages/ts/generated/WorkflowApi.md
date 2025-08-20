# .WorkflowApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**workflowworkflowtypegetworkflowrunidget**](WorkflowApi.md#workflowworkflowtypegetworkflowrunidget) | **GET** /v0/workflow/{workflowType}/get/{workflowRunId} | Get


# **workflowworkflowtypegetworkflowrunidget**
> Workflowworkflowtypegetworkflowrunidget200Response workflowworkflowtypegetworkflowrunidget()

Retrieve the details of a specific workflow run by its ID. The workflowType parameter indicates the type of workflow (e.g. \'connect\', \'withdraw\', \'oauth2\'). This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.

### Example


```typescript
import { createConfiguration, WorkflowApi } from '';
import type { WorkflowApiWorkflowworkflowtypegetworkflowrunidgetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WorkflowApi(configuration);

const request: WorkflowApiWorkflowworkflowtypegetworkflowrunidgetRequest = {
    // The unique identifier of the workflow run to query.
  workflowRunId: "workflowRunId_example",
    // The type of workflow to query (e.g. \'connect\', \'withdraw\').
  workflowType: "connect",
};

const data = await apiInstance.workflowworkflowtypegetworkflowrunidget(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workflowRunId** | [**string**] | The unique identifier of the workflow run to query. | defaults to undefined
 **workflowType** | [**&#39;connect&#39; | &#39;withdraw&#39; | &#39;oauth2&#39;**]**Array<&#39;connect&#39; &#124; &#39;withdraw&#39; &#124; &#39;oauth2&#39;>** | The type of workflow to query (e.g. \&#39;connect\&#39;, \&#39;withdraw\&#39;). | defaults to undefined


### Return type

**Workflowworkflowtypegetworkflowrunidget200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


