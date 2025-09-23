import { createMachine } from './createMachine';
import { createWithdrawalMachine } from './withdrawalMachine';
import {
  FlowState,
  FlowActionType,
  FlowContext,
  FlowStateType
} from '../types/flow.types';
import {
  WithdrawalActionType,
  WithdrawalState
} from '../types/withdrawal.types';
import { Machine } from '../types/machine.types';

interface FlowMachineOptions {
  orgId: string;
  projectId: string;
  maxRetryAttempts?: number;
}

interface FlowMachineInstance {
  machine: Machine<FlowState, FlowActionType>;
  withdrawalMachine?: Machine<WithdrawalState, WithdrawalActionType>;
}

const createInitialContext = (options: FlowMachineOptions): FlowContext => ({
  orgId: options.orgId,
  projectId: options.projectId,
  retryAttempts: 0,
  maxRetryAttempts: options.maxRetryAttempts || 3,
});

const initialState = (options: FlowMachineOptions): FlowState => ({
  type: 'idle',
  context: createInitialContext(options),
  error: null
});

function flowTransition(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState {
  switch (state.type) {
    case 'idle':
      switch (action.type) {
        case 'LOAD_EXCHANGES':
          return {
            type: 'exchanges:loading',
            context: state.context,
            error: null
          };
        
        case 'START_OAUTH':
          return {
            type: 'oauth:waiting',
            context: {
              ...state.context,
              exchange: action.exchange,
              walletId: action.walletId,
              idempotencyKey: action.idem,
              topicName: action.idem
            },
            error: null
          };
      }
      break;

    case 'exchanges:loading':
      switch (action.type) {
        case 'EXCHANGES_LOADED':
          return {
            type: 'exchanges:ready',
            context: {
              ...state.context,
              exchanges: action.exchanges
            },
            error: null
          };
        
        case 'EXCHANGES_FAILED':
          return {
            type: 'exchanges:error',
            context: state.context,
            error: action.error
          };
      }
      break;

    case 'exchanges:ready':
      if (action.type === 'START_OAUTH') {
        return {
          type: 'oauth:waiting',
          context: {
            ...state.context,
            exchange: action.exchange,
            walletId: action.walletId,
            idempotencyKey: action.idem,
            topicName: action.idem
          },
          error: null
        };
      }
      break;

    case 'oauth:waiting':
      if (action.type === 'OAUTH_WINDOW_OPENED') {
        return {
          type: 'oauth:processing',
          context: state.context,
          error: null
        };
      }
      break;

    case 'oauth:processing':
      switch (action.type) {
        case 'OAUTH_COMPLETED':
          return {
            type: 'oauth:completed',
            context: {
              ...state.context,
              walletId: action.walletId
            },
            error: null
          };
        
        case 'OAUTH_FAILED':
          return {
            type: 'oauth:error',
            context: state.context,
            error: action.error
          };
        
        case 'OAUTH_WINDOW_CLOSED_BY_USER':
          return {
            type: 'oauth:window_closed_by_user',
            context: state.context,
            error: action.error
          };
      }
      break;

    case 'oauth:completed':
      if (action.type === 'LOAD_WALLET') {
        return {
          type: 'wallet:loading',
          context: state.context,
          error: null
        };
      }
      break;

    case 'wallet:loading':
      switch (action.type) {
        case 'WALLET_LOADED':
          return {
            type: 'wallet:ready',
            context: {
              ...state.context,
              walletBalances: action.balances
            },
            error: null
          };
        
        case 'WALLET_FAILED':
          return {
            type: 'wallet:error',
            context: state.context,
            error: action.error
          };
      }
      break;

    case 'wallet:ready':
      if (action.type === 'REQUEST_QUOTE') {
        return {
          type: 'quote:requesting',
          context: state.context,
          error: null
        };
      }
      break;

    case 'quote:requesting':
      switch (action.type) {
        case 'QUOTE_RECEIVED':
          return {
            type: 'quote:ready',
            context: {
              ...state.context,
              quote: action.quote
            },
            error: null
          };
        
        case 'QUOTE_FAILED':
          return {
            type: 'quote:error',
            context: state.context,
            error: action.error
          };
      }
      break;

    case 'quote:ready':
      switch (action.type) {
        case 'QUOTE_EXPIRED':
          return {
            type: 'quote:expired',
            context: state.context,
            error: new Error('Quote has expired')
          };
        
        case 'START_WITHDRAWAL':
          if (!instance.withdrawalMachine) {
            instance.withdrawalMachine = createWithdrawalMachine({
              quoteId: action.quoteId,
              walletId: state.context.walletId!,
              maxRetries: state.context.maxRetryAttempts
            });
          }
          
          instance.withdrawalMachine.send({
            type: 'EXECUTE',
            quoteId: action.quoteId,
            walletId: state.context.walletId!
          });

          return {
            type: 'withdraw:processing',
            context: state.context,
            error: null
          };
      }
      break;

    case 'withdraw:processing':
    case 'withdraw:error2FA':
    case 'withdraw:errorSMS':
    case 'withdraw:errorKYC':
    case 'withdraw:errorBalance':
    case 'withdraw:retrying':
      // Handle withdrawal state transitions based on nested machine state
      if (instance.withdrawalMachine) {
        const withdrawalState = instance.withdrawalMachine.getState();
        
        switch (withdrawalState.type) {
          case 'waitingFor2FA':
            if (state.type !== 'withdraw:error2FA') {
              return {
                type: 'withdraw:error2FA',
                context: state.context,
                error: null
              };
            }
            break;
          
          case 'waitingForSMS':
            if (state.type !== 'withdraw:errorSMS') {
              return {
                type: 'withdraw:errorSMS',
                context: state.context,
                error: null
              };
            }
            break;
          
          case 'waitingForKYC':
            if (state.type !== 'withdraw:errorKYC') {
              return {
                type: 'withdraw:errorKYC',
                context: state.context,
                error: null
              };
            }
            break;
          
          case 'completed':
            if (action.type === 'WITHDRAWAL_COMPLETED') {
              return {
                type: 'withdraw:completed',
                context: {
                  ...state.context,
                  withdrawal: {
                    id: withdrawalState.context.idempotencyKey,
                    status: 'completed',
                    transactionId: action.transactionId
                  }
                },
                error: null
              };
            }
            break;
          
          case 'blocked':
            if (action.type === 'WITHDRAWAL_BLOCKED') {
              return {
                type: 'withdraw:blocked',
                context: state.context,
                error: new Error(action.reason)
              };
            }
            break;
          
          case 'failed':
            // Automatically transition to fatal state when withdrawal machine fails
            return {
              type: 'withdraw:fatal',
              context: state.context,
              error: withdrawalState.error || new Error('Withdrawal failed')
            };
          
          case 'retrying':
            if (state.type !== 'withdraw:retrying') {
              return {
                type: 'withdraw:retrying',
                context: {
                  ...state.context,
                  retryAttempts: state.context.retryAttempts + 1
                },
                error: null
              };
            }
            break;
        }
      }

      // Handle direct withdrawal actions
      switch (action.type) {
        case 'SUBMIT_2FA':
          if (instance.withdrawalMachine && state.type === 'withdraw:error2FA') {
            instance.withdrawalMachine.send({
              type: 'SUBMIT_2FA',
              code: action.code
            });
            return {
              type: 'withdraw:processing',
              context: {
                ...state.context,
                invalid2FAAttempts: 0 // Reset invalid attempts when submitting new 2FA
              },
              error: null
            };
          }
          break;
        
        case 'SUBMIT_SMS':
          if (instance.withdrawalMachine && state.type === 'withdraw:errorSMS') {
            instance.withdrawalMachine.send({
              type: 'SUBMIT_SMS',
              code: action.code
            });
            return {
              type: 'withdraw:processing',
              context: state.context,
              error: null
            };
          }
          break;
        
        case 'RETRY_WITHDRAWAL':
          if (instance.withdrawalMachine && state.type === 'withdraw:retrying') {
            instance.withdrawalMachine.send({ type: 'RETRY' });
            return {
              type: 'withdraw:processing',
              context: state.context,
              error: null
            };
          }
          break;
        
        case 'WITHDRAWAL_2FA_INVALID':
          return {
            type: 'withdraw:error2FA',
            context: {
              ...state.context,
              invalid2FAAttempts: (state.context.invalid2FAAttempts || 0) + 1
            },
            error: new Error('Invalid 2FA code')
          };
        
        case 'WITHDRAWAL_INSUFFICIENT_BALANCE':
          return {
            type: 'withdraw:errorBalance',
            context: state.context,
            error: new Error('Insufficient balance')
          };
        
        case 'WITHDRAWAL_REQUIRES_2FA':
          if (instance.withdrawalMachine) {
            instance.withdrawalMachine.send({ type: 'REQUIRES_2FA' });
            // Check the withdrawal machine state immediately after sending the action
            const withdrawalState = instance.withdrawalMachine.getState();
            if (withdrawalState.type === 'waitingFor2FA') {
              return {
                type: 'withdraw:error2FA',
                context: state.context,
                error: null
              };
            }
          }
          break;
        
        case 'WITHDRAWAL_REQUIRES_SMS':
          if (instance.withdrawalMachine) {
            instance.withdrawalMachine.send({ type: 'REQUIRES_SMS' });
            // Check the withdrawal machine state immediately after sending the action
            const withdrawalState = instance.withdrawalMachine.getState();
            if (withdrawalState.type === 'waitingForSMS') {
              return {
                type: 'withdraw:errorSMS',
                context: state.context,
                error: null
              };
            }
          }
          break;
        
        case 'WITHDRAWAL_REQUIRES_KYC':
          if (instance.withdrawalMachine) {
            instance.withdrawalMachine.send({ type: 'REQUIRES_KYC' });
            // Check the withdrawal machine state immediately after sending the action
            const withdrawalState = instance.withdrawalMachine.getState();
            if (withdrawalState.type === 'waitingForKYC') {
              return {
                type: 'withdraw:errorKYC',
                context: state.context,
                error: null
              };
            }
          }
          break;
        
        case 'WITHDRAWAL_SUCCESS':
          if (instance.withdrawalMachine) {
            instance.withdrawalMachine.send({
              type: 'SUCCESS',
              transactionId: action.transactionId
            });
          }
          break;
        
        case 'WITHDRAWAL_FATAL':
          return {
            type: 'withdraw:fatal',
            context: state.context,
            error: action.error
          };
      }
      break;
  }

  // Handle CANCEL_FLOW from any state
  if (action.type === 'CANCEL_FLOW') {
    if (instance.withdrawalMachine) {
      instance.withdrawalMachine.dispose();
      instance.withdrawalMachine = undefined;
    }
    return {
      type: 'flow:cancelled',
      context: state.context,
      error: null
    };
  }

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