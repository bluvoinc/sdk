// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { ConnectWallet200Response } from '../models/ConnectWallet200Response';
import { ConnectWalletRequest } from '../models/ConnectWalletRequest';
import { GetOTTToken200Response } from '../models/GetOTTToken200Response';
import { WithdrawFunds200Response } from '../models/WithdrawFunds200Response';
import { WithdrawFundsRequest } from '../models/WithdrawFundsRequest';

/**
 * no description
 */
export class OneTimeTokenApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * The same \'/cex/connect/:exchange\' endpoint, but using One-Time Token (OTT) authentication instead of API Key authentication (for UI-based connections). Connect an external cryptocurrency exchange account to your Bluvo project using a One-Time Token (OTT). This endpoint is similar to the \'/cex/connect/:exchange\' endpoint but uses OTT authentication instead of API Key authentication. The connection is established using the exchange API credentials provided in the request body. It returns a unique workflow run ID that can be used to track the connection process.
     * Connect Wallet (OTT)
     * @param exchange The identifier of the exchange to connect (e.g. \&#39;binance\&#39;, \&#39;kraken\&#39;).
     * @param idem The idem provided by OTT or used to identify the workflow run. This is used to track the connection process and can be used to subscribe to updates.
     * @param connectWalletRequest 
     */
    public async connectWalletOTT(exchange: 'ace' | 'ascendex' | 'bequant' | 'bigone' | 'binance' | 'coinbase' | 'binanceus' | 'bingx' | 'bit2c' | 'bitbank' | 'bitbns' | 'bitcoincom' | 'bitfinex' | 'bitflyer' | 'bitget' | 'bithumb' | 'bitmart' | 'bitmex' | 'bitopro' | 'bitpanda' | 'bitrue' | 'bitso' | 'bitstamp' | 'bitteam' | 'bitvavo' | 'bl3p' | 'blockchaincom' | 'blofin' | 'btcalpha' | 'btcbox' | 'btcmarkets' | 'btcturk' | 'cex' | 'coincheck' | 'coinex' | 'coinlist' | 'coinmate' | 'coinmetro' | 'coinone' | 'coinsph' | 'coinspot' | 'cryptocom' | 'delta' | 'deribit' | 'digifinex' | 'exmo' | 'fmfwio' | 'gate' | 'gateio' | 'gemini' | 'hashkey' | 'hitbtc' | 'hollaex' | 'htx' | 'huobi' | 'huobijp' | 'hyperliquid' | 'independentreserve' | 'indodax' | 'kraken' | 'krakenfutures' | 'kucoin' | 'kucoinfutures' | 'latoken' | 'lbank' | 'luno' | 'mercado' | 'mexc' | 'ndax' | 'novadax' | 'oceanex' | 'okcoin' | 'okx' | 'onetrading' | 'oxfun' | 'p2b' | 'paradex' | 'paymium' | 'phemex' | 'poloniex' | 'poloniexfutures' | 'probit' | 'timex' | 'tradeogre' | 'upbit' | 'vertex' | 'wavesexchange' | 'whitebit' | 'woo' | 'woofipro' | 'xt' | 'yobit' | 'zaif' | 'zonda', idem: string, connectWalletRequest: ConnectWalletRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'exchange' is not null or undefined
        if (exchange === null || exchange === undefined) {
            throw new RequiredError("OneTimeTokenApi", "connectWalletOTT", "exchange");
        }


        // verify required parameter 'idem' is not null or undefined
        if (idem === null || idem === undefined) {
            throw new RequiredError("OneTimeTokenApi", "connectWalletOTT", "idem");
        }


        // verify required parameter 'connectWalletRequest' is not null or undefined
        if (connectWalletRequest === null || connectWalletRequest === undefined) {
            throw new RequiredError("OneTimeTokenApi", "connectWalletOTT", "connectWalletRequest");
        }


        // Path Params
        const localVarPath = '/v0/ott/cex/connect/{exchange}'
            .replace('{' + 'exchange' + '}', encodeURIComponent(String(exchange)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.POST);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (idem !== undefined) {
            requestContext.setQueryParam("idem", ObjectSerializer.serialize(idem, "string", ""));
        }


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(connectWalletRequest, "ConnectWalletRequest", ""),
            contentType
        );
        requestContext.setBody(serializedBody);

        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOtt"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOttActionId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Retrieve an OTT (One-Time Token) for accessing private endpoints. This endpoint requires authentication via a valid Bluvo API Key and accepts an optional \'x-bluvo-wallet-id\' header to tie the token to a specific wallet. The token can then be used for subsequent requests to OTT-enabled endpoints.
     * Get OTT Token
     * @param wantOtt Optional. If true, the response will include a One-Time Token (OTT) for accessing private endpoints.
     * @param wantSubscribe Optional. If true, the response will include a subscription token for WebSocket streaming of workflow updates.
     */
    public async getOTTToken(wantOtt?: 'true' | 'false', wantSubscribe?: 'true' | 'false', _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/v0/ott/token';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (wantOtt !== undefined) {
            requestContext.setQueryParam("wantOtt", ObjectSerializer.serialize(wantOtt, "'true' | 'false'", ""));
        }

        // Query Params
        if (wantSubscribe !== undefined) {
            requestContext.setQueryParam("wantSubscribe", ObjectSerializer.serialize(wantSubscribe, "'true' | 'false'", ""));
        }


        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoApiKey"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Withdraw cryptocurrency from an exchange wallet to an external address. This endpoint supports both API Key authentication and OTT (One-Time Token) authentication. When using OTT authentication, this endpoint can be accessed via the \'/ott/cex/wallet/withdraw\' route. The request initiates an asynchronous withdrawal process and returns a workflow run ID that can be used to track the transaction status.
     * Withdraw Funds (OTT)
     * @param withdrawFundsRequest 
     */
    public async withdrawFundsOTT(withdrawFundsRequest: WithdrawFundsRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'withdrawFundsRequest' is not null or undefined
        if (withdrawFundsRequest === null || withdrawFundsRequest === undefined) {
            throw new RequiredError("OneTimeTokenApi", "withdrawFundsOTT", "withdrawFundsRequest");
        }


        // Path Params
        const localVarPath = '/v0/ott/cex/wallet/withdraw';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.PUT);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(withdrawFundsRequest, "WithdrawFundsRequest", ""),
            contentType
        );
        requestContext.setBody(serializedBody);

        let authMethod: SecurityAuthentication | undefined;
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOrgId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoOtt"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoProjectId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        // Apply auth methods
        authMethod = _config.authMethods["bluvoWalletId"]
        if (authMethod?.applySecurityAuthentication) {
            await authMethod?.applySecurityAuthentication(requestContext);
        }
        
        const defaultAuth: SecurityAuthentication | undefined = _config?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class OneTimeTokenApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to connectWalletOTT
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async connectWalletOTTWithHttpInfo(response: ResponseContext): Promise<HttpInfo<ConnectWallet200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: ConnectWallet200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ConnectWallet200Response", ""
            ) as ConnectWallet200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: ConnectWallet200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ConnectWallet200Response", ""
            ) as ConnectWallet200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to getOTTToken
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async getOTTTokenWithHttpInfo(response: ResponseContext): Promise<HttpInfo<GetOTTToken200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: GetOTTToken200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GetOTTToken200Response", ""
            ) as GetOTTToken200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: GetOTTToken200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GetOTTToken200Response", ""
            ) as GetOTTToken200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to withdrawFundsOTT
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async withdrawFundsOTTWithHttpInfo(response: ResponseContext): Promise<HttpInfo<WithdrawFunds200Response >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: WithdrawFunds200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WithdrawFunds200Response", ""
            ) as WithdrawFunds200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: WithdrawFunds200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WithdrawFunds200Response", ""
            ) as WithdrawFunds200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
