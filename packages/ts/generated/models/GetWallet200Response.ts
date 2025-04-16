/**
 * Bluvo API
 * APIs to supercharge your crypto project.
 *
 * OpenAPI spec version: 0.0.2
 * Contact: help@bluvo.co
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

export class GetWallet200Response {
    /**
    * The exchange this wallet is connected to
    */
    'exchange': string;
    /**
    * The unique identifier of the wallet
    */
    'walletId': string;
    /**
    * Dictionary of asset balances where keys are asset symbols and values are total amounts
    */
    'balances': { [key: string]: number; };
    /**
    * The date and time when the wallet was created
    */
    'createdAt'?: string;
    /**
    * The date and time when the wallet was last updated
    */
    'updatedAt'?: string;
    /**
    * The date and time when the wallet was last synchronized
    */
    'lastSyncAt'?: string;
    /**
    * Array of IP addresses associated with the wallet
    */
    'ipPool'?: Array<string>;
    /**
    * Indicates if the API key is invalid
    */
    'invalidApi'?: boolean;

    static readonly discriminator: string | undefined = undefined;

    static readonly mapping: {[index: string]: string} | undefined = undefined;

    static readonly attributeTypeMap: Array<{name: string, baseName: string, type: string, format: string}> = [
        {
            "name": "exchange",
            "baseName": "exchange",
            "type": "string",
            "format": ""
        },
        {
            "name": "walletId",
            "baseName": "walletId",
            "type": "string",
            "format": ""
        },
        {
            "name": "balances",
            "baseName": "balances",
            "type": "{ [key: string]: number; }",
            "format": ""
        },
        {
            "name": "createdAt",
            "baseName": "createdAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "updatedAt",
            "baseName": "updatedAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "lastSyncAt",
            "baseName": "lastSyncAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "ipPool",
            "baseName": "ipPool",
            "type": "Array<string>",
            "format": ""
        },
        {
            "name": "invalidApi",
            "baseName": "invalidApi",
            "type": "boolean",
            "format": ""
        }    ];

    static getAttributeTypeMap() {
        return GetWallet200Response.attributeTypeMap;
    }

    public constructor() {
    }
}
