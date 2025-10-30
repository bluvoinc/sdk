// /**
//  * Clean, self-explanatory type exports for the Bluvo SDK
//  *
//  * These types are aliases to the auto-generated types from the OpenAPI spec,
//  * providing a better developer experience with clear, intuitive names.
//  */

// // ============================================================================
// // Wallet Types
// // ============================================================================

// import type {
// 	Oauth2ExchangeslistexchangesResponses,
// 	Oauth2ExchangeurlgeturlResponses,
// 	Walletget200Response,
// 	Walletlistlistwallets200ResponseWalletsInner,
// 	Walletlistlistwallets200ResponseWalletsInnerExchangeEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInner,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum,
// 	WalletwithdrawquoteidexecutewithdrawResponses,
// } from "../../generated";

// /**
//  * Represents a connected cryptocurrency exchange wallet
//  */
// export type Wallet = Walletget200Response;

// /**
//  * Balance information for a single cryptocurrency in a wallet
//  */
// export type WalletBalances =
// 	Walletlistlistwallets200ResponseWalletsInner["balances"];

// /**
//  * Supported cryptocurrency exchanges
//  */
// export type CentralizedExchange =
// 	Walletlistlistwallets200ResponseWalletsInnerExchangeEnum;


// // ============================================================================
// // Transaction Types
// // ============================================================================

// /**
//  * Represents a single transaction in a wallet
//  */
// export type WalletTransaction =
// 	Wallettransactionslisttransactions200ResponseTransactionsInner;

// /**
//  * Type of transaction (deposit, withdrawal, or internal transaction)
//  */
// export type TransactionType =
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum;

// /**
//  * Direction of the transaction (in or out)
//  */
// export type TransactionDirection =
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum;

// /**
//  * Status of the transaction
//  */
// export type TransactionStatus =
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum;

// /**
//  * Supported fiat currencies for transaction amounts
//  */
// export type FiatCurrency =
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum;

// // Re-export transaction enums
// export {
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum as TransactionDirectionEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum as FiatCurrencyEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum as TransactionStatusEnum,
// 	Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum as TransactionTypeEnum,
// } from "../../generated/models/Wallettransactionslisttransactions200ResponseTransactionsInner";

// // ============================================================================
// // Withdrawal Types
// // ============================================================================

// import type {
// 	Walletwithdrawbalancebalance200ResponseBalancesInner,
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerExtra,
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner,
// 	Walletwithdrawquotequotation200Response,
// 	Walletwithdrawquotequotation200ResponseFeeDetailsInner,
// 	Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum,
// } from "../../generated";

// /**
//  * A withdrawal quotation with fee breakdown and total amount
//  */
// export type WithdrawalQuotation = Walletwithdrawquotequotation200Response;

// /**
//  * Balance available for withdrawal for a specific cryptocurrency
//  */
// export type WithdrawableBalance =
// 	Walletwithdrawbalancebalance200ResponseBalancesInner;

// /**
//  * Extra metadata for a withdrawable balance (slug, assetId, etc.)
//  */
// export type WithdrawableBalanceExtra =
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerExtra;

// export type ChainId =
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner["chainId"];
// export type TokenAddress =
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner["tokenAddress"];

// /**
//  * Network information for withdrawing a specific cryptocurrency
//  */
// export type WithdrawableBalanceNetwork =
// 	Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner;

// /**
//  * Detailed fee information for a withdrawal
//  */
// export type FeeDetail = Walletwithdrawquotequotation200ResponseFeeDetailsInner;

// /**
//  * Category of a fee (exchange fee, network fee, provider fee, etc.)
//  */
// export type FeeCategory =
// 	Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum;

// // Re-export fee category enum
// export { Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum as FeeCategoryEnum } from "../../generated/models/Walletwithdrawquotequotation200ResponseFeeDetailsInner";

// // ============================================================================
// // Exchange/OAuth Types
// // ============================================================================

// type Oauth2exchangeslistexchanges200ResponseExchangesInner = Oauth2ExchangeslistexchangesResponses["200"]["exchanges"][number];
// type Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum = Oauth2exchangeslistexchanges200ResponseExchangesInner["status"];
// import {
// 	Oauth2exchangeslistexchanges200ResponseExchangesInner,
// 	Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum,
// } from "../../generated/types.gen";

// /**
//  * Information about a supported exchange
//  */
// export type ExchangeInfo =
// 	Oauth2exchangeslistexchanges200ResponseExchangesInner;

// /**
//  * Status of an exchange (live, offline, maintenance, coming soon)
//  */
// export type ExchangeStatus =
// 	Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum;

// // Re-export exchange status enum
// export { Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum as ExchangeStatusEnum } from "../../generated/models/Oauth2exchangeslistexchanges200ResponseExchangesInner";

// // ============================================================================
// // Workflow Types
// // ============================================================================

// import type { GetWorkflow200Response } from "../../generated/models/GetWorkflow200Response";
// import type {
// 	GetWorkflow200ResponseDetails,
// 	GetWorkflow200ResponseDetailsStatusEnum,
// } from "../../generated/models/GetWorkflow200ResponseDetails";

// /**
//  * Represents a workflow run
//  */
// export type Workflow = GetWorkflow200Response;

// /**
//  * Details about a workflow run's status and errors
//  */
// export type WorkflowDetails = GetWorkflow200ResponseDetails;

// /**
//  * Status of a workflow (pending, running, complete, failed)
//  */
// export type WorkflowStatus = GetWorkflow200ResponseDetailsStatusEnum;

// // Re-export workflow status enum
// export { GetWorkflow200ResponseDetailsStatusEnum as WorkflowStatusEnum } from "../../generated/models/GetWorkflow200ResponseDetails";

// // ============================================================================
// // Pagination Types
// // ============================================================================

// import type { Wallettransactionslisttransactions200ResponsePagination } from "../../generated/models/Wallettransactionslisttransactions200ResponsePagination";

// /**
//  * Pagination information for paginated API responses
//  */
// export type Pagination =
// 	Wallettransactionslisttransactions200ResponsePagination;

// // ============================================================================
// // Request Types
// // ============================================================================

// import type {
// 	WalletwithdrawquoteidexecutewithdrawRequest,
// 	WalletwithdrawquotequotationRequest,
// } from "../../generated";

// /**
//  * Request parameters for creating a withdrawal quotation
//  */
// export type CreateQuotationRequest = WalletwithdrawquotequotationRequest;

// /**
//  * Request parameters for executing a withdrawal
//  */
// export type ExecuteWithdrawalRequest =
// 	WalletwithdrawquoteidexecutewithdrawRequest;

// // ============================================================================
// // Response Types
// // ============================================================================

// // import type { Walletwithdrawquoteidexecutewithdraw200Response } from '../../generated';
// // import type { Oauth2exchangeurlgeturl200Response } from '../../generated';
// // import type { Oauth2exchangeslistexchanges200Response } from '../../generated';

// /**
//  * Response from executing a withdrawal
//  */
// export type WithdrawalResponse =
// 	WalletwithdrawquoteidexecutewithdrawResponses["200"];

// /**
//  * Response containing an OAuth2 authorization URL
//  */
// export type OAuth2UrlResponse = Oauth2ExchangeurlgeturlResponses["200"];

// /**
//  * Response containing list of supported centralized exchanges
//  */
// export type ListCentralizedExchangesResponse =
// 	Oauth2ExchangeslistexchangesResponses["200"];

// /**
//  * Status type for centralized exchanges (live, offline, maintenance, coming_soon)
//  */
// export type ListCentralizedExchangesResponseStatus =
// 	Oauth2ExchangeslistexchangesResponses["200"]["exchanges"][number]["status"];

// const ListCentralizedExchangesResponseStatusEnum = Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum;

// // export { Oauth2Exchangeslistexchanges200ResponseExchangesInnerStatusEnum as ListCentralizedExchangesResponseStatusEnum } from "../../generated/models/Oauth2exchangeslistexchanges200ResponseExchangesInner";
// // // Re-export the status enum for direct use
// // export { Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum as ListCentralizedExchangesResponseStatusEnum } from "../../generated/models/Oauth2exchangeslistexchanges200ResponseExchangesInner";
