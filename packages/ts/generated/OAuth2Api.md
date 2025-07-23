# .OAuth2Api

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oAuth2Link**](OAuth2Api.md#oAuth2Link) | **GET** /v0/oauth2/{exchange}/link | OAuth2 Link


# **oAuth2Link**
> OAuth2Link200Response oAuth2Link()

Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers

### Example


```typescript
import { createConfiguration, OAuth2Api } from '';
import type { OAuth2ApiOAuth2LinkRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2Api(configuration);

const request: OAuth2ApiOAuth2LinkRequest = {
    // The identifier of the exchange to link (e.g. \'coinbase\', \'kraken\').
  exchange: "coinbase",
    // The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
  idem: "idem_example",
};

const data = await apiInstance.oAuth2Link(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exchange** | [**&#39;coinbase&#39; | &#39;kraken&#39;**]**Array<&#39;coinbase&#39; &#124; &#39;kraken&#39;>** | The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;). | defaults to undefined
 **idem** | [**string**] | The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates. | defaults to undefined


### Return type

**OAuth2Link200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoOttActionId](README.md#bluvoOttActionId), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


