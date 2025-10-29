# .WithdrawalsApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**walletwithdrawbalancebalance**](WithdrawalsApi.md#walletwithdrawbalancebalance) | **GET** /v0/wallet/withdraw/balance | Balance
[**walletwithdrawquoteidexecutewithdraw**](WithdrawalsApi.md#walletwithdrawquoteidexecutewithdraw) | **PUT** /v0/wallet/withdraw/{quoteId}/execute | Withdraw
[**walletwithdrawquotequotation**](WithdrawalsApi.md#walletwithdrawquotequotation) | **POST** /v0/wallet/withdraw/quote | Quotation


# **walletwithdrawbalancebalance**
> Walletwithdrawbalancebalance200Response walletwithdrawbalancebalance()

Get withdrawable balances and supported networks.  **Required API Key Scopes:** `read`

### Example


```typescript
import { createConfiguration, WithdrawalsApi } from '';
import type { WithdrawalsApiWalletwithdrawbalancebalanceRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WithdrawalsApi(configuration);

const request: WithdrawalsApiWalletwithdrawbalancebalanceRequest = {
    // Override balance refresh threshold in minutes. Set to 0 to always refresh balances from the exchange. Defaults to 0. (optional)
  refreshThresholdMinutes: 0,
};

const data = await apiInstance.walletwithdrawbalancebalance(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshThresholdMinutes** | [**number**] | Override balance refresh threshold in minutes. Set to 0 to always refresh balances from the exchange. Defaults to 0. | (optional) defaults to undefined


### Return type

**Walletwithdrawbalancebalance200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**403** | Forbidden - Insufficient API key permissions |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **walletwithdrawquoteidexecutewithdraw**
> Walletwithdrawquoteidexecutewithdraw200Response walletwithdrawquoteidexecutewithdraw(walletwithdrawquoteidexecutewithdrawRequest)

Execute a withdrawal using a quote ID.  **Required API Key Scopes:** `read`, `quote`, `withdrawal`

### Example


```typescript
import { createConfiguration, WithdrawalsApi } from '';
import type { WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WithdrawalsApi(configuration);

const request: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest = {
  
  quoteId: "quoteId_example",
  
  walletwithdrawquoteidexecutewithdrawRequest: {
    twofa: "twofa_example",
    tag: "tag_example",
  },
};

const data = await apiInstance.walletwithdrawquoteidexecutewithdraw(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletwithdrawquoteidexecutewithdrawRequest** | **WalletwithdrawquoteidexecutewithdrawRequest**|  |
 **quoteId** | [**string**] |  | defaults to undefined


### Return type

**Walletwithdrawquoteidexecutewithdraw200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoApiKey](README.md#bluvoApiKey), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**400** | Bad Request |  -  |
**403** | Forbidden - Insufficient API key permissions |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **walletwithdrawquotequotation**
> Walletwithdrawquotequotation200Response walletwithdrawquotequotation(walletwithdrawquotequotationRequest)

Get withdrawal quote with fees and estimates.  **Required API Key Scopes:** `read`, `quote`

### Example


```typescript
import { createConfiguration, WithdrawalsApi } from '';
import type { WithdrawalsApiWalletwithdrawquotequotationRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WithdrawalsApi(configuration);

const request: WithdrawalsApiWalletwithdrawquotequotationRequest = {
  
  walletwithdrawquotequotationRequest: {
    asset: "asset_example",
    amount: "amount_example",
    address: "address_example",
    network: "network_example",
    tag: "tag_example",
    includeFee: true,
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
**400** | Bad Request |  -  |
**403** | Forbidden - Insufficient API key permissions |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


