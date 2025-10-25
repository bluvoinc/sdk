# .OAuth2Api

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oauth2exchangeslistexchanges**](OAuth2Api.md#oauth2exchangeslistexchanges) | **GET** /v0/oauth2/exchanges | List Exchanges
[**oauth2exchangeurlgeturl**](OAuth2Api.md#oauth2exchangeurlgeturl) | **GET** /v0/oauth2/{exchange}/url | Get URL


# **oauth2exchangeslistexchanges**
> Oauth2exchangeslistexchanges200Response oauth2exchangeslistexchanges()

List supported exchanges for OAuth2 connections.

### Example


```typescript
import { createConfiguration, OAuth2Api } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2Api(configuration);

const request = {};

const data = await apiInstance.oauth2exchangeslistexchanges(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


### Return type

**Oauth2exchangeslistexchanges200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **oauth2exchangeurlgeturl**
> Oauth2exchangeurlgeturl200Response oauth2exchangeurlgeturl()

Get OAuth2 authorization URL for exchange connection.

### Example


```typescript
import { createConfiguration, OAuth2Api } from '';
import type { OAuth2ApiOauth2exchangeurlgeturlRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2Api(configuration);

const request: OAuth2ApiOauth2exchangeurlgeturlRequest = {
    // Exchange identifier.
  exchange: "coinbase",
    // Idempotency key.
  idem: "idem_example",
};

const data = await apiInstance.oauth2exchangeurlgeturl(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exchange** | [**&#39;coinbase&#39; | &#39;kraken&#39; | &#39;gemini&#39; | &#39;local-cex&#39;**]**Array<&#39;coinbase&#39; &#124; &#39;kraken&#39; &#124; &#39;gemini&#39; &#124; &#39;local-cex&#39;>** | Exchange identifier. | defaults to undefined
 **idem** | [**string**] | Idempotency key. | defaults to undefined


### Return type

**Oauth2exchangeurlgeturl200Response**

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


