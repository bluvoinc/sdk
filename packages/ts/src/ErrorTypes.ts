/**
 * Error type constants used across API responses
 * These enums ensure consistency between OpenAPI schema definitions and handler implementations
 */

// Generic error types
export const GENERIC_ERROR_TYPES = {
	NOT_FOUND: 'not_found',
	UNAUTHORIZED: 'unauthorized',
	INTERNAL_SERVER_ERROR: 'internal_server_error',
	VALIDATION_ERROR: 'validation_error',
	INVALID_REQUEST: 'invalid_request'
} as const;

// Wallet-specific error types
export const WALLET_ERROR_TYPES = {
	WALLET_NOT_FOUND: 'wallet_not_found',
	...GENERIC_ERROR_TYPES
} as const;

// Quote-specific error types  
export const QUOTE_ERROR_TYPES = {
	QUOTE_NOT_FOUND: 'quote_not_found',
	RESOURCE_EXHAUSTED: 'resource_exhausted', // quote expired
	...GENERIC_ERROR_TYPES
} as const;

// Withdrawal quotation error types (400 errors)
export const WITHDRAWAL_QUOTATION_ERROR_TYPES = {
	// Asset issues
	NOT_FOUND: 'not_found',
	
	// Address issues
	INVALID_ADDRESS: 'invalid_address',
	NETWORK_NOT_SUPPORTED: 'network_not_supported',
	
	// Amount issues
	AMOUNT_BELOW_MINIMUM: 'amount_below_minimum',
	AMOUNT_ABOVE_MAXIMUM: 'amount_above_maximum',
	INSUFFICIENT_BALANCE: 'insufficient_balance',
	INSUFFICIENT_BALANCE_CANNOT_COVER_FEE: 'insufficient_balance_cannot_cover_fee'
} as const;

// Withdrawal execution error types (400 errors)
export const WITHDRAWAL_EXECUTION_ERROR_TYPES = {
	RESOURCE_EXHAUSTED: 'resource_exhausted', // quote expired
	
	// 2FA types
	TWO_FACTOR_REQUIRED: 'two_factor_required',
	SMS_CODE_REQUIRED: 'sms_code_required',
	
	// Balance issues
	INSUFFICIENT_BALANCE: 'insufficient_balance',
	
	// Account verification issues
	UNVERIFIED_EMAIL: 'unverified_email',
	KYC_REQUIRED: 'kyc_required',
	
	// Generic errors
	UNAUTHORIZED: 'unauthorized',
	NOT_FOUND: 'not_found',
	INTERNAL_SERVER_ERROR: 'internal_server_error'
} as const;


// Type definitions for TypeScript
export type GenericErrorType = typeof GENERIC_ERROR_TYPES[keyof typeof GENERIC_ERROR_TYPES];
export type WalletErrorType = typeof WALLET_ERROR_TYPES[keyof typeof WALLET_ERROR_TYPES];
export type QuoteErrorType = typeof QUOTE_ERROR_TYPES[keyof typeof QUOTE_ERROR_TYPES];
export type WithdrawalQuotationErrorType = typeof WITHDRAWAL_QUOTATION_ERROR_TYPES[keyof typeof WITHDRAWAL_QUOTATION_ERROR_TYPES];
export type WithdrawalExecutionErrorType = typeof WITHDRAWAL_EXECUTION_ERROR_TYPES[keyof typeof WITHDRAWAL_EXECUTION_ERROR_TYPES];