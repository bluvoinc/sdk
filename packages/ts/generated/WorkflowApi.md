# .WorkflowApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getWorkflow**](WorkflowApi.md#getWorkflow) | **GET** /v0/workflow/runs/{workflowRunId} | Get Workflow


# **getWorkflow**
> GetWorkflow200Response getWorkflow()

Retrieve the status of a specific workflow run. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.

### Example


```typescript
import { createConfiguration, WorkflowApi } from '';
import type { WorkflowApiGetWorkflowRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WorkflowApi(configuration);

const request: WorkflowApiGetWorkflowRequest = {
    // The unique identifier of the workflow run to query.
  workflowRunId: "workflowRunId_example",
};

const data = await apiInstance.getWorkflow(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workflowRunId** | [**string**] | The unique identifier of the workflow run to query. | defaults to undefined


### Return type

**GetWorkflow200Response**

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


