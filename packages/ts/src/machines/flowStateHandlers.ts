import type { FlowState, FlowActionType } from '../types/flow.types';
import type { FlowMachineInstance } from './flowMachine.types';
import { createTransition, createErrorTransition } from './stateHelpers';
import { createWithdrawalMachine } from './withdrawalMachine';

/**
 * State handlers for the flow machine
 * Each function handles transitions for a specific group of states
 */

/**
 * Handle transitions for the idle state
 */
export function handleIdleState(
  state: FlowState,
  action: FlowActionType
): FlowState | null {
  if (state.type !== 'idle') return null;

  switch (action.type) {
    case 'LOAD_EXCHANGES':
      return createTransition('exchanges:loading', state.context);

    case 'START_OAUTH':
      return createTransition('oauth:waiting', state.context, {
        exchange: action.exchange,
        walletId: action.walletId,
        idempotencyKey: action.idem,
        topicName: action.idem
      });

    default:
      return null;
  }
}

/**
 * Handle transitions for exchange-related states
 */
export function handleExchangeStates(
  state: FlowState,
  action: FlowActionType
): FlowState | null {
  switch (state.type) {
    case 'exchanges:loading':
      switch (action.type) {
        case 'EXCHANGES_LOADED':
          return createTransition('exchanges:ready', state.context, {
            exchanges: action.exchanges
          });

        case 'EXCHANGES_FAILED':
          return createErrorTransition('exchanges:error', state.context, action.error);

        default:
          return null;
      }

    case 'exchanges:ready':
      if (action.type === 'START_OAUTH') {
        return createTransition('oauth:waiting', state.context, {
          exchange: action.exchange,
          walletId: action.walletId,
          idempotencyKey: action.idem,
          topicName: action.idem
        });
      }
      return null;

    default:
      return null;
  }
}

/**
 * Handle transitions for OAuth-related states
 */
export function handleOAuthStates(
  state: FlowState,
  action: FlowActionType
): FlowState | null {
  switch (state.type) {
    case 'oauth:waiting':
      if (action.type === 'OAUTH_WINDOW_OPENED') {
        return createTransition('oauth:processing', state.context);
      }
      return null;

    case 'oauth:processing':
      switch (action.type) {
        case 'OAUTH_COMPLETED':
          return createTransition('oauth:completed', state.context, {
            walletId: action.walletId
          });

        case 'OAUTH_FAILED':
          return createErrorTransition('oauth:error', state.context, action.error, {
            oauthErrorType: 'recoverable'
          });

        case 'OAUTH_FATAL':
          return createErrorTransition('oauth:fatal', state.context, action.error, {
            oauthErrorType: 'fatal'
          });

        case 'OAUTH_WINDOW_CLOSED_BY_USER':
          return createErrorTransition(
            'oauth:window_closed_by_user',
            state.context,
            action.error
          );

        default:
          return null;
      }

    case 'oauth:completed':
      if (action.type === 'LOAD_WALLET') {
        return createTransition('wallet:loading', state.context);
      }
      return null;

    default:
      return null;
  }
}

/**
 * Handle transitions for wallet-related states
 */
export function handleWalletStates(
  state: FlowState,
  action: FlowActionType
): FlowState | null {
  switch (state.type) {
    case 'wallet:loading':
      switch (action.type) {
        case 'WALLET_LOADED':
          return createTransition('wallet:ready', state.context, {
            walletBalances: action.balances
          });

        case 'WALLET_FAILED':
          return createErrorTransition('wallet:error', state.context, action.error);

        default:
          return null;
      }

    case 'wallet:ready':
      if (action.type === 'REQUEST_QUOTE') {
        return createTransition('quote:requesting', state.context, {
          lastQuoteRequest: {
            asset: action.asset,
            amount: action.amount,
            destinationAddress: action.destinationAddress,
            network: action.network
          }
        });
      }
      return null;

    default:
      return null;
  }
}

/**
 * Handle transitions for quote-related states
 */
export function handleQuoteStates(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState | null {
  switch (state.type) {
    case 'quote:requesting':
      switch (action.type) {
        case 'QUOTE_RECEIVED':
          if (action.quote) {
            console.log('[State Machine] quote:requesting received QUOTE_RECEIVED with ID:', action.quote.id,
              'ExpiresAt:', new Date(action.quote.expiresAt).toLocaleTimeString());
          }
          return createTransition('quote:ready', state.context, {
            quote: action.quote
          });

        case 'QUOTE_FAILED':
          return createErrorTransition('quote:error', state.context, action.error);

        default:
          return null;
      }

    case 'quote:ready':
      switch (action.type) {
        case 'REQUEST_QUOTE':
          // Allow refreshing quote while in quote:ready state (for auto-refresh)
          console.log('[State Machine] quote:ready received REQUEST_QUOTE, transitioning to quote:requesting');
          return createTransition('quote:requesting', state.context, {
            quote: undefined,  // Clear old quote before requesting new one
            lastQuoteRequest: {
              asset: action.asset,
              amount: action.amount,
              destinationAddress: action.destinationAddress,
              network: action.network
            }
          });

        case 'QUOTE_EXPIRED':
          return createErrorTransition(
            'quote:expired',
            state.context,
            new Error('Quote has expired')
          );

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

          return createTransition('withdraw:processing', state.context);

        default:
          return null;
      }

    case 'quote:expired':
      if (action.type === 'REQUEST_QUOTE') {
        return createTransition('quote:requesting', state.context, {
          quote: undefined  // Clear expired quote to ensure fresh quote is requested
        });
      }
      return null;

    default:
      return null;
  }
}

/**
 * Handle 2FA submission
 */
function handleSubmit2FA(
  state: FlowState,
  action: Extract<FlowActionType, { type: 'SUBMIT_2FA' }>,
  instance: FlowMachineInstance
): FlowState {
  if (instance.withdrawalMachine) {
    instance.withdrawalMachine.send({
      type: 'SUBMIT_2FA',
      code: action.code
    });
    return createTransition('withdraw:processing', state.context, {
      invalid2FAAttempts: 0 // Reset invalid attempts when submitting new 2FA
    });
  }
  return state;
}

/**
 * Handle SMS submission
 */
function handleSubmitSMS(
  state: FlowState,
  action: Extract<FlowActionType, { type: 'SUBMIT_SMS' }>,
  instance: FlowMachineInstance
): FlowState {
  if (instance.withdrawalMachine) {
    instance.withdrawalMachine.send({
      type: 'SUBMIT_SMS',
      code: action.code
    });
    return createTransition('withdraw:processing', state.context);
  }
  return state;
}

/**
 * Handle withdrawal retry
 */
function handleRetryWithdrawal(
  state: FlowState,
  instance: FlowMachineInstance
): FlowState {
  if (instance.withdrawalMachine) {
    instance.withdrawalMachine.send({ type: 'RETRY' });
    return createTransition('withdraw:processing', state.context);
  }
  return state;
}

/**
 * Handle synchronization with withdrawal machine state
 */
function syncWithdrawalMachineState(
  state: FlowState,
  instance: FlowMachineInstance,
  action: FlowActionType
): FlowState | null {
  if (!instance.withdrawalMachine) {
    return null;
  }

  const withdrawalState = instance.withdrawalMachine.getState();

  // Map withdrawal machine states to flow machine states
  switch (withdrawalState.type) {
    case 'waitingFor2FA':
      if (state.type !== 'withdraw:error2FA') {
        return createTransition('withdraw:error2FA', state.context);
      }
      break;

    case 'waitingForSMS':
      if (state.type !== 'withdraw:errorSMS') {
        return createTransition('withdraw:errorSMS', state.context);
      }
      break;

    case 'waitingForKYC':
      if (state.type !== 'withdraw:errorKYC') {
        return createTransition('withdraw:errorKYC', state.context);
      }
      break;

    case 'completed':
      if (action.type === 'WITHDRAWAL_COMPLETED') {
        return createTransition('withdraw:completed', state.context, {
          withdrawal: {
            id: withdrawalState.context.idempotencyKey,
            status: 'completed',
            transactionId: action.transactionId
          }
        });
      }
      break;

    case 'blocked':
      if (action.type === 'WITHDRAWAL_BLOCKED') {
        return createErrorTransition(
          'withdraw:blocked',
          state.context,
          new Error(action.reason)
        );
      }
      break;

    case 'failed':
      // Automatically transition to fatal state when withdrawal machine fails
      return createErrorTransition(
        'withdraw:fatal',
        state.context,
        withdrawalState.error || new Error('Withdrawal failed')
      );

    case 'retrying':
      if (state.type !== 'withdraw:retrying') {
        return createTransition('withdraw:retrying', state.context, {
          retryAttempts: state.context.retryAttempts + 1
        });
      }
      break;
  }

  return null;
}

/**
 * Handle direct withdrawal actions
 */
function handleWithdrawalActions(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState | null {
  switch (action.type) {
    case 'SUBMIT_2FA':
      if (state.type === 'withdraw:error2FA') {
        return handleSubmit2FA(state, action, instance);
      }
      break;

    case 'SUBMIT_SMS':
      if (state.type === 'withdraw:errorSMS') {
        return handleSubmitSMS(state, action, instance);
      }
      break;

    case 'RETRY_WITHDRAWAL':
      if (state.type === 'withdraw:retrying') {
        return handleRetryWithdrawal(state, instance);
      }
      break;

    case 'WITHDRAWAL_2FA_INVALID':
      return createErrorTransition(
        'withdraw:error2FA',
        {
          ...state.context,
          invalid2FAAttempts: (state.context.invalid2FAAttempts || 0) + 1
        },
        new Error('Invalid 2FA code')
      );

    case 'WITHDRAWAL_INSUFFICIENT_BALANCE':
      return createErrorTransition(
        'withdraw:errorBalance',
        state.context,
        new Error('Insufficient balance')
      );

    case 'WITHDRAWAL_REQUIRES_2FA':
      if (instance.withdrawalMachine) {
        instance.withdrawalMachine.send({ type: 'REQUIRES_2FA' });
        const withdrawalState = instance.withdrawalMachine.getState();
        if (withdrawalState.type === 'waitingFor2FA') {
          return createTransition('withdraw:error2FA', state.context);
        }
      }
      break;

    case 'WITHDRAWAL_REQUIRES_SMS':
      if (instance.withdrawalMachine) {
        instance.withdrawalMachine.send({ type: 'REQUIRES_SMS' });
        const withdrawalState = instance.withdrawalMachine.getState();
        if (withdrawalState.type === 'waitingForSMS') {
          return createTransition('withdraw:errorSMS', state.context);
        }
      }
      break;

    case 'WITHDRAWAL_REQUIRES_KYC':
      if (instance.withdrawalMachine) {
        instance.withdrawalMachine.send({ type: 'REQUIRES_KYC' });
        const withdrawalState = instance.withdrawalMachine.getState();
        if (withdrawalState.type === 'waitingForKYC') {
          return createTransition('withdraw:errorKYC', state.context);
        }
      }
      break;

    case 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED':
      const valid2FAMethods = action.result?.valid2FAMethods;
      const errorMessage = generate2FAMethodErrorMessage(valid2FAMethods);
      return createErrorTransition(
        'withdraw:fatal',
        {
          ...state.context,
          errorDetails: {
            valid2FAMethods
          }
        },
        new Error(errorMessage)
      );

    case 'WITHDRAWAL_SUCCESS':
      if (instance.withdrawalMachine) {
        instance.withdrawalMachine.send({
          type: 'SUCCESS',
          transactionId: action.transactionId
        });
      }
      break;

    case 'WITHDRAWAL_FATAL':
      return createErrorTransition('withdraw:fatal', state.context, action.error);
  }

  return null;
}

/**
 * Handle transitions for withdrawal-related states
 */
export function handleWithdrawalStates(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState | null {
  // Check if we're in a withdrawal state
  const isWithdrawalState = [
    'withdraw:processing',
    'withdraw:error2FA',
    'withdraw:errorSMS',
    'withdraw:errorKYC',
    'withdraw:errorBalance',
    'withdraw:retrying'
  ].includes(state.type);

  if (!isWithdrawalState) {
    return null;
  }

  // First check for machine state synchronization
  const syncResult = syncWithdrawalMachineState(state, instance, action);
  if (syncResult) {
    return syncResult;
  }

  // Then handle direct actions
  return handleWithdrawalActions(state, action, instance);
}

/**
 * Handle flow cancellation from any state
 */
export function handleCancelFlow(
  state: FlowState,
  action: FlowActionType,
  instance: FlowMachineInstance
): FlowState | null {
  if (action.type === 'CANCEL_FLOW') {
    if (instance.withdrawalMachine) {
      instance.withdrawalMachine.dispose();
      instance.withdrawalMachine = undefined;
    }
    return createTransition('flow:cancelled', state.context);
  }
  return null;
}

/**
 * Helper function to generate 2FA method error message
 */
function generate2FAMethodErrorMessage(valid2FAMethods?: string[]): string {
  if (!valid2FAMethods || valid2FAMethods.length === 0) {
    return 'Please make sure your Exchange account has 2FA enabled.';
  }

  if (valid2FAMethods.length === 1) {
    return `${valid2FAMethods[0]} is the only supported two-factor authentication method.`;
  }

  if (valid2FAMethods.length === 2) {
    return `${valid2FAMethods[0]} and ${valid2FAMethods[1]} are the only supported two-factor authentication methods.`;
  }

  // For 3 or more methods: "X, Y, ..., and Z are the only supported methods"
  const lastMethod = valid2FAMethods[valid2FAMethods.length - 1];
  const otherMethods = valid2FAMethods.slice(0, -1).join(', ');
  return `${otherMethods}, and ${lastMethod} are the only supported two-factor authentication methods.`;
}
