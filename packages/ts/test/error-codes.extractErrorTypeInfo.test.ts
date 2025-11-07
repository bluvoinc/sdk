import { describe, it, expect } from 'vitest';
import {
	extractErrorTypeInfo,
	ERROR_CODES,
	WITHDRAWAL_QUOTATION_ERROR_TYPES,
	type ErrorTypeInfo
} from '../src/error-codes';

describe('extractErrorTypeInfo', () => {
	describe('Known error codes', () => {
		it('should extract known error code from type field', () => {
			const error = {
				type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
				message: 'Insufficient balance'
			};

			const result: ErrorTypeInfo = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
		});

		it('should extract known error code from errorCode field', () => {
			const error = {
				errorCode: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS,
				error: 'Invalid address'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
		});

		it('should extract known error code from code field', () => {
			const error = {
				code: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM,
				message: 'Amount too small'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM);
		});

		it('should extract known error code from legacy axios format', () => {
			const error = {
				response: {
					data: {
						type: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED
					}
				}
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED);
		});

		it('should handle legacy error type constants', () => {
			const error = {
				type: WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE
			};

			const result = extractErrorTypeInfo(error);

			// Legacy constant maps to known error code
			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
		});
	});

	describe('Unknown error codes', () => {
		it('should extract unknown error code from type field', () => {
			const error = {
				type: 'UNKNOWN_FUTURE_ERROR_CODE',
				message: 'Something went wrong'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBe('UNKNOWN_FUTURE_ERROR_CODE');
		});

		it('should extract unknown error code from errorCode field', () => {
			const error = {
				errorCode: 'NEW_ERROR_TYPE',
				error: 'New error'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBe('NEW_ERROR_TYPE');
		});

		it('should extract unknown error code from code field', () => {
			const error = {
				code: 'CUSTOM_ERROR',
				message: 'Custom error message'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBe('CUSTOM_ERROR');
		});

		it('should extract unknown error code from legacy axios format', () => {
			const error = {
				response: {
					data: {
						type: 'BACKEND_SPECIFIC_ERROR'
					}
				}
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBe('BACKEND_SPECIFIC_ERROR');
		});
	});

	describe('Edge cases: No type information', () => {
		it('should handle null error', () => {
			const result = extractErrorTypeInfo(null);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle undefined error', () => {
			const result = extractErrorTypeInfo(undefined);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle Error instance without code', () => {
			const error = new Error('Generic error message');

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle empty object', () => {
			const error = {};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle object with only message field', () => {
			const error = {
				message: 'Error message without code'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});
	});

	describe('Edge cases: Invalid type values', () => {
		it('should handle number in type field', () => {
			const error = {
				type: 12345,
				message: 'Error'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle empty string in type field', () => {
			const error = {
				type: '',
				message: 'Error'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle boolean in errorCode field', () => {
			const error = {
				errorCode: true,
				message: 'Error'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});

		it('should handle null in type field with other fields present', () => {
			const error = {
				type: null,
				message: 'Error'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBeNull();
		});
	});

	describe('Field priority order', () => {
		it('should prioritize errorCode field over type (extractErrorCode priority)', () => {
			// Note: extractErrorCode checks errorCode field before type field
			const error = {
				type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
				errorCode: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
			};

			const result = extractErrorTypeInfo(error);

			// extractErrorCode prioritizes errorCode field
			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
		});

		it('should fallback to errorCode if type is invalid', () => {
			const error = {
				type: null,
				errorCode: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
		});

		it('should fallback to code if type and errorCode are invalid', () => {
			const error = {
				type: null,
				errorCode: undefined,
				code: ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED);
		});

		it('should prefer direct fields over legacy axios format', () => {
			const error = {
				type: ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE,
				response: {
					data: {
						type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
					}
				}
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE);
		});

		it('should use legacy format if direct fields are empty', () => {
			const error = {
				type: '',
				response: {
					data: {
						type: ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS
					}
				}
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS);
		});
	});

	describe('Mixed scenarios: Known and unknown codes', () => {
		it('should handle object with both known type and error message', () => {
			const error = {
				type: ERROR_CODES.QUOTE_EXPIRED,
				error: 'The quote has expired',
				message: 'Quote expired'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBe(ERROR_CODES.QUOTE_EXPIRED);
			expect(result.rawType).toBe(ERROR_CODES.QUOTE_EXPIRED);
		});

		it('should preserve unknown code for future error types', () => {
			// This simulates a future error code added to the backend but not yet in SDK
			const error = {
				type: 'WITHDRAWAL_PENDING_APPROVAL', // Future error code
				message: 'Withdrawal requires manual approval'
			};

			const result = extractErrorTypeInfo(error);

			expect(result.knownCode).toBeNull();
			expect(result.rawType).toBe('WITHDRAWAL_PENDING_APPROVAL');
		});
	});

	describe('Integration with requestQuote-style error handling', () => {
		it('should work correctly in switch statement pattern', () => {
			const error = {
				type: ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM,
				message: 'Amount is below minimum'
			};

			const result = extractErrorTypeInfo(error);

			// Simulate switch statement usage
			let message: string;
			if (result.knownCode) {
				switch (result.knownCode) {
					case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
						message = 'Amount below minimum';
						break;
					default:
						message = 'Unknown error';
				}
			} else {
				message = 'Generic error';
			}

			expect(message).toBe('Amount below minimum');
			expect(result.rawType).toBe(ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM);
		});

		it('should allow fallback to generic handling for unknown codes', () => {
			const error = {
				type: 'FUTURE_ERROR_CODE',
				message: 'Something went wrong'
			};

			const result = extractErrorTypeInfo(error);

			// Simulate error handling
			let message: string;
			let loggedCode: string | null;

			if (result.knownCode) {
				message = 'Known error';
			} else {
				message = 'Generic error';
				loggedCode = result.rawType; // Preserve for logging
			}

			expect(message).toBe('Generic error');
			expect(loggedCode!).toBe('FUTURE_ERROR_CODE');
		});
	});

	describe('Type consistency', () => {
		it('should always return ErrorTypeInfo structure', () => {
			const testCases = [
				null,
				undefined,
				{},
				{ type: ERROR_CODES.WALLET_NOT_FOUND },
				{ type: 'UNKNOWN_CODE' },
				new Error('Test')
			];

			testCases.forEach(testCase => {
				const result = extractErrorTypeInfo(testCase);

				// Should always have these properties
				expect(result).toHaveProperty('knownCode');
				expect(result).toHaveProperty('rawType');

				// Both should be either string or null (never undefined)
				expect(
					result.knownCode === null || typeof result.knownCode === 'string'
				).toBe(true);
				expect(
					result.rawType === null || typeof result.rawType === 'string'
				).toBe(true);
			});
		});
	});
});
