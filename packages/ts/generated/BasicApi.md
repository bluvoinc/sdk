# .BasicApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**asset**](BasicApi.md#asset) | **GET** /v0/info/asset/{asset} | Asset
[**listAssets**](BasicApi.md#listAssets) | **GET** /v0/info/assets | List Assets
[**listPairs**](BasicApi.md#listPairs) | **GET** /v0/info/{exchange}/pairs | List Pairs


# **asset**
> Asset200Response asset()

Retrieve detailed information for a specific asset. The asset parameter in the URL path should be the asset\'s symbol (e.g. BTC, ETH). Because some assets have duplications, this endpoint returns a list of matching asset objects. Optionally, the \'img\' query parameter can be used to control whether an image URL is included and which variant is provided.

### Example


```typescript
import { createConfiguration, BasicApi } from '';
import type { BasicApiAssetRequest } from '';

const configuration = createConfiguration();
const apiInstance = new BasicApi(configuration);

const request: BasicApiAssetRequest = {
    // The asset symbol to query (e.g. BTC, ETH).
  asset: "asset_example",
    // Specifies whether to include an image URL in each asset object. Allowed values are: \'true\' (include the default image), \'false\' (exclude image), \'32\' (32px variant), or \'64\' (64px variant). (optional)
  img: "false",
};

const data = await apiInstance.asset(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **asset** | [**string**] | The asset symbol to query (e.g. BTC, ETH). | defaults to undefined
 **img** | [**&#39;false&#39; | &#39;32&#39; | &#39;64&#39; | &#39;128&#39;**]**Array<&#39;false&#39; &#124; &#39;32&#39; &#124; &#39;64&#39; &#124; &#39;128&#39;>** | Specifies whether to include an image URL in each asset object. Allowed values are: \&#39;true\&#39; (include the default image), \&#39;false\&#39; (exclude image), \&#39;32\&#39; (32px variant), or \&#39;64\&#39; (64px variant). | (optional) defaults to undefined


### Return type

**Asset200Response**

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

# **listAssets**
> ListAssets200Response listAssets()

Retrieve a paginated list of available assets. Optionally, use the \'img\' query parameter to include a specific image variant with each asset. The \'page\' and \'limit\' parameters control pagination.

### Example


```typescript
import { createConfiguration, BasicApi } from '';
import type { BasicApiListAssetsRequest } from '';

const configuration = createConfiguration();
const apiInstance = new BasicApi(configuration);

const request: BasicApiListAssetsRequest = {
    // Optional. Specifies the image variant for each asset. Allowed values: \'false\' (exclude images), \'true\' (include default image), \'64\' (64px variant), or \'32\' (32px variant). (optional)
  img: "false",
    // Optional. Page number for pagination (0-indexed). Defaults to 0. (optional)
  page: 0,
    // Optional. Maximum number of assets to return per page. Defaults to 100. (optional)
  limit: 0,
};

const data = await apiInstance.listAssets(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **img** | [**&#39;false&#39; | &#39;32&#39; | &#39;64&#39; | &#39;128&#39;**]**Array<&#39;false&#39; &#124; &#39;32&#39; &#124; &#39;64&#39; &#124; &#39;128&#39;>** | Optional. Specifies the image variant for each asset. Allowed values: \&#39;false\&#39; (exclude images), \&#39;true\&#39; (include default image), \&#39;64\&#39; (64px variant), or \&#39;32\&#39; (32px variant). | (optional) defaults to undefined
 **page** | [**number**] | Optional. Page number for pagination (0-indexed). Defaults to 0. | (optional) defaults to undefined
 **limit** | [**number**] | Optional. Maximum number of assets to return per page. Defaults to 100. | (optional) defaults to undefined


### Return type

**ListAssets200Response**

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

# **listPairs**
> ListPairs200Response listPairs()

Retrieve a list of available trading pairs for a specified exchange. The exchange parameter in the URL path must be one of the supported exchanges.

### Example


```typescript
import { createConfiguration, BasicApi } from '';
import type { BasicApiListPairsRequest } from '';

const configuration = createConfiguration();
const apiInstance = new BasicApi(configuration);

const request: BasicApiListPairsRequest = {
    // The identifier of the exchange to query (e.g. \'binance\', \'kraken\').
  exchange: "ace",
};

const data = await apiInstance.listPairs(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exchange** | [**&#39;ace&#39; | &#39;ascendex&#39; | &#39;bequant&#39; | &#39;bigone&#39; | &#39;binance&#39; | &#39;coinbase&#39; | &#39;binanceus&#39; | &#39;bingx&#39; | &#39;bit2c&#39; | &#39;bitbank&#39; | &#39;bitbns&#39; | &#39;bitcoincom&#39; | &#39;bitfinex&#39; | &#39;bitflyer&#39; | &#39;bitget&#39; | &#39;bithumb&#39; | &#39;bitmart&#39; | &#39;bitmex&#39; | &#39;bitopro&#39; | &#39;bitpanda&#39; | &#39;bitrue&#39; | &#39;bitso&#39; | &#39;bitstamp&#39; | &#39;bitteam&#39; | &#39;bitvavo&#39; | &#39;bybit&#39; | &#39;bl3p&#39; | &#39;blockchaincom&#39; | &#39;blofin&#39; | &#39;btcalpha&#39; | &#39;btcbox&#39; | &#39;btcmarkets&#39; | &#39;btcturk&#39; | &#39;cex&#39; | &#39;coincheck&#39; | &#39;coinex&#39; | &#39;coinlist&#39; | &#39;coinmate&#39; | &#39;coinmetro&#39; | &#39;coinone&#39; | &#39;coinsph&#39; | &#39;coinspot&#39; | &#39;cryptocom&#39; | &#39;delta&#39; | &#39;deribit&#39; | &#39;digifinex&#39; | &#39;exmo&#39; | &#39;fmfwio&#39; | &#39;gate&#39; | &#39;gateio&#39; | &#39;gemini&#39; | &#39;hashkey&#39; | &#39;hitbtc&#39; | &#39;hollaex&#39; | &#39;htx&#39; | &#39;huobi&#39; | &#39;huobijp&#39; | &#39;hyperliquid&#39; | &#39;independentreserve&#39; | &#39;indodax&#39; | &#39;kraken&#39; | &#39;krakenfutures&#39; | &#39;kucoin&#39; | &#39;kucoinfutures&#39; | &#39;latoken&#39; | &#39;lbank&#39; | &#39;luno&#39; | &#39;mercado&#39; | &#39;mexc&#39; | &#39;ndax&#39; | &#39;novadax&#39; | &#39;oceanex&#39; | &#39;okcoin&#39; | &#39;okx&#39; | &#39;onetrading&#39; | &#39;oxfun&#39; | &#39;p2b&#39; | &#39;paradex&#39; | &#39;paymium&#39; | &#39;phemex&#39; | &#39;poloniex&#39; | &#39;poloniexfutures&#39; | &#39;probit&#39; | &#39;timex&#39; | &#39;tradeogre&#39; | &#39;upbit&#39; | &#39;vertex&#39; | &#39;wavesexchange&#39; | &#39;whitebit&#39; | &#39;woo&#39; | &#39;woofipro&#39; | &#39;xt&#39; | &#39;yobit&#39; | &#39;zaif&#39; | &#39;zonda&#39;**]**Array<&#39;ace&#39; &#124; &#39;ascendex&#39; &#124; &#39;bequant&#39; &#124; &#39;bigone&#39; &#124; &#39;binance&#39; &#124; &#39;coinbase&#39; &#124; &#39;binanceus&#39; &#124; &#39;bingx&#39; &#124; &#39;bit2c&#39; &#124; &#39;bitbank&#39; &#124; &#39;bitbns&#39; &#124; &#39;bitcoincom&#39; &#124; &#39;bitfinex&#39; &#124; &#39;bitflyer&#39; &#124; &#39;bitget&#39; &#124; &#39;bithumb&#39; &#124; &#39;bitmart&#39; &#124; &#39;bitmex&#39; &#124; &#39;bitopro&#39; &#124; &#39;bitpanda&#39; &#124; &#39;bitrue&#39; &#124; &#39;bitso&#39; &#124; &#39;bitstamp&#39; &#124; &#39;bitteam&#39; &#124; &#39;bitvavo&#39; &#124; &#39;bybit&#39; &#124; &#39;bl3p&#39; &#124; &#39;blockchaincom&#39; &#124; &#39;blofin&#39; &#124; &#39;btcalpha&#39; &#124; &#39;btcbox&#39; &#124; &#39;btcmarkets&#39; &#124; &#39;btcturk&#39; &#124; &#39;cex&#39; &#124; &#39;coincheck&#39; &#124; &#39;coinex&#39; &#124; &#39;coinlist&#39; &#124; &#39;coinmate&#39; &#124; &#39;coinmetro&#39; &#124; &#39;coinone&#39; &#124; &#39;coinsph&#39; &#124; &#39;coinspot&#39; &#124; &#39;cryptocom&#39; &#124; &#39;delta&#39; &#124; &#39;deribit&#39; &#124; &#39;digifinex&#39; &#124; &#39;exmo&#39; &#124; &#39;fmfwio&#39; &#124; &#39;gate&#39; &#124; &#39;gateio&#39; &#124; &#39;gemini&#39; &#124; &#39;hashkey&#39; &#124; &#39;hitbtc&#39; &#124; &#39;hollaex&#39; &#124; &#39;htx&#39; &#124; &#39;huobi&#39; &#124; &#39;huobijp&#39; &#124; &#39;hyperliquid&#39; &#124; &#39;independentreserve&#39; &#124; &#39;indodax&#39; &#124; &#39;kraken&#39; &#124; &#39;krakenfutures&#39; &#124; &#39;kucoin&#39; &#124; &#39;kucoinfutures&#39; &#124; &#39;latoken&#39; &#124; &#39;lbank&#39; &#124; &#39;luno&#39; &#124; &#39;mercado&#39; &#124; &#39;mexc&#39; &#124; &#39;ndax&#39; &#124; &#39;novadax&#39; &#124; &#39;oceanex&#39; &#124; &#39;okcoin&#39; &#124; &#39;okx&#39; &#124; &#39;onetrading&#39; &#124; &#39;oxfun&#39; &#124; &#39;p2b&#39; &#124; &#39;paradex&#39; &#124; &#39;paymium&#39; &#124; &#39;phemex&#39; &#124; &#39;poloniex&#39; &#124; &#39;poloniexfutures&#39; &#124; &#39;probit&#39; &#124; &#39;timex&#39; &#124; &#39;tradeogre&#39; &#124; &#39;upbit&#39; &#124; &#39;vertex&#39; &#124; &#39;wavesexchange&#39; &#124; &#39;whitebit&#39; &#124; &#39;woo&#39; &#124; &#39;woofipro&#39; &#124; &#39;xt&#39; &#124; &#39;yobit&#39; &#124; &#39;zaif&#39; &#124; &#39;zonda&#39;>** | The identifier of the exchange to query (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;). | defaults to undefined


### Return type

**ListPairs200Response**

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


