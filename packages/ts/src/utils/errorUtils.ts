/**
 * Type-safe utility functions for error handling
 */

/**
 * Safely extract an error message from various error formats
 * @param error The error object (can be Error, object with error/message properties, or unknown)
 * @param fallback Default message if no error message can be extracted
 * @returns The extracted error message
 */
export function extractErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    // Check for error property
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }

    // Check for message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  // If we get here, use the fallback
  return fallback;
}

/**
 * Safely convert an error to an Error instance
 * @param error The error object
 * @param fallback Default message if conversion fails
 * @returns An Error instance
 */
export function toErrorInstance(error: unknown, fallback: string = 'An error occurred'): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(extractErrorMessage(error, fallback));
}
