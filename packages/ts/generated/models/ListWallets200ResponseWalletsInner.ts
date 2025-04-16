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

export class ListWallets200ResponseWalletsInner {
    /**
    * The unique identifier of the wallet
    */
    'id': string;
    /**
    * The project ID where the wallet is connected
    */
    'projectId': string;
    /**
    * The date and time when the wallet was created
    */
    'createdAt': string;
    /**
    * The date and time when the wallet was last updated
    */
    'updatedAt': string;
    /**
    * The date and time when the wallet was last synchronized
    */
    'lastSyncAt': string;
    /**
    * The exchange this wallet is connected to
    */
    'exchange': string;
    /**
    * Dictionary of asset balances where keys are asset symbols and values are total amounts
    */
    'balances': { [key: string]: number; };
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
            "name": "id",
            "baseName": "id",
            "type": "string",
            "format": ""
        },
        {
            "name": "projectId",
            "baseName": "projectId",
            "type": "string",
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
            "name": "exchange",
            "baseName": "exchange",
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
        return ListWallets200ResponseWalletsInner.attributeTypeMap;
    }

    public constructor() {
    }
}
