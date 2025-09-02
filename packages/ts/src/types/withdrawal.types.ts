import { StateValue } from './machine.types';

export type WithdrawalStateType =
  | 'idle'
  | 'processing'
  | 'waitingFor2FA'
  | 'waitingForSMS'
  | 'waitingForKYC'
  | 'retrying'
  | 'completed'
  | 'blocked'
  | 'failed';

export interface WithdrawalContext {
  quoteId: string;
  walletId: string;
  idempotencyKey: string;
  retryCount: number;
  maxRetries: number;
  lastError?: Error;
  transactionId?: string;
  requiredActions?: Array<'2fa' | 'sms' | 'kyc'>;
  twoFactorCode?: string;
  smsCode?: string;
}

export type WithdrawalState = StateValue<WithdrawalStateType> & {
  context: WithdrawalContext;
};

export type WithdrawalActionType =
  | { type: 'EXECUTE'; quoteId: string; walletId: string }
  | { type: 'REQUIRES_2FA' }
  | { type: 'REQUIRES_SMS' }
  | { type: 'REQUIRES_KYC' }
  | { type: 'SUBMIT_2FA'; code: string }
  | { type: 'SUBMIT_SMS'; code: string }
  | { type: 'RETRY' }
  | { type: 'SUCCESS'; transactionId?: string }
  | { type: 'BLOCKED'; reason: string }
  | { type: 'FAIL'; error: Error };