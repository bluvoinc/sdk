import type { FlowState, FlowContext } from '../types/flow.types';

/**
 * Helper functions for creating state transitions
 * These eliminate boilerplate and make state transitions more consistent
 */

/**
 * Create a transition to a new state type with optional context updates
 */
export function createTransition<T extends FlowState['type']>(
  type: T,
  context: FlowContext,
  contextUpdates?: Partial<FlowContext>,
  error: Error | null = null
): FlowState {
  return {
    type,
    context: contextUpdates ? { ...context, ...contextUpdates } : context,
    error
  };
}

/**
 * Create an error transition with optional context updates
 */
export function createErrorTransition(
  type: FlowState['type'],
  context: FlowContext,
  error: Error,
  contextUpdates?: Partial<FlowContext>
): FlowState {
  return {
    type,
    context: contextUpdates ? { ...context, ...contextUpdates } : context,
    error
  };
}

/**
 * Update context with type-safe partial updates
 */
export function updateContext(
  context: FlowContext,
  updates: Partial<FlowContext>
): FlowContext {
  return { ...context, ...updates };
}

/**
 * Constants for default configuration values
 */
export const DEFAULT_MAX_RETRY_ATTEMPTS = 3;
export const DEFAULT_AUTO_REFRESH_QUOTATION = true;
