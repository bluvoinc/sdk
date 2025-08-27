import { createMachine } from './createMachine';
import {
  WithdrawalState,
  WithdrawalActionType,
  WithdrawalContext,
  WithdrawalStateType
} from '../types/withdrawal.types';

const initialContext: WithdrawalContext = {
  quoteId: '',
  walletId: '',
  idempotencyKey: '',
  retryCount: 0,
  maxRetries: 3,
};

const initialState: WithdrawalState = {
  type: 'idle',
  context: initialContext,
  error: null
};

function withdrawalTransition(
  state: WithdrawalState,
  action: WithdrawalActionType
): WithdrawalState {

  switch (state.type) {
    case 'idle':
      if (action.type === 'EXECUTE') {
        return {
          type: 'processing',
          context: {
            ...state.context,
            quoteId: action.quoteId,
            walletId: action.walletId,
            idempotencyKey: crypto.randomUUID(),
            retryCount: 0
          },
          error: null
        };
      }
      break;

    case 'processing':
      switch (action.type) {
        case 'REQUIRES_2FA':
          return {
            type: 'waitingFor2FA',
            context: {
              ...state.context,
              requiredActions: ['2fa']
            },
            error: null
          };
        
        case 'REQUIRES_SMS':
          return {
            type: 'waitingForSMS',
            context: {
              ...state.context,
              requiredActions: ['sms']
            },
            error: null
          };
        
        case 'REQUIRES_KYC':
          return {
            type: 'waitingForKYC',
            context: {
              ...state.context,
              requiredActions: ['kyc']
            },
            error: null
          };
        
        case 'SUCCESS':
          return {
            type: 'completed',
            context: {
              ...state.context,
              transactionId: action.transactionId
            },
            error: null
          };
        
        case 'FAIL':
          if (state.context.retryCount < state.context.maxRetries) {
            return {
              type: 'retrying',
              context: {
                ...state.context,
                retryCount: state.context.retryCount + 1,
                lastError: action.error
              },
              error: action.error
            };
          }
          return {
            type: 'failed',
            context: {
              ...state.context,
              lastError: action.error
            },
            error: action.error
          };
        
        case 'BLOCKED':
          return {
            type: 'blocked',
            context: state.context,
            error: new Error(action.reason)
          };
      }
      break;

    case 'waitingFor2FA':
      if (action.type === 'SUBMIT_2FA') {
        return {
          type: 'processing',
          context: {
            ...state.context,
            twoFactorCode: action.code,
            requiredActions: undefined
          },
          error: null
        };
      }
      break;

    case 'waitingForSMS':
      if (action.type === 'SUBMIT_SMS') {
        return {
          type: 'processing',
          context: {
            ...state.context,
            smsCode: action.code,
            requiredActions: undefined
          },
          error: null
        };
      }
      break;

    case 'retrying':
      if (action.type === 'RETRY') {
        return {
          type: 'processing',
          context: {
            ...state.context,
            idempotencyKey: crypto.randomUUID() // New idempotency key for retry
          },
          error: null
        };
      }
      break;
  }

  console.log(`No transition for action ${action.type} in state ${state.type}`);

  return state;
}

export function createWithdrawalMachine(
  initialContext?: Partial<WithdrawalContext>
) {
  const state: WithdrawalState = {
    ...initialState,
    context: {
      ...initialState.context,
      ...initialContext
    }
  };

  return createMachine(state, withdrawalTransition);
}