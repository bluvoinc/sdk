/**
 * Centralized error codes for the entire system
 * This file contains all error codes used in both sync (API) and async (workflow) contexts
 * Copy this file to the SDK to maintain consistency
 */

/**
 * Error codes for all system errors
 * Format: CATEGORY_SPECIFIC_ERROR
 */
export const ERROR_CODES = {
  // Generic errors
  GENERIC_NOT_FOUND: 'GENERIC_NOT_FOUND',
  GENERIC_UNAUTHORIZED: 'GENERIC_UNAUTHORIZED',
  GENERIC_INTERNAL_SERVER_ERROR: 'GENERIC_INTERNAL_SERVER_ERROR',
  GENERIC_VALIDATION_ERROR: 'GENERIC_VALIDATION_ERROR',
  GENERIC_INVALID_REQUEST: 'GENERIC_INVALID_REQUEST',

  // Wallet errors
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_INVALID_CREDENTIALS: 'WALLET_INVALID_CREDENTIALS',

  // Quote errors
  QUOTE_NOT_FOUND: 'QUOTE_NOT_FOUND',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',

  // Withdrawal errors - Balance
  WITHDRAWAL_INSUFFICIENT_BALANCE: 'WITHDRAWAL_INSUFFICIENT_BALANCE',
  WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE: 'WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE',

  // Withdrawal errors - Address
  WITHDRAWAL_INVALID_ADDRESS: 'WITHDRAWAL_INVALID_ADDRESS',
  WITHDRAWAL_NETWORK_NOT_SUPPORTED: 'WITHDRAWAL_NETWORK_NOT_SUPPORTED',

  // Withdrawal errors - Amount
  WITHDRAWAL_AMOUNT_BELOW_MINIMUM: 'WITHDRAWAL_AMOUNT_BELOW_MINIMUM',
  WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM: 'WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM',

  // Withdrawal errors - Asset
  WITHDRAWAL_ASSET_NOT_SUPPORTED: 'WITHDRAWAL_ASSET_NOT_SUPPORTED',

  // Withdrawal errors - 2FA
  WITHDRAWAL_2FA_REQUIRED_TOTP: 'WITHDRAWAL_2FA_REQUIRED_TOTP',
  WITHDRAWAL_2FA_REQUIRED_SMS: 'WITHDRAWAL_2FA_REQUIRED_SMS',
  WITHDRAWAL_2FA_REQUIRED_YUBIKEY: 'WITHDRAWAL_2FA_REQUIRED_YUBIKEY',
  WITHDRAWAL_2FA_REQUIRED_PASSPHRASE: 'WITHDRAWAL_2FA_REQUIRED_PASSPHRASE',
  WITHDRAWAL_2FA_INVALID: 'WITHDRAWAL_2FA_INVALID',
  WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',

  // Withdrawal errors - Verification
  WITHDRAWAL_KYC_REQUIRED: 'WITHDRAWAL_KYC_REQUIRED',
  WITHDRAWAL_EMAIL_UNVERIFIED: 'WITHDRAWAL_EMAIL_UNVERIFIED',

  // OAuth errors
  OAUTH_AUTHORIZATION_FAILED: 'OAUTH_AUTHORIZATION_FAILED',
  OAUTH_TOKEN_EXCHANGE_FAILED: 'OAUTH_TOKEN_EXCHANGE_FAILED',
  OAUTH_INVALID_STATE: 'OAUTH_INVALID_STATE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
/**
 * Serializable error format that can be passed through workflows
 * This preserves all error information without losing type safety
 */
export interface SerializedError {
  code: ErrorCode;
  message: string;
  timestamp: string;
  originalError?: any;
}

/**
 * Check if an error object is a serialized error
 */
export function isSerializedError(error: any): error is SerializedError {
  return error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    Object.values(ERROR_CODES).includes(error.code);
}

/**
 * Extract error code from various error formats
 */
export function extractErrorCode(error: any): ErrorCode | null {

  // Check errorCode field (new format)
  if(error?.errorCode && Object.values(ERROR_CODES).includes(error.errorCode)) {
    return error.errorCode;
  }

  // Check type field (new format)
  if(error?.type && Object.values(ERROR_CODES).includes(error.type)) {
    return error.type;
  }

  // Check code field
  if (error?.code && Object.values(ERROR_CODES).includes(error.code)) {
    return error.code;
  }

  // Check if it's a serialized error
  if (isSerializedError(error)) {
    return error.code;
  }

  // Check nested response.data.type (legacy axios format)
  if (error?.response?.data?.type && Object.values(ERROR_CODES).includes(error.response.data.type)) {
    return error.response.data.type;
  }

  return null;
}

/**
 * Extract error result from various error formats
 */
export function extractErrorResult(error: any): any {
  // Check if error has a result field directly
  if (error?.result) {
    return error.result;
  }

  // Check if error has nested result in response data
  if (error?.response?.data?.result) {
    return error.response.data.result;
  }

  // Check in originalError if it's a serialized error
  if (error?.originalError?.result) {
    return error.originalError.result;
  }

  return null;
}

// Legacy compatibility - keep old constants but map to new error codes
// These will be deprecated in future versions
export const WITHDRAWAL_QUOTATION_ERROR_TYPES = {
  INSUFFICIENT_BALANCE: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
  INSUFFICIENT_BALANCE_CANNOT_COVER_FEE: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE,
  AMOUNT_BELOW_MINIMUM: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM,
  AMOUNT_ABOVE_MAXIMUM: ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM,
  INVALID_ADDRESS: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS,
  NETWORK_NOT_SUPPORTED: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED,
} as const;

export const WITHDRAWAL_EXECUTION_ERROR_TYPES = {
  TWO_FACTOR_REQUIRED: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP,
  SMS_CODE_REQUIRED: ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS,
  KYC_REQUIRED: ERROR_CODES.WITHDRAWAL_KYC_REQUIRED,
  INSUFFICIENT_BALANCE: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
  RESOURCE_EXHAUSTED: ERROR_CODES.QUOTE_EXPIRED,
} as const;