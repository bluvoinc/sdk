import { createMachine } from './createMachine';
import type { FlowState, FlowActionType, FlowContext } from '../types/flow.types';
import type { FlowMachineOptions, FlowMachineInstance } from './flowMachine.types';
import { DEFAULT_MAX_RETRY_ATTEMPTS, DEFAULT_AUTO_REFRESH_QUOTATION } from './stateHelpers';
import {
  handleIdleState,
  handleExchangeStates,
  handleOAuthStates,
  handleWalletStates,
  handleQuoteStates,
  handleWithdrawalStates,
  handleCancelFlow
} from './flowStateHandlers';

const createInitialContext = (options: FlowMachineOptions): FlowContext => ({
  orgId: options.orgId,
  projectId: options.projectId,
  retryAttempts: 0,
  maxRetryAttempts: options.maxRetryAttempts || DEFAULT_MAX_RETRY_ATTEMPTS,
  autoRefreshQuotation: options.autoRefreshQuotation !== undefined ? options.autoRefreshQuotation : DEFAULT_AUTO_REFRESH_QUOTATION,
});

const initialState = (options: FlowMachineOptions): FlowState => ({
  type: 'idle',
  context: createInitialContext(options),
  error: null
});

/**
 * Main flow transition function
 * Delegates to specialized handlers for each state group
 */
function flowTransition(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState {
  // Handle CANCEL_FLOW from any state first (highest priority)
  const cancelResult = handleCancelFlow(state, action, instance);
  if (cancelResult) return cancelResult;

  // Try each handler in order - they return null if not applicable
  const handlers = [
    () => handleIdleState(state, action),
    () => handleExchangeStates(state, action),
    () => handleOAuthStates(state, action),
    () => handleWalletStates(state, action),
    () => handleQuoteStates(state, action, instance),
    () => handleWithdrawalStates(state, action, instance)
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result !== null) {
      return result;
    }
  }

  // No handler matched - return current state unchanged
  return state;
}

export function createFlowMachine(options: FlowMachineOptions) {
  const instance: FlowMachineInstance = {
    machine: null as any,
    withdrawalMachine: undefined
  };

  const transition = (state: FlowState, action: FlowActionType) => 
    flowTransition(state, action, instance);

  instance.machine = createMachine(initialState(options), transition);

  // Dispose nested machines when parent is disposed
  const originalDispose = instance.machine.dispose;
  instance.machine.dispose = () => {
    if (instance.withdrawalMachine) {
      instance.withdrawalMachine.dispose();
    }
    originalDispose();
  };

  return instance.machine;
}