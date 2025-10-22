import { StateValue } from './machine.types';
import {ChainId, TokenAddress} from "./api.types";

export type FlowStateType = 
  | 'idle'
  | 'exchanges:loading'
  | 'exchanges:ready'
  | 'exchanges:error'
  | 'oauth:waiting'
  | 'oauth:processing'
  | 'oauth:completed'
  | 'oauth:error'
  | 'oauth:window_closed_by_user'
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
  autoRefreshQuotation?: boolean;
  lastQuoteRequest?: {
    asset: string;
    amount: string;
    destinationAddress: string;
    network?: string;
    tag?: string;
    includeFee?: boolean;
  };
  exchanges?: Array<{
    id: string;
    name: string;
    logoUrl: string;
    status: string;
  }>;
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
      'maxWithdrawal'?: string;
      'assetName': string;
      'addressRegex'?: string | null;
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
  errorDetails?: {
    valid2FAMethods?: string[];
  };
}

export type FlowState = StateValue<FlowStateType> & {
  context: FlowContext;
};

export type FlowActionType =
  | { type: 'LOAD_EXCHANGES' }
  | { type: 'EXCHANGES_LOADED'; exchanges: Array<{ id: string; name: string; logoUrl: string; status: string; }> }
  | { type: 'EXCHANGES_FAILED'; error: Error }
  | { type: 'START_OAUTH'; exchange: string; walletId: string; idem: string }
  | { type: 'OAUTH_WINDOW_OPENED' }
  | { type: 'OAUTH_COMPLETED'; walletId: string; exchange: string }
  | { type: 'OAUTH_FAILED'; error: Error }
  | { type: 'OAUTH_WINDOW_CLOSED_BY_USER'; error: Error }
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
      'maxWithdrawal'?: string | undefined,
      'assetName': string;

      'addressRegex'?: string;
      'chainId'?: ChainId;
      'tokenAddress'?: TokenAddress;
      'contractAddress'?: string | null;
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
  | { type: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED'; result?: { valid2FAMethods?: string[] } }
  | { type: 'SUBMIT_2FA'; code: string }
  | { type: 'SUBMIT_SMS'; code: string }
  | { type: 'RETRY_WITHDRAWAL' }
  | { type: 'WITHDRAWAL_SUCCESS'; transactionId?: string }
  | { type: 'WITHDRAWAL_COMPLETED'; transactionId: string }
  | { type: 'WITHDRAWAL_BLOCKED'; reason: string }
  | { type: 'WITHDRAWAL_FATAL'; error: Error }
  | { type: 'CANCEL_FLOW' };