# .OAuth2WithdrawalsApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oauth2exchangeurloauth2url**](OAuth2WithdrawalsApi.md#oauth2exchangeurloauth2url) | **GET** /v0/oauth2/{exchange}/url | OAuth2 URL
[**walletwithdrawbalancebalance**](OAuth2WithdrawalsApi.md#walletwithdrawbalancebalance) | **GET** /v0/wallet/withdraw/balance | Balance
[**walletwithdrawquoteidexecutewithdraw**](OAuth2WithdrawalsApi.md#walletwithdrawquoteidexecutewithdraw) | **PUT** /v0/wallet/withdraw/{quoteId}/execute | Withdraw
[**walletwithdrawquotequotation**](OAuth2WithdrawalsApi.md#walletwithdrawquotequotation) | **GET** /v0/wallet/withdraw/quote | Quotation


# **oauth2exchangeurloauth2url**
> Oauth2exchangeurloauth2url200Response oauth2exchangeurloauth2url()

Get the url at which the user can do OAuth2 flow to grant access to their exchange account. The idem key, is the ID at which the OAuth2 flow will be linked to and can be listened either via polling using the \'/workflow/:workflowType/get/:workflowRunId\' endpoint (setting \'oauth2\' as workflowType or via Websocket streaming using the \'topic\' key in the response. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers

### Example


```typescript
import { createConfiguration, OAuth2WithdrawalsApi } from '';
import type { OAuth2WithdrawalsApiOauth2exchangeurloauth2urlRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2WithdrawalsApi(configuration);

const request: OAuth2WithdrawalsApiOauth2exchangeurloauth2urlRequest = {
    // The identifier of the exchange to link (e.g. \'coinbase\', \'kraken\').
  exchange: "coinbase",
    // The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
  idem: "idem_example",
};

const data = await apiInstance.oauth2exchangeurloauth2url(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exchange** | [**&#39;coinbase&#39; | &#39;kraken&#39;**]**Array<&#39;coinbase&#39; &#124; &#39;kraken&#39;>** | The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;). | defaults to undefined
 **idem** | [**string**] | The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates. | defaults to undefined


### Return type

**Oauth2exchangeurloauth2url200Response**

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

# **walletwithdrawbalancebalance**
> Oauth2exchangeurloauth2url200Response walletwithdrawbalancebalance()

See withdrawable balance of a wallet, and the networks available for each asset.

### Example


```typescript
import { createConfiguration, OAuth2WithdrawalsApi } from '';
import type { OAuth2WithdrawalsApiWalletwithdrawbalancebalanceRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2WithdrawalsApi(configuration);

const request: OAuth2WithdrawalsApiWalletwithdrawbalancebalanceRequest = {
    // The identifier of the exchange to link (e.g. \'coinbase\', \'kraken\').
  exchange: "coinbase",
    // The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates.
  idem: "idem_example",
};

const data = await apiInstance.walletwithdrawbalancebalance(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exchange** | [**&#39;coinbase&#39; | &#39;kraken&#39;**]**Array<&#39;coinbase&#39; &#124; &#39;kraken&#39;>** | The identifier of the exchange to link (e.g. \&#39;coinbase\&#39;, \&#39;kraken\&#39;). | defaults to undefined
 **idem** | [**string**] | The idem provided by OTT or used to identify the workflow run. This is used to track the OAuth2 flow and can be used to subscribe to updates. | defaults to undefined


### Return type

**Oauth2exchangeurloauth2url200Response**

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

# **walletwithdrawquoteidexecutewithdraw**
> Walletwithdrawquotequotation200Response walletwithdrawquoteidexecutewithdraw(walletwithdrawquotequotationRequest)

Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.

### Example


```typescript
import { createConfiguration, OAuth2WithdrawalsApi } from '';
import type { OAuth2WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2WithdrawalsApi(configuration);

const request: OAuth2WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest = {
  
  quoteId: "quoteId_example",
  
  walletwithdrawquotequotationRequest: {
    asset: "asset_example",
    amount: 3.14,
    address: "address_example",
    tag: "tag_example",
    params: null,
  },
};

const data = await apiInstance.walletwithdrawquoteidexecutewithdraw(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletwithdrawquotequotationRequest** | **WalletwithdrawquotequotationRequest**|  |
 **quoteId** | [**string**] |  | defaults to undefined


### Return type

**Walletwithdrawquotequotation200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **walletwithdrawquotequotation**
> Walletwithdrawquotequotation200Response walletwithdrawquotequotation(walletwithdrawquotequotationRequest)

Get a quotation for a cryptocurrency withdrawal from an exchange wallet. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/wallet/withdraw/quote\' route. The request returns a quote ID that can be used to execute the withdrawal later.

### Example


```typescript
import { createConfiguration, OAuth2WithdrawalsApi } from '';
import type { OAuth2WithdrawalsApiWalletwithdrawquotequotationRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OAuth2WithdrawalsApi(configuration);

const request: OAuth2WithdrawalsApiWalletwithdrawquotequotationRequest = {
  
  walletwithdrawquotequotationRequest: {
    asset: "asset_example",
    amount: 3.14,
    address: "address_example",
    tag: "tag_example",
    params: null,
  },
};

const data = await apiInstance.walletwithdrawquotequotation(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletwithdrawquotequotationRequest** | **WalletwithdrawquotequotationRequest**|  |


### Return type

**Walletwithdrawquotequotation200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


