# .TransactionsApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**listTransactions**](TransactionsApi.md#listTransactions) | **GET** /v0/cex/wallet/transactions | List Transactions
[**withdrawFunds**](TransactionsApi.md#withdrawFunds) | **PUT** /v0/cex/wallet/withdraw | Withdraw Funds


# **listTransactions**
> ListTransactions200Response listTransactions()

Retrieve a paginated list of transactions for a specific wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering by asset, type, date range, and status, as well as field selection to control which properties are returned in the response.

### Example


```typescript
import { createConfiguration, TransactionsApi } from '';
import type { TransactionsApiListTransactionsRequest } from '';

const configuration = createConfiguration();
const apiInstance = new TransactionsApi(configuration);

const request: TransactionsApiListTransactionsRequest = {
    // Optional. Page number for pagination (0-indexed). Defaults to 0. (optional)
  page: 0,
    // Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000. (optional)
  limit: 1,
    // Optional. Filter transactions by asset symbol. (optional)
  asset: "asset_example",
    // Optional. Filter transactions by type (e.g., \'deposit\', \'withdrawal\'). (optional)
  type: "type_example",
    // Optional. Filter transactions created on or after this date (ISO format). (optional)
  since: "since_example",
    // Optional. Filter transactions created before this date (ISO format). (optional)
  before: "before_example",
    // Optional. Filter transactions by status (e.g., \'completed\', \'pending\'). (optional)
  status: "status_example",
    // Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included. (optional)
  fields: "fields_example",
};

const data = await apiInstance.listTransactions(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | [**number**] | Optional. Page number for pagination (0-indexed). Defaults to 0. | (optional) defaults to undefined
 **limit** | [**number**] | Optional. Maximum number of transactions to return per page. Defaults to 10. Maximum value is 1000. | (optional) defaults to undefined
 **asset** | [**string**] | Optional. Filter transactions by asset symbol. | (optional) defaults to undefined
 **type** | [**string**] | Optional. Filter transactions by type (e.g., \&#39;deposit\&#39;, \&#39;withdrawal\&#39;). | (optional) defaults to undefined
 **since** | [**string**] | Optional. Filter transactions created on or after this date (ISO format). | (optional) defaults to undefined
 **before** | [**string**] | Optional. Filter transactions created before this date (ISO format). | (optional) defaults to undefined
 **status** | [**string**] | Optional. Filter transactions by status (e.g., \&#39;completed\&#39;, \&#39;pending\&#39;). | (optional) defaults to undefined
 **fields** | [**string**] | Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included. | (optional) defaults to undefined


### Return type

**ListTransactions200Response**

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

# **withdrawFunds**
> WithdrawFunds200Response withdrawFunds(withdrawFundsRequest)

Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/cex/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.

### Example


```typescript
import { createConfiguration, TransactionsApi } from '';
import type { TransactionsApiWithdrawFundsRequest } from '';

const configuration = createConfiguration();
const apiInstance = new TransactionsApi(configuration);

const request: TransactionsApiWithdrawFundsRequest = {
  
  withdrawFundsRequest: {
    asset: "asset_example",
    amount: 3.14,
    address: "address_example",
    tag: "tag_example",
    params: null,
  },
};

const data = await apiInstance.withdrawFunds(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **withdrawFundsRequest** | **WithdrawFundsRequest**|  |


### Return type

**WithdrawFunds200Response**

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


