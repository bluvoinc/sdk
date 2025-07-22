# .OneTimeTokenApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**connectWalletOTT**](OneTimeTokenApi.md#connectWalletOTT) | **POST** /v0/ott/cex/connect/{exchange} | Connect Wallet (OTT)
[**getOTTToken**](OneTimeTokenApi.md#getOTTToken) | **GET** /v0/ott/token | Get OTT Token
[**withdrawFundsOTT**](OneTimeTokenApi.md#withdrawFundsOTT) | **PUT** /v0/ott/cex/wallet/withdraw | Withdraw Funds (OTT)


# **connectWalletOTT**
> ConnectWallet200Response connectWalletOTT(connectWalletRequest)

The same \'/cex/connect/:exchange\' endpoint, but using One-Time Token (OTT) authentication instead of API Key authentication (for UI-based connections). Connect an external cryptocurrency exchange account to your Bluvo project using a One-Time Token (OTT). This endpoint is similar to the \'/cex/connect/:exchange\' endpoint but uses OTT authentication instead of API Key authentication. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.

### Example


```typescript
import { createConfiguration, OneTimeTokenApi } from '';
import type { OneTimeTokenApiConnectWalletOTTRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OneTimeTokenApi(configuration);

const request: OneTimeTokenApiConnectWalletOTTRequest = {
    // The identifier of the exchange to connect (e.g. \'binance\', \'kraken\').
  exchange: "ace",
    // The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
  idem: "idem_example",
  
  connectWalletRequest: {
    apiKey: "apiKey_example",
    apiSecret: "apiSecret_example",
    apiPassphrase: "apiPassphrase_example",
    apiUid: "apiUid_example",
    ips: [
      "ips_example",
    ],
  },
};

const data = await apiInstance.connectWalletOTT(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectWalletRequest** | **ConnectWalletRequest**|  |
 **exchange** | [**&#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;**]**Array<&#39;ace&#39; &#124; &#39;ascendex&#39; &#124; &#39;bequant&#39; &#124; &#39;bigone&#39; &#124; &#39;binance&#39; &#124; &#39;coinbase&#39; &#124; &#39;binanceus&#39; &#124; &#39;bingx&#39; &#124; &#39;bit2c&#39; &#124; &#39;bitbank&#39; &#124; &#39;bitbns&#39; &#124; &#39;bitcoincom&#39; &#124; &#39;bitfinex&#39; &#124; &#39;bitflyer&#39; &#124; &#39;bitget&#39; &#124; &#39;bithumb&#39; &#124; &#39;bitmart&#39; &#124; &#39;bitmex&#39; &#124; &#39;bitopro&#39; &#124; &#39;bitpanda&#39; &#124; &#39;bitrue&#39; &#124; &#39;bitso&#39; &#124; &#39;bitstamp&#39; &#124; &#39;bitteam&#39; &#124; &#39;bitvavo&#39; &#124; &#39;bl3p&#39; &#124; &#39;blockchaincom&#39; &#124; &#39;blofin&#39; &#124; &#39;btcalpha&#39; &#124; &#39;btcbox&#39; &#124; &#39;btcmarkets&#39; &#124; &#39;btcturk&#39; &#124; &#39;cex&#39; &#124; &#39;coincheck&#39; &#124; &#39;coinex&#39; &#124; &#39;coinlist&#39; &#124; &#39;coinmate&#39; &#124; &#39;coinmetro&#39; &#124; &#39;coinone&#39; &#124; &#39;coinsph&#39; &#124; &#39;coinspot&#39; &#124; &#39;cryptocom&#39; &#124; &#39;delta&#39; &#124; &#39;deribit&#39; &#124; &#39;digifinex&#39; &#124; &#39;exmo&#39; &#124; &#39;fmfwio&#39; &#124; &#39;gate&#39; &#124; &#39;gateio&#39; &#124; &#39;gemini&#39; &#124; &#39;hashkey&#39; &#124; &#39;hitbtc&#39; &#124; &#39;hollaex&#39; &#124; &#39;htx&#39; &#124; &#39;huobi&#39; &#124; &#39;huobijp&#39; &#124; &#39;hyperliquid&#39; &#124; &#39;independentreserve&#39; &#124; &#39;indodax&#39; &#124; &#39;kraken&#39; &#124; &#39;krakenfutures&#39; &#124; &#39;kucoin&#39; &#124; &#39;kucoinfutures&#39; &#124; &#39;latoken&#39; &#124; &#39;lbank&#39; &#124; &#39;luno&#39; &#124; &#39;mercado&#39; &#124; &#39;mexc&#39; &#124; &#39;ndax&#39; &#124; &#39;novadax&#39; &#124; &#39;oceanex&#39; &#124; &#39;okcoin&#39; &#124; &#39;okx&#39; &#124; &#39;onetrading&#39; &#124; &#39;oxfun&#39; &#124; &#39;p2b&#39; &#124; &#39;paradex&#39; &#124; &#39;paymium&#39; &#124; &#39;phemex&#39; &#124; &#39;poloniex&#39; &#124; &#39;poloniexfutures&#39; &#124; &#39;probit&#39; &#124; &#39;timex&#39; &#124; &#39;tradeogre&#39; &#124; &#39;upbit&#39; &#124; &#39;vertex&#39; &#124; &#39;wavesexchange&#39; &#124; &#39;whitebit&#39; &#124; &#39;woo&#39; &#124; &#39;woofipro&#39; &#124; &#39;xt&#39; &#124; &#39;yobit&#39; &#124; &#39;zaif&#39; &#124; &#39;zonda&#39;>** | The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;). | defaults to undefined
 **idem** | [**string**] | The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates. | defaults to undefined


### Return type

**ConnectWallet200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoOtt](README.md#bluvoOtt), [bluvoOttActionId](README.md#bluvoOttActionId), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **getOTTToken**
> GetOTTToken200Response getOTTToken()

Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.

### Example


```typescript
import { createConfiguration, OneTimeTokenApi } from '';
import type { OneTimeTokenApiGetOTTTokenRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OneTimeTokenApi(configuration);

const request: OneTimeTokenApiGetOTTTokenRequest = {
    // Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints. (optional)
  wantOtt: "true",
    // Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates. (optional)
  wantSubscribe: "true",
};

const data = await apiInstance.getOTTToken(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wantOtt** | [**&#39;true&#39; | &#39;false&#39;**]**Array<&#39;true&#39; &#124; &#39;false&#39;>** | Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints. | (optional) defaults to undefined
 **wantSubscribe** | [**&#39;true&#39; | &#39;false&#39;**]**Array<&#39;true&#39; &#124; &#39;false&#39;>** | Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates. | (optional) defaults to undefined


### Return type

**GetOTTToken200Response**

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

# **withdrawFundsOTT**
> WithdrawFunds200Response withdrawFundsOTT(withdrawFundsRequest)

Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/cex/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.

### Example


```typescript
import { createConfiguration, OneTimeTokenApi } from '';
import type { OneTimeTokenApiWithdrawFundsOTTRequest } from '';

const configuration = createConfiguration();
const apiInstance = new OneTimeTokenApi(configuration);

const request: OneTimeTokenApiWithdrawFundsOTTRequest = {
  
  withdrawFundsRequest: {
    asset: "asset_example",
    amount: 3.14,
    address: "address_example",
    tag: "tag_example",
    params: null,
  },
};

const data = await apiInstance.withdrawFundsOTT(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **withdrawFundsRequest** | **WithdrawFundsRequest**|  |


### Return type

**WithdrawFunds200Response**

### Authorization

[bluvoOrgId](README.md#bluvoOrgId), [bluvoOtt](README.md#bluvoOtt), [bluvoOttActionId](README.md#bluvoOttActionId), [bluvoProjectId](README.md#bluvoProjectId), [bluvoWalletId](README.md#bluvoWalletId)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


