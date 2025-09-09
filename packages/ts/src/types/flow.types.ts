import { StateValue } from './machine.types';

export type FlowStateType = 
  | 'idle'
  | 'oauth:waiting'
  | 'oauth:processing'
  | 'oauth:completed'
  | 'oauth:error'
  | 'wallet:loading'
  | 'wallet:ready'
  | 'wallet:error'
  | 'quote:requesting'
  | 'quote:ready'
  | 'quote:expired'
  | 'quote:error'
  | 'withdraw:idle'
  | 'withdraw:processing'
  | 'withdraw:error2FA'
  | 'withdraw:errorSMS'
  | 'withdraw:errorKYC'
  | 'withdraw:errorBalance'
  | 'withdraw:retrying'
  | 'withdraw:completed'
  | 'withdraw:blocked'
  | 'withdraw:fatal'
  | 'flow:cancelled';

export interface FlowContext {
  orgId: string;
  projectId: string;
  exchange?: string;
  walletId?: string;
  walletBalances?: Array<{ 
    asset: string; 
    balance: string;
    balanceInFiat?: string;
    networks?: Array<{
      'id': string;
      'name': string;
      'displayName': string;
      'minWithdrawal': string;
      'maxWithdrawal': string;
      'assetName': string;
      'addressRegex'?: string;
    }>;
  }>;
  quote?: {
    id: string;
    asset: string;
    amount: string;
    estimatedFee: string;
    estimatedTotal: string;

    amountWithFeeInFiat: string;
    amountNoFeeInFiat: string;
    estimatedFeeInFiat: string;

    expiresAt: number;
  };
  withdrawal?: {
    id: string;
    status: string;
    transactionId?: string;
  };
  retryAttempts: number;
  maxRetryAttempts: number;
  idempotencyKey?: string;
  topicName?: string;
  invalid2FAAttempts?: number;
}

export type FlowState = StateValue<FlowStateType> & {
  context: FlowContext;
};

export type FlowActionType =
  | { type: 'START_OAUTH'; exchange: string; walletId: string; idem: string }
  | { type: 'OAUTH_WINDOW_OPENED' }
  | { type: 'OAUTH_COMPLETED'; walletId: string; exchange: string }
  | { type: 'OAUTH_FAILED'; error: Error }
  | { type: 'LOAD_WALLET' }
  | { type: 'WALLET_LOADED'; balances: Array<{
    asset: string;
    balance: string;
    balanceInFiat?: string;
    networks?: Array<{
      'id': string;
      'name': string;
      'displayName': string;
      'minWithdrawal': string;
      'maxWithdrawal': string;
      'assetName': string;
      'addressRegex'?: string;
    }>;
  }> }
  | { type: 'WALLET_FAILED'; error: Error }
  | { type: 'REQUEST_QUOTE'; asset: string; amount: string; destinationAddress: string; network?: string }
  | { type: 'QUOTE_RECEIVED'; quote: FlowContext['quote'] }
  | { type: 'QUOTE_EXPIRED' }
  | { type: 'QUOTE_FAILED'; error: Error }
  | { type: 'START_WITHDRAWAL'; quoteId: string }
  | { type: 'WITHDRAWAL_PROGRESS'; message: string }
  | { type: 'WITHDRAWAL_REQUIRES_2FA' }
  | { type: 'WITHDRAWAL_REQUIRES_SMS' }
  | { type: 'WITHDRAWAL_REQUIRES_KYC' }
  | { type: 'WITHDRAWAL_2FA_INVALID' }
  | { type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' }
  | { type: 'SUBMIT_2FA'; code: string }
  | { type: 'SUBMIT_SMS'; code: string }
  | { type: 'RETRY_WITHDRAWAL' }
  | { type: 'WITHDRAWAL_SUCCESS'; transactionId?: string }
  | { type: 'WITHDRAWAL_COMPLETED'; transactionId: string }
  | { type: 'WITHDRAWAL_BLOCKED'; reason: string }
  | { type: 'WITHDRAWAL_FATAL'; error: Error }
  | { type: 'CANCEL_FLOW' };