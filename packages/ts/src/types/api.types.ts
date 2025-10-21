/**
 * Clean, self-explanatory type exports for the Bluvo SDK
 *
 * These types are aliases to the auto-generated types from the OpenAPI spec,
 * providing a better developer experience with clear, intuitive names.
 */

// ============================================================================
// Wallet Types
// ============================================================================

import type { Walletlistlistwallets200ResponseWalletsInner } from '../../generated/models/Walletlistlistwallets200ResponseWalletsInner';
import type { Walletlistlistwallets200ResponseWalletsInnerBalancesValue } from '../../generated/models/Walletlistlistwallets200ResponseWalletsInnerBalancesValue';
import type { Walletlistlistwallets200ResponseWalletsInnerExchangeEnum } from '../../generated/models/Walletlistlistwallets200ResponseWalletsInner';
import type { Walletlistlistwallets200ResponseWalletsInnerInvalidApi } from '../../generated/models/Walletlistlistwallets200ResponseWalletsInnerInvalidApi';

/**
 * Represents a connected cryptocurrency exchange wallet
 */
export type Wallet = Walletlistlistwallets200ResponseWalletsInner;

/**
 * Balance information for a single cryptocurrency in a wallet
 */
export type WalletBalance = Walletlistlistwallets200ResponseWalletsInnerBalancesValue;

/**
 * All balances in a wallet, keyed by cryptocurrency symbol
 */
export type WalletBalances = { [key: string]: WalletBalance };

/**
 * Information about invalid API credentials for a wallet
 */
export type WalletInvalidApiInfo = Walletlistlistwallets200ResponseWalletsInnerInvalidApi;

/**
 * Supported cryptocurrency exchanges
 */
export type Exchange = Walletlistlistwallets200ResponseWalletsInnerExchangeEnum;

// Re-export the Exchange enum for direct use
export { Walletlistlistwallets200ResponseWalletsInnerExchangeEnum as ExchangeEnum } from '../../generated/models/Walletlistlistwallets200ResponseWalletsInner';

// ============================================================================
// Transaction Types
// ============================================================================

import type {
    Wallettransactionslisttransactions200ResponseTransactionsInner,
    Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum
} from '../../generated/models/Wallettransactionslisttransactions200ResponseTransactionsInner';

/**
 * Represents a single transaction in a wallet
 */
export type WalletTransaction = Wallettransactionslisttransactions200ResponseTransactionsInner;

/**
 * Type of transaction (deposit, withdrawal, or internal transaction)
 */
export type TransactionType = Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum;

/**
 * Direction of the transaction (in or out)
 */
export type TransactionDirection = Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum;

/**
 * Status of the transaction
 */
export type TransactionStatus = Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum;

/**
 * Supported fiat currencies for transaction amounts
 */
export type FiatCurrency = Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum;

// Re-export transaction enums
export {
    Wallettransactionslisttransactions200ResponseTransactionsInnerTypeEnum as TransactionTypeEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerDirectionEnum as TransactionDirectionEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerStatusEnum as TransactionStatusEnum,
    Wallettransactionslisttransactions200ResponseTransactionsInnerFiatCurrencyEnum as FiatCurrencyEnum
} from '../../generated/models/Wallettransactionslisttransactions200ResponseTransactionsInner';

// ============================================================================
// Withdrawal Types
// ============================================================================

import type { Walletwithdrawquotequotation200Response } from '../../generated/models/Walletwithdrawquotequotation200Response';
import type { Walletwithdrawbalancebalance200ResponseBalancesInner } from '../../generated/models/Walletwithdrawbalancebalance200ResponseBalancesInner';
import type { Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner } from '../../generated/models/Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner';
import type {
    Walletwithdrawquotequotation200ResponseFeeDetailsInner,
    Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum
} from '../../generated/models/Walletwithdrawquotequotation200ResponseFeeDetailsInner';

/**
 * A withdrawal quotation with fee breakdown and total amount
 */
export type WithdrawalQuotation = Walletwithdrawquotequotation200Response;

/**
 * Balance available for withdrawal for a specific cryptocurrency
 */
export type WithdrawableBalance = Walletwithdrawbalancebalance200ResponseBalancesInner;

/**
 * Network information for withdrawing a specific cryptocurrency
 */
export type WithdrawableNetwork = Walletwithdrawbalancebalance200ResponseBalancesInnerNetworksInner;

/**
 * Detailed fee information for a withdrawal
 */
export type FeeDetail = Walletwithdrawquotequotation200ResponseFeeDetailsInner;

/**
 * Category of a fee (exchange fee, network fee, provider fee, etc.)
 */
export type FeeCategory = Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum;

// Re-export fee category enum
export {
    Walletwithdrawquotequotation200ResponseFeeDetailsInnerCategoryEnum as FeeCategoryEnum
} from '../../generated/models/Walletwithdrawquotequotation200ResponseFeeDetailsInner';

// ============================================================================
// Exchange/OAuth Types
// ============================================================================

import type {
    Oauth2exchangeslistexchanges200ResponseExchangesInner,
    Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum
} from '../../generated/models/Oauth2exchangeslistexchanges200ResponseExchangesInner';

/**
 * Information about a supported exchange
 */
export type ExchangeInfo = Oauth2exchangeslistexchanges200ResponseExchangesInner;

/**
 * Status of an exchange (live, offline, maintenance, coming soon)
 */
export type ExchangeStatus = Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum;

// Re-export exchange status enum
export {
    Oauth2exchangeslistexchanges200ResponseExchangesInnerStatusEnum as ExchangeStatusEnum
} from '../../generated/models/Oauth2exchangeslistexchanges200ResponseExchangesInner';

// ============================================================================
// Workflow Types
// ============================================================================

import type { GetWorkflow200Response } from '../../generated/models/GetWorkflow200Response';
import type {
    GetWorkflow200ResponseDetails,
    GetWorkflow200ResponseDetailsStatusEnum
} from '../../generated/models/GetWorkflow200ResponseDetails';

/**
 * Represents a workflow run
 */
export type Workflow = GetWorkflow200Response;

/**
 * Details about a workflow run's status and errors
 */
export type WorkflowDetails = GetWorkflow200ResponseDetails;

/**
 * Status of a workflow (pending, running, complete, failed)
 */
export type WorkflowStatus = GetWorkflow200ResponseDetailsStatusEnum;

// Re-export workflow status enum
export {
    GetWorkflow200ResponseDetailsStatusEnum as WorkflowStatusEnum
} from '../../generated/models/GetWorkflow200ResponseDetails';

// ============================================================================
// Pagination Types
// ============================================================================

import type { Wallettransactionslisttransactions200ResponsePagination } from '../../generated/models/Wallettransactionslisttransactions200ResponsePagination';

/**
 * Pagination information for paginated API responses
 */
export type Pagination = Wallettransactionslisttransactions200ResponsePagination;

// ============================================================================
// Request Types
// ============================================================================

import type { WalletwithdrawquotequotationRequest } from '../../generated/models/WalletwithdrawquotequotationRequest';
import type { WalletwithdrawquoteidexecutewithdrawRequest } from '../../generated/models/WalletwithdrawquoteidexecutewithdrawRequest';

/**
 * Request parameters for creating a withdrawal quotation
 */
export type CreateQuotationRequest = WalletwithdrawquotequotationRequest;

/**
 * Request parameters for executing a withdrawal
 */
export type ExecuteWithdrawalRequest = WalletwithdrawquoteidexecutewithdrawRequest;

// ============================================================================
// Response Types
// ============================================================================

import type { Walletwithdrawquoteidexecutewithdraw200Response } from '../../generated/models/Walletwithdrawquoteidexecutewithdraw200Response';
import type { Oauth2exchangeurlgeturl200Response } from '../../generated/models/Oauth2exchangeurlgeturl200Response';

/**
 * Response from executing a withdrawal
 */
export type WithdrawalResponse = Walletwithdrawquoteidexecutewithdraw200Response;

/**
 * Response containing an OAuth2 authorization URL
 */
export type OAuth2UrlResponse = Oauth2exchangeurlgeturl200Response;
