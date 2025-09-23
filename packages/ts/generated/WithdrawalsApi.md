# .WithdrawalsApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**walletwithdrawbalancebalance**](WithdrawalsApi.md#walletwithdrawbalancebalance) | **GET** /v0/wallet/withdraw/balance | Balance
[**walletwithdrawquoteidexecutewithdraw**](WithdrawalsApi.md#walletwithdrawquoteidexecutewithdraw) | **PUT** /v0/wallet/withdraw/{quoteId}/execute | Withdraw
[**walletwithdrawquotequotation**](WithdrawalsApi.md#walletwithdrawquotequotation) | **POST** /v0/wallet/withdraw/quote | Quotation


# **walletwithdrawbalancebalance**
> Walletwithdrawbalancebalance200Response walletwithdrawbalancebalance()

Get withdrawable balances and supported networks.

### Example


```typescript
import { createConfiguration, WithdrawalsApi } from '';

const configuration = createConfiguration();
const apiInstance = new WithdrawalsApi(configuration);

const request = {};

const data = await apiInstance.walletwithdrawbalancebalance(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters
This endpoint does not need any parameter.


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
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **walletwithdrawquoteidexecutewithdraw**
> Walletwithdrawquoteidexecutewithdraw200Response walletwithdrawquoteidexecutewithdraw(walletwithdrawquoteidexecutewithdrawRequest)

Execute a withdrawal using a quote ID.

### Example


```typescript
import { createConfiguration, WithdrawalsApi } from '';
import type { WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WithdrawalsApi(configuration);

const request: WithdrawalsApiWalletwithdrawquoteidexecutewithdrawRequest = {
    // UUID for tracking withdrawal flow.
  idem: "idem_example",
  
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
 **idem** | [**string**] | UUID for tracking withdrawal flow. | defaults to undefined
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
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **walletwithdrawquotequotation**
> Walletwithdrawquotequotation200Response walletwithdrawquotequotation(walletwithdrawquotequotationRequest)

Get withdrawal quote with fees and estimates.

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
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


