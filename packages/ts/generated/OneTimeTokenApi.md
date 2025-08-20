# .OneTimeTokenApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ottgenerate**](OneTimeTokenApi.md#ottgenerate) | **GET** /v0/ott | Generate


# **ottgenerate**
> Ottgenerate200Response ottgenerate()

Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.

### Example


```typescript
import { createConfiguration, OneTimeTokenApi } from '';
import type { OneTimeTokenApiOttgenerateRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OneTimeTokenApi(configuration);

const request: OneTimeTokenApiOttgenerateRequest = {
    // Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints. (optional)
  wantOtt: "true",
    // Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates. (optional)
  wantSubscribe: "true",
};

const data = await apiInstance.ottgenerate(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wantOtt** | [**&#39;true&#39; | &#39;false&#39;**]**Array<&#39;true&#39; &#124; &#39;false&#39;>** | Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints. | (optional) defaults to undefined
 **wantSubscribe** | [**&#39;true&#39; | &#39;false&#39;**]**Array<&#39;true&#39; &#124; &#39;false&#39;>** | Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates. | (optional) defaults to undefined


### Return type

**Ottgenerate200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


