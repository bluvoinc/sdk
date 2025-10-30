import type { FlowActionType } from '../types/flow.types';
import type { Machine } from '../types/machine.types';
import type { FlowState } from '../types/flow.types';
import {
  type BluvoError,
  ERROR_CODES,
  extractErrorCode,
  extractErrorResult,
  WITHDRAWAL_EXECUTION_ERROR_TYPES
} from '../error-codes';

/**
 * Maps error codes to flow machine actions
 * Centralized error handling logic to avoid duplication
 */
export class WithdrawalErrorHandler {
  /**
   * Handle withdrawal execution errors and send appropriate actions to the flow machine
   * @param error The error to handle
   * @param flowMachine The flow machine to send actions to
   * @returns True if the error was handled, false otherwise
   */
  static handleWithdrawalError(
    error: BluvoError,
    flowMachine: Machine<FlowState, FlowActionType> | undefined
  ): boolean {
    if (!flowMachine) {
      return false;
    }

    const errorCode = extractErrorCode(error);

    // Map error codes to actions
    const action = this.mapErrorCodeToAction(errorCode, error);
    if (action) {
      flowMachine.send(action);
      return true;
    }

    return false;
  }

  /**
   * Map error code to flow machine action
   */
  private static mapErrorCodeToAction(
    errorCode: string | null,
    error: BluvoError
  ): FlowActionType | null {
    if (!errorCode) {
      // If no error code, send generic fatal error
      return {
        type: 'WITHDRAWAL_FATAL',
        error: error instanceof Error ? error : new Error(
          (error as any)?.error || (error as any)?.message || 'Failed to execute withdrawal'
        )
      };
    }

    switch (errorCode) {
      // 2FA Requirements
      case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED:
        return { type: 'WITHDRAWAL_REQUIRES_2FA' };

      case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED:
        return { type: 'WITHDRAWAL_REQUIRES_SMS' };

      // KYC Requirements
      case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED:
        return { type: 'WITHDRAWAL_REQUIRES_KYC' };

      // Balance Issues
      case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE:
        return { type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' };

      // Quote Expiration
      case ERROR_CODES.QUOTE_EXPIRED:
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED:
        return { type: 'QUOTE_EXPIRED' };

      // 2FA Method Not Supported
      case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
        return {
          type: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',
          result: extractErrorResult(error) as { valid2FAMethods?: string[] } | undefined
        };

      // Fatal Errors (cannot retry or recover)
      case ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS:
        return {
          type: 'WITHDRAWAL_FATAL',
          error: new Error('Invalid destination address')
        };

      case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
        return {
          type: 'WITHDRAWAL_FATAL',
          error: new Error('Amount below minimum')
        };

      case ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM:
        return {
          type: 'WITHDRAWAL_FATAL',
          error: new Error('Amount above maximum')
        };

      // Default: treat as fatal error
      default:
        return {
          type: 'WITHDRAWAL_FATAL',
          error: error instanceof Error ? error : new Error(
            (error as any)?.error || (error as any)?.message || 'Failed to execute withdrawal'
          )
        };
    }
  }

  /**
   * Check if an error is recoverable (can retry or provide additional info)
   */
  static isRecoverableError(error: BluvoError): boolean {
    const errorCode = extractErrorCode(error);
    if (!errorCode) {
      return false;
    }

    const recoverableErrors = [
      ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP,
      ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS,
      ERROR_CODES.WITHDRAWAL_2FA_INVALID,
      ERROR_CODES.WITHDRAWAL_KYC_REQUIRED,
      ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
      ERROR_CODES.QUOTE_EXPIRED,
      WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED,
      WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED,
      WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED,
      WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE,
      WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED
    ];

    return recoverableErrors.includes(errorCode as any);
  }

  /**
   * Check if an error is fatal (cannot recover)
   */
  static isFatalError(error: BluvoError): boolean {
    return !this.isRecoverableError(error);
  }
}
