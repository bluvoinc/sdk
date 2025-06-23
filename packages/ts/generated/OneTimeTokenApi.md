# .OneTimeTokenApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getOTTToken**](OneTimeTokenApi.md#getOTTToken) | **GET** /v0/ott/token | Get OTT Token


# **getOTTToken**
> GetOTTToken200Response getOTTToken()

Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint does not require authentication and is used to obtain a temporary token that can be used for subsequent requests to private endpoints.

### Example


```typescript
import { createConfiguration, OneTimeTokenApi } from '';

const configuration = createConfiguration();
const apiInstance = new OneTimeTokenApi(configuration);

const request = {};

const data = await apiInstance.getOTTToken(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**GetOTTToken200Response**

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


