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

  // Withdrawal errors - 2FA
  WITHDRAWAL_2FA_REQUIRED_TOTP: 'WITHDRAWAL_2FA_REQUIRED_TOTP',
  WITHDRAWAL_2FA_REQUIRED_SMS: 'WITHDRAWAL_2FA_REQUIRED_SMS',
  WITHDRAWAL_2FA_REQUIRED_YUBIKEY: 'WITHDRAWAL_2FA_REQUIRED_YUBIKEY',
  WITHDRAWAL_2FA_REQUIRED_PASSPHRASE: 'WITHDRAWAL_2FA_REQUIRED_PASSPHRASE',
  WITHDRAWAL_2FA_INVALID: 'WITHDRAWAL_2FA_INVALID',

  // Withdrawal errors - Verification
  WITHDRAWAL_KYC_REQUIRED: 'WITHDRAWAL_KYC_REQUIRED',
  WITHDRAWAL_EMAIL_UNVERIFIED: 'WITHDRAWAL_EMAIL_UNVERIFIED',

  // OAuth errors
  OAUTH_AUTHORIZATION_FAILED: 'OAUTH_AUTHORIZATION_FAILED',
  OAUTH_TOKEN_EXCHANGE_FAILED: 'OAUTH_TOKEN_EXCHANGE_FAILED',
  OAUTH_INVALID_STATE: 'OAUTH_INVALID_STATE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export type StatusCode = 100 | 102 | 103
    | 200 | 201 | 202 | 203 | 206 | 207 | 208 | 226
    | 300 | 301 | 302 | 303 | 305 | 306 | 307 | 308
    | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409
    | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418
    | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451
    | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

/**
 * Error metadata containing additional information about each error
 */
export const ERROR_METADATA: Record<ErrorCode, {
  httpStatus: StatusCode;
  category: 'generic' | 'wallet' | 'quote' | 'withdrawal' | 'oauth';
  severity: 'info' | 'warning' | 'error' | 'critical';
  retryable: boolean;
  userMessage: string;
}> = {
  // Generic errors
  [ERROR_CODES.GENERIC_NOT_FOUND]: {
    httpStatus: 404,
    category: 'generic',
    severity: 'warning',
    retryable: false,
    userMessage: 'Resource not found',
  },
  [ERROR_CODES.GENERIC_UNAUTHORIZED]: {
    httpStatus: 401,
    category: 'generic',
    severity: 'warning',
    retryable: false,
    userMessage: 'Unauthorized access',
  },
  [ERROR_CODES.GENERIC_INTERNAL_SERVER_ERROR]: {
    httpStatus: 500,
    category: 'generic',
    severity: 'critical',
    retryable: true,
    userMessage: 'Internal server error',
  },
  [ERROR_CODES.GENERIC_VALIDATION_ERROR]: {
    httpStatus: 400,
    category: 'generic',
    severity: 'warning',
    retryable: false,
    userMessage: 'Validation error',
  },
  [ERROR_CODES.GENERIC_INVALID_REQUEST]: {
    httpStatus: 400,
    category: 'generic',
    severity: 'warning',
    retryable: false,
    userMessage: 'Invalid request',
  },

  // Wallet errors
  [ERROR_CODES.WALLET_NOT_FOUND]: {
    httpStatus: 404,
    category: 'wallet',
    severity: 'error',
    retryable: false,
    userMessage: 'Wallet not found',
  },
  [ERROR_CODES.WALLET_INVALID_CREDENTIALS]: {
    httpStatus: 401,
    category: 'wallet',
    severity: 'error',
    retryable: false,
    userMessage: 'Invalid wallet credentials',
  },

  // Quote errors
  [ERROR_CODES.QUOTE_NOT_FOUND]: {
    httpStatus: 404,
    category: 'quote',
    severity: 'warning',
    retryable: false,
    userMessage: 'Quote not found',
  },
  [ERROR_CODES.QUOTE_EXPIRED]: {
    httpStatus: 400,
    category: 'quote',
    severity: 'warning',
    retryable: false,
    userMessage: 'Quote has expired',
  },

  // Withdrawal errors - Balance
  [ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Insufficient balance for withdrawal',
  },
  [ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Insufficient balance to cover fees',
  },

  // Withdrawal errors - Address
  [ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Invalid withdrawal address',
  },
  [ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Network not supported',
  },

  // Withdrawal errors - Amount
  [ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Amount below minimum withdrawal limit',
  },
  [ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Amount above maximum withdrawal limit',
  },

  // Withdrawal errors - 2FA
  [ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'info',
    retryable: true,
    userMessage: 'TOTP two-factor authentication required',
  },
  [ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'info',
    retryable: true,
    userMessage: 'SMS two-factor authentication required',
  },
  [ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_YUBIKEY]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'info',
    retryable: true,
    userMessage: 'YubiKey two-factor authentication required',
  },
  [ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_PASSPHRASE]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'info',
    retryable: true,
    userMessage: 'Passphrase two-factor authentication required',
  },
  [ERROR_CODES.WITHDRAWAL_2FA_INVALID]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: true,
    userMessage: 'Invalid two-factor authentication code',
  },

  // Withdrawal errors - Verification
  [ERROR_CODES.WITHDRAWAL_KYC_REQUIRED]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'KYC verification required',
  },
  [ERROR_CODES.WITHDRAWAL_EMAIL_UNVERIFIED]: {
    httpStatus: 400,
    category: 'withdrawal',
    severity: 'warning',
    retryable: false,
    userMessage: 'Email verification required',
  },

  // OAuth errors
  [ERROR_CODES.OAUTH_AUTHORIZATION_FAILED]: {
    httpStatus: 401,
    category: 'oauth',
    severity: 'error',
    retryable: false,
    userMessage: 'OAuth authorization failed',
  },
  [ERROR_CODES.OAUTH_TOKEN_EXCHANGE_FAILED]: {
    httpStatus: 401,
    category: 'oauth',
    severity: 'error',
    retryable: true,
    userMessage: 'OAuth token exchange failed',
  },
  [ERROR_CODES.OAUTH_INVALID_STATE]: {
    httpStatus: 400,
    category: 'oauth',
    severity: 'error',
    retryable: false,
    userMessage: 'Invalid OAuth state',
  },
};

/**
 * Helper function to get error metadata
 */
export function getErrorMetadata(code: ErrorCode) {
  return ERROR_METADATA[code];
}

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

  if(error.errorCode) {
    return error.errorCode;
  }

  // If it's already a serialized error with a code
  if (error?.code && Object.values(ERROR_CODES).includes(error.code)) {
    return error.code;
  }

  // If it's a serialized error
  if (isSerializedError(error)) {
    return error.code;
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