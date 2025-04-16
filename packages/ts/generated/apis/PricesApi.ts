// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError} from './baseapi';
import {Configuration} from '../configuration';
import {HttpInfo, HttpMethod, RequestContext, ResponseContext} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


/**
 * no description
 */
export class PricesApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Fetch historical candlestick (OHLCV) data for a given asset and quote currency. You may optionally filter the data using query parameters: \'since\' and \'until\' for the time range, \'exchange\' to specify the data source, and \'granularity\' to set the time interval for each candlestick.
     * Candlesticks
     * @param asset The asset symbol to retrieve candlestick data for (e.g. BTC, ETH).
     * @param quote The quote currency used in the trading pair (e.g. USDT).
     * @param since Optional. The start timestamp (in UNIX milliseconds) for the candlestick data range.
     * @param until Optional. The end timestamp (in UNIX milliseconds) for the candlestick data range.
     * @param exchange Optional. The exchange from which to retrieve candlestick data. Defaults to \&#39;binance\&#39;.
     * @param granularity Optional. The time interval for each candlestick. Allowed values include \&#39;1m\&#39;, \&#39;15m\&#39;, \&#39;30m\&#39;, \&#39;1h\&#39;, \&#39;4h\&#39;, \&#39;1d\&#39;.
     */
    public async candlesticks(asset: string, quote: 'USDT', since?: number, until?: number, exchange?: 'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx', granularity?: '1h', _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'asset' is not null or undefined
        if (asset === null || asset === undefined) {
            throw new RequiredError("PricesApi", "candlesticks", "asset");
        }


        // verify required parameter 'quote' is not null or undefined
        if (quote === null || quote === undefined) {
            throw new RequiredError("PricesApi", "candlesticks", "quote");
        }






        // Path Params
        const localVarPath = '/v0/price/candles/{asset}/{quote}'
            .replace('{' + 'asset' + '}', encodeURIComponent(String(asset)))
            .replace('{' + 'quote' + '}', encodeURIComponent(String(quote)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (since !== undefined) {
            requestContext.setQueryParam("since", ObjectSerializer.serialize(since, "number", ""));
        }

        // Query Params
        if (until !== undefined) {
            requestContext.setQueryParam("until", ObjectSerializer.serialize(until, "number", ""));
        }

        // Query Params
        if (exchange !== undefined) {
            requestContext.setQueryParam("exchange", ObjectSerializer.serialize(exchange, "'binance' | 'kraken' | 'bitget' | 'bitmart' | 'bybit' | 'coinbase' | 'cryptocom' | 'gateio' | 'kraken' | 'kucoin' | 'okx'", ""));
        }

        // Query Params
        if (granularity !== undefined) {
            requestContext.setQueryParam("granularity", ObjectSerializer.serialize(granularity, "'1h'", ""));
        }


        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class PricesApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to candlesticks
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async candlesticksWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Array<Array<any>> >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Array<Array<any>> = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Array<Array<any>>", ""
            ) as Array<Array<any>>;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Array<Array<any>> = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Array<Array<any>>", ""
            ) as Array<Array<any>>;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
