import type { Machine } from '../types/machine.types';
import type { FlowState, FlowActionType } from '../types/flow.types';
import type { WithdrawalState, WithdrawalActionType } from '../types/withdrawal.types';

/**
 * Internal type for flow machine instance with nested withdrawal machine
 */
export interface FlowMachineInstance {
  machine: Machine<FlowState, FlowActionType>;
  withdrawalMachine?: Machine<WithdrawalState, WithdrawalActionType>;
}

/**
 * Options for creating a flow machine
 */
export interface FlowMachineOptions {
  orgId: string;
  projectId: string;
  maxRetryAttempts?: number;
  autoRefreshQuotation?: boolean;
}
