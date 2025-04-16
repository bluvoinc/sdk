# .PricesApi

All URIs are relative to *https://api-bluvo.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**candlesticks**](PricesApi.md#candlesticks) | **GET** /v0/price/candles/{asset}/{quote} | Candlesticks


# **candlesticks**
> Array<Array<any>> candlesticks()

Fetch historical candlestick (OHLCV) data for a given asset and quote currency. You may optionally filter the data using query parameters: \'since\' and \'until\' for the time range, \'exchange\' to specify the data source, and \'granularity\' to set the time interval for each candlestick.

### Example


```typescript
import { createConfiguration, PricesApi } from '';
import type { PricesApiCandlesticksRequest } from '';

const configuration = createConfiguration();
const apiInstance = new PricesApi(configuration);

const request: PricesApiCandlesticksRequest = {
    // The asset symbol to retrieve candlestick data for (e.g. BTC, ETH).
  asset: "asset_example",
    // The quote currency used in the trading pair (e.g. USDT).
  quote: "USDT",
    // Optional. The start timestamp (in UNIX milliseconds) for the candlestick data range. (optional)
  since: 0,
    // Optional. The end timestamp (in UNIX milliseconds) for the candlestick data range. (optional)
  until: 0,
    // Optional. The exchange from which to retrieve candlestick data. Defaults to \'binance\'. (optional)
  exchange: "binance",
    // Optional. The time interval for each candlestick. Allowed values include \'1m\', \'15m\', \'30m\', \'1h\', \'4h\', \'1d\'. (optional)
  granularity: "1h",
};

const data = await apiInstance.candlesticks(request);
console.log('API called successfully. Returned data:', data);
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **asset** | [**string**] | The asset symbol to retrieve candlestick data for (e.g. BTC, ETH). | defaults to undefined
 **quote** | [**&#39;USDT&#39;**]**Array<&#39;USDT&#39;>** | The quote currency used in the trading pair (e.g. USDT). | defaults to undefined
 **since** | [**number**] | Optional. The start timestamp (in UNIX milliseconds) for the candlestick data range. | (optional) defaults to undefined
 **until** | [**number**] | Optional. The end timestamp (in UNIX milliseconds) for the candlestick data range. | (optional) defaults to undefined
 **exchange** | [**&#39;binance&#39; | &#39;kraken&#39; | &#39;bitget&#39; | &#39;bitmart&#39; | &#39;bybit&#39; | &#39;coinbase&#39; | &#39;cryptocom&#39; | &#39;gateio&#39; | &#39;kraken&#39; | &#39;kucoin&#39; | &#39;okx&#39;**]**Array<&#39;binance&#39; &#124; &#39;kraken&#39; &#124; &#39;bitget&#39; &#124; &#39;bitmart&#39; &#124; &#39;bybit&#39; &#124; &#39;coinbase&#39; &#124; &#39;cryptocom&#39; &#124; &#39;gateio&#39; &#124; &#39;kraken&#39; &#124; &#39;kucoin&#39; &#124; &#39;okx&#39;>** | Optional. The exchange from which to retrieve candlestick data. Defaults to \&#39;binance\&#39;. | (optional) defaults to undefined
 **granularity** | [**&#39;1h&#39;**]**Array<&#39;1h&#39;>** | Optional. The time interval for each candlestick. Allowed values include \&#39;1m\&#39;, \&#39;15m\&#39;, \&#39;30m\&#39;, \&#39;1h\&#39;, \&#39;4h\&#39;, \&#39;1d\&#39;. | (optional) defaults to undefined


### Return type

**Array<Array<any>>**

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


