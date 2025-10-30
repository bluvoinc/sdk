# .APIKeysApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**organizationapikeygetapikeyinfo**](APIKeysApi.md#organizationapikeygetapikeyinfo) | **GET** /v0/organization/api-key | Get API Key Info


# **organizationapikeygetapikeyinfo**
> Organizationapikeygetapikeyinfo200Response organizationapikeygetapikeyinfo()

Get information about the current API key, including its permissions and rate limit configuration.  **🔒 Authentication:** This endpoint requires a valid API key.

### Example


```typescript
import { createConfiguration, APIKeysApi } from '';

const configuration = createConfiguration();
const apiInstance = new APIKeysApi(configuration);

const request = {};

const data = await apiInstance.organizationapikeygetapikeyinfo(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**Organizationapikeygetapikeyinfo200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**403** | Forbidden - Insufficient API key permissions |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


