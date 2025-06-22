# .WalletsApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**connectWallet**](WalletsApi.md#connectWallet) | **POST** /v0/cex/connect/{exchange} | Connect Wallet
[**deleteWallet**](WalletsApi.md#deleteWallet) | **DELETE** /v0/cex/wallet/{walletId} | Delete Wallet
[**getWallet**](WalletsApi.md#getWallet) | **GET** /v0/cex/wallet/{walletId} | Get Wallet
[**listWallets**](WalletsApi.md#listWallets) | **GET** /v0/cex/wallets | List Wallets


# **connectWallet**
> ConnectWallet200Response connectWallet(connectWalletRequest)

Connect an external cryptocurrency exchange account to your Bluvo project. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.

### Example


```typescript
import { createConfiguration, WalletsApi } from '';
import type { WalletsApiConnectWalletRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WalletsApi(configuration);

const request: WalletsApiConnectWalletRequest = {
    // The identifier of the exchange to connect (e.g. \'binance\', \'kraken\').
  exchange: "ace",
  
  connectWalletRequest: {
    apiKey: "apiKey_example",
    apiSecret: "apiSecret_example",
    apiPassphrase: "apiPassphrase_example",
    apiUid: "apiUid_example",
  },
};

const data = await apiInstance.connectWallet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectWalletRequest** | **ConnectWalletRequest**|  |
 **exchange** | [**&#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;**]**Array<&#39;ace&#39; &#124; &#39;ascendex&#39; &#124; &#39;bequant&#39; &#124; &#39;bigone&#39; &#124; &#39;binance&#39; &#124; &#39;coinbase&#39; &#124; &#39;binanceus&#39; &#124; &#39;bingx&#39; &#124; &#39;bit2c&#39; &#124; &#39;bitbank&#39; &#124; &#39;bitbns&#39; &#124; &#39;bitcoincom&#39; &#124; &#39;bitfinex&#39; &#124; &#39;bitflyer&#39; &#124; &#39;bitget&#39; &#124; &#39;bithumb&#39; &#124; &#39;bitmart&#39; &#124; &#39;bitmex&#39; &#124; &#39;bitopro&#39; &#124; &#39;bitpanda&#39; &#124; &#39;bitrue&#39; &#124; &#39;bitso&#39; &#124; &#39;bitstamp&#39; &#124; &#39;bitteam&#39; &#124; &#39;bitvavo&#39; &#124; &#39;bl3p&#39; &#124; &#39;blockchaincom&#39; &#124; &#39;blofin&#39; &#124; &#39;btcalpha&#39; &#124; &#39;btcbox&#39; &#124; &#39;btcmarkets&#39; &#124; &#39;btcturk&#39; &#124; &#39;cex&#39; &#124; &#39;coincheck&#39; &#124; &#39;coinex&#39; &#124; &#39;coinlist&#39; &#124; &#39;coinmate&#39; &#124; &#39;coinmetro&#39; &#124; &#39;coinone&#39; &#124; &#39;coinsph&#39; &#124; &#39;coinspot&#39; &#124; &#39;cryptocom&#39; &#124; &#39;delta&#39; &#124; &#39;deribit&#39; &#124; &#39;digifinex&#39; &#124; &#39;exmo&#39; &#124; &#39;fmfwio&#39; &#124; &#39;gate&#39; &#124; &#39;gateio&#39; &#124; &#39;gemini&#39; &#124; &#39;hashkey&#39; &#124; &#39;hitbtc&#39; &#124; &#39;hollaex&#39; &#124; &#39;htx&#39; &#124; &#39;huobi&#39; &#124; &#39;huobijp&#39; &#124; &#39;hyperliquid&#39; &#124; &#39;independentreserve&#39; &#124; &#39;indodax&#39; &#124; &#39;kraken&#39; &#124; &#39;krakenfutures&#39; &#124; &#39;kucoin&#39; &#124; &#39;kucoinfutures&#39; &#124; &#39;latoken&#39; &#124; &#39;lbank&#39; &#124; &#39;luno&#39; &#124; &#39;mercado&#39; &#124; &#39;mexc&#39; &#124; &#39;ndax&#39; &#124; &#39;novadax&#39; &#124; &#39;oceanex&#39; &#124; &#39;okcoin&#39; &#124; &#39;okx&#39; &#124; &#39;onetrading&#39; &#124; &#39;oxfun&#39; &#124; &#39;p2b&#39; &#124; &#39;paradex&#39; &#124; &#39;paymium&#39; &#124; &#39;phemex&#39; &#124; &#39;poloniex&#39; &#124; &#39;poloniexfutures&#39; &#124; &#39;probit&#39; &#124; &#39;timex&#39; &#124; &#39;tradeogre&#39; &#124; &#39;upbit&#39; &#124; &#39;vertex&#39; &#124; &#39;wavesexchange&#39; &#124; &#39;whitebit&#39; &#124; &#39;woo&#39; &#124; &#39;woofipro&#39; &#124; &#39;xt&#39; &#124; &#39;yobit&#39; &#124; &#39;zaif&#39; &#124; &#39;zonda&#39;>** | The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;). | defaults to undefined


### Return type

**ConnectWallet200Response**

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

# **deleteWallet**
> DeleteWallet200Response deleteWallet()

Delete a connected exchange wallet. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.

### Example


```typescript
import { createConfiguration, WalletsApi } from '';
import type { WalletsApiDeleteWalletRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WalletsApi(configuration);

const request: WalletsApiDeleteWalletRequest = {
  
  walletId: "walletId_example",
};

const data = await apiInstance.deleteWallet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletId** | [**string**] |  | defaults to undefined


### Return type

**DeleteWallet200Response**

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

# **getWallet**
> GetWallet200Response getWallet()

Retrieve basic information about a connected exchange wallet, including a simple dictionary of balances. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers.

### Example


```typescript
import { createConfiguration, WalletsApi } from '';
import type { WalletsApiGetWalletRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WalletsApi(configuration);

const request: WalletsApiGetWalletRequest = {
  
  walletId: "walletId_example",
};

const data = await apiInstance.getWallet(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletId** | [**string**] |  | defaults to undefined


### Return type

**GetWallet200Response**

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

# **listWallets**
> ListWallets200Response listWallets()

Retrieve a paginated list of connected exchange wallets. This endpoint requires authentication via a valid Bluvo API Key, which must be included in the request headers. Supports pagination, filtering, and field selection.

### Example


```typescript
import { createConfiguration, WalletsApi } from '';
import type { WalletsApiListWalletsRequest } from '';

const configuration = createConfiguration();
const apiInstance = new WalletsApi(configuration);

const request: WalletsApiListWalletsRequest = {
    // Optional. Page number for pagination (0-indexed). Defaults to 0. (optional)
  page: 0,
    // Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000. (optional)
  limit: 1,
    // Optional. Filter wallets by exchange. (optional)
  exchange: "ace",
    // Optional. Filter wallets created on or after this date (ISO format). (optional)
  createdSince: "createdSince_example",
    // Optional. Filter wallets created before this date (ISO format). (optional)
  createdBefore: "createdBefore_example",
    // Optional. Filter wallets synchronized on or after this date (ISO format). (optional)
  lastSyncSince: "lastSyncSince_example",
    // Optional. Filter wallets synchronized before this date (ISO format). (optional)
  lastSyncBefore: "lastSyncBefore_example",
    // Optional. Filter wallets by API validity status. (optional)
  invalidApi: "true",
    // Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included. (optional)
  fields: "fields_example",
};

const data = await apiInstance.listWallets(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | [**number**] | Optional. Page number for pagination (0-indexed). Defaults to 0. | (optional) defaults to undefined
 **limit** | [**number**] | Optional. Maximum number of wallets to return per page. Defaults to 10. Maximum value is 1000. | (optional) defaults to undefined
 **exchange** | [**&#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;**]**Array<&#39;ace&#39; &#124; &#39;ascendex&#39; &#124; &#39;bequant&#39; &#124; &#39;bigone&#39; &#124; &#39;binance&#39; &#124; &#39;coinbase&#39; &#124; &#39;binanceus&#39; &#124; &#39;bingx&#39; &#124; &#39;bit2c&#39; &#124; &#39;bitbank&#39; &#124; &#39;bitbns&#39; &#124; &#39;bitcoincom&#39; &#124; &#39;bitfinex&#39; &#124; &#39;bitflyer&#39; &#124; &#39;bitget&#39; &#124; &#39;bithumb&#39; &#124; &#39;bitmart&#39; &#124; &#39;bitmex&#39; &#124; &#39;bitopro&#39; &#124; &#39;bitpanda&#39; &#124; &#39;bitrue&#39; &#124; &#39;bitso&#39; &#124; &#39;bitstamp&#39; &#124; &#39;bitteam&#39; &#124; &#39;bitvavo&#39; &#124; &#39;bl3p&#39; &#124; &#39;blockchaincom&#39; &#124; &#39;blofin&#39; &#124; &#39;btcalpha&#39; &#124; &#39;btcbox&#39; &#124; &#39;btcmarkets&#39; &#124; &#39;btcturk&#39; &#124; &#39;cex&#39; &#124; &#39;coincheck&#39; &#124; &#39;coinex&#39; &#124; &#39;coinlist&#39; &#124; &#39;coinmate&#39; &#124; &#39;coinmetro&#39; &#124; &#39;coinone&#39; &#124; &#39;coinsph&#39; &#124; &#39;coinspot&#39; &#124; &#39;cryptocom&#39; &#124; &#39;delta&#39; &#124; &#39;deribit&#39; &#124; &#39;digifinex&#39; &#124; &#39;exmo&#39; &#124; &#39;fmfwio&#39; &#124; &#39;gate&#39; &#124; &#39;gateio&#39; &#124; &#39;gemini&#39; &#124; &#39;hashkey&#39; &#124; &#39;hitbtc&#39; &#124; &#39;hollaex&#39; &#124; &#39;htx&#39; &#124; &#39;huobi&#39; &#124; &#39;huobijp&#39; &#124; &#39;hyperliquid&#39; &#124; &#39;independentreserve&#39; &#124; &#39;indodax&#39; &#124; &#39;kraken&#39; &#124; &#39;krakenfutures&#39; &#124; &#39;kucoin&#39; &#124; &#39;kucoinfutures&#39; &#124; &#39;latoken&#39; &#124; &#39;lbank&#39; &#124; &#39;luno&#39; &#124; &#39;mercado&#39; &#124; &#39;mexc&#39; &#124; &#39;ndax&#39; &#124; &#39;novadax&#39; &#124; &#39;oceanex&#39; &#124; &#39;okcoin&#39; &#124; &#39;okx&#39; &#124; &#39;onetrading&#39; &#124; &#39;oxfun&#39; &#124; &#39;p2b&#39; &#124; &#39;paradex&#39; &#124; &#39;paymium&#39; &#124; &#39;phemex&#39; &#124; &#39;poloniex&#39; &#124; &#39;poloniexfutures&#39; &#124; &#39;probit&#39; &#124; &#39;timex&#39; &#124; &#39;tradeogre&#39; &#124; &#39;upbit&#39; &#124; &#39;vertex&#39; &#124; &#39;wavesexchange&#39; &#124; &#39;whitebit&#39; &#124; &#39;woo&#39; &#124; &#39;woofipro&#39; &#124; &#39;xt&#39; &#124; &#39;yobit&#39; &#124; &#39;zaif&#39; &#124; &#39;zonda&#39;>** | Optional. Filter wallets by exchange. | (optional) defaults to undefined
 **createdSince** | [**string**] | Optional. Filter wallets created on or after this date (ISO format). | (optional) defaults to undefined
 **createdBefore** | [**string**] | Optional. Filter wallets created before this date (ISO format). | (optional) defaults to undefined
 **lastSyncSince** | [**string**] | Optional. Filter wallets synchronized on or after this date (ISO format). | (optional) defaults to undefined
 **lastSyncBefore** | [**string**] | Optional. Filter wallets synchronized before this date (ISO format). | (optional) defaults to undefined
 **invalidApi** | [**&#39;true&#39; | &#39;false&#39;**]**Array<&#39;true&#39; &#124; &#39;false&#39;>** | Optional. Filter wallets by API validity status. | (optional) defaults to undefined
 **fields** | [**string**] | Optional. Comma-separated list of fields to include in the response. If not specified, all fields are included. | (optional) defaults to undefined


### Return type

**ListWallets200Response**

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


