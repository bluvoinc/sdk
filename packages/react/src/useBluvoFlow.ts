import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  BluvoFlowClientOptions,
  WithdrawalFlowOptions,
  ResumeWithdrawalFlowOptions,
  QuoteRequestOptions,
  Machine,
  FlowState,
  FlowActionType,
  FlowContext,
} from '@bluvo/sdk-ts';
import { useFlowMachine } from './useFlowMachine';
import type { BluvoFlowClient } from '@bluvo/sdk-ts';

export interface UseBluvoFlowOptions extends BluvoFlowClientOptions {}

type Exchange = {
  id: string;
  name: string;
  logoUrl: string;
  status: string;
};

type WalletBalance = {
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
};

type Quote = {
  id: string;
  asset: string;
  amount: string;
  estimatedFee: string;
  estimatedTotal: string;
  amountWithFeeInFiat: string;
  amountNoFeeInFiat: string;
  estimatedFeeInFiat: string;
  additionalInfo: { minWithdrawal: string | null; maxWithdrawal?: string | null; };
  expiresAt: number;
};

type Withdrawal = {
  id: string;
  status: string;
  transactionId?: string;
};

type WithdrawalFlowResult = {
  machine: Machine<FlowState, FlowActionType>;
  closeOAuthWindow?: () => void;
};

export interface UseBluvoFlowHook {
  // State from useFlowMachine
  state: FlowState | null;
  send: (action: FlowActionType) => void;
  isInState: (stateType: FlowState['type']) => boolean;
  hasError: boolean;
  error: Error | null | undefined;
  context: FlowContext | null | undefined;
  
  // Actions
  listExchanges: BluvoFlowClient['loadExchanges'];
  startWithdrawalFlow: BluvoFlowClient['startWithdrawalFlow'];
  resumeWithdrawalFlow: BluvoFlowClient['resumeWithdrawalFlow'];
  requestQuote: BluvoFlowClient['requestQuote'];
  executeWithdrawal: BluvoFlowClient['executeWithdrawal'];
  submit2FA: BluvoFlowClient['submit2FA'];
  retryWithdrawal: BluvoFlowClient['retryWithdrawal'];
  cancel: BluvoFlowClient['cancel'];
  testWithdrawalComplete: BluvoFlowClient['testWithdrawalComplete'];
  
  // Computed state helpers
  isExchangesLoading: boolean;
  isExchangesReady: boolean;
  exchangesError: Error | null;
  isOAuthPending: boolean;
  isOAuthComplete: boolean;
  isOAuthWindowBeenClosedByTheUser: boolean;
  isWalletLoading: boolean;
  isWalletReady: boolean;
  isQuoteLoading: boolean;
  isQuoteReady: boolean;
  isQuoteExpired: boolean;
  isWithdrawing: boolean;
  isWithdrawalComplete: boolean;
  hasFatalError: boolean;
  requires2FA: boolean;
  requiresValid2FAMethod: boolean; // i.e. some exchanges support TOTP and SMS only, instead of Passkey/Yubikey
  requiresKYC: boolean;
  hasInsufficientBalance: boolean;
  canRetry: boolean;

  // Data
  exchanges: Exchange[];
  walletBalances: WalletBalance[];
  quote: Quote | undefined;
  withdrawal: Withdrawal | undefined;
  valid2FAMethods: string[] | undefined;
  invalid2FAAttempts?: number;

    // Client instance (for advanced use)
  client: BluvoFlowClient;
}

export function useBluvoFlow(options: UseBluvoFlowOptions):UseBluvoFlowHook {
  const [flowClient] = useState(() => {
    // Lazy import to avoid SSR issues
    const { BluvoFlowClient } = require('@bluvo/sdk-ts');
    return new BluvoFlowClient(options);
  });
  const [flowMachine, setFlowMachine] = useState<Machine<FlowState, FlowActionType> | null>(null);
  const [exchanges, setExchanges] = useState<Array<{ id: string; name: string; logoUrl: string; status: string; }>>([]);
  const [exchangesLoading, setExchangesLoading] = useState(false);
  const [exchangesError, setExchangesError] = useState<Error | null>(null);
  const closeOAuthWindowRef = useRef<(() => void) | null>(null);
  
  const flow = useFlowMachine(flowMachine);

  const startWithdrawalFlow = useCallback(async (flowOptions: WithdrawalFlowOptions) => {
    const result = await flowClient.startWithdrawalFlow(flowOptions);
    setFlowMachine(result.machine);
    closeOAuthWindowRef.current = result.closeOAuthWindow;
    return result;
  }, [flowClient]);

  const resumeWithdrawalFlow = useCallback(async (flowOptions: ResumeWithdrawalFlowOptions) => {
    const result = await flowClient.resumeWithdrawalFlow(flowOptions);
    setFlowMachine(result.machine);
    return result;
  }, [flowClient]);

  const requestQuote = useCallback(async (options: QuoteRequestOptions) => {
    return await flowClient.requestQuote(options);
  }, [flowClient]);

  const executeWithdrawal = useCallback(async (quoteId: string) => {
    return await flowClient.executeWithdrawal(quoteId);
  }, [flowClient]);

  const submit2FA = useCallback(async (code: string) => {
    return await flowClient.submit2FA(code);
  }, [flowClient]);

  const retryWithdrawal = useCallback(async () => {
    return await flowClient.retryWithdrawal();
  }, [flowClient]);

  const listExchanges = useCallback(async (status?: 'live' | 'offline' | 'maintenance' | 'coming_soon') => {
    setExchangesLoading(true);
    setExchangesError(null);
    
    try {
      const result = await flowClient.loadExchanges(status);
      setExchanges(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to load exchanges');
      setExchangesError(errorObj);
      throw errorObj;
    } finally {
      setExchangesLoading(false);
    }
  }, [flowClient]);

  const cancel = useCallback(() => {
    flowClient.cancel();
    setFlowMachine(null);
    if (closeOAuthWindowRef.current) {
      closeOAuthWindowRef.current();
      closeOAuthWindowRef.current = null;
    }
  }, [flowClient]);

  // TEST METHOD - For testing withdrawal completion without real transactions
  const testWithdrawalComplete = useCallback((transactionId?: string) => {
    flowClient.testWithdrawalComplete(transactionId);
  }, [flowClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flowClient.dispose();
      if (closeOAuthWindowRef.current) {
        closeOAuthWindowRef.current();
      }
    };
  }, [flowClient]);

  return {
    // State
    ...flow,
    
    // Actions
    listExchanges,
    startWithdrawalFlow,
    resumeWithdrawalFlow,
    requestQuote,
    executeWithdrawal,
    submit2FA,
    retryWithdrawal,
    cancel,
    testWithdrawalComplete, // TEST METHOD
    
    // Computed state helpers
    isExchangesLoading: exchangesLoading || flow.state?.type === 'exchanges:loading',
    isExchangesReady: flow.state?.type === 'exchanges:ready' || exchanges.length > 0,
    exchangesError: exchangesError || (flow.state?.type === 'exchanges:error' ? flow.error || null : null),
    isOAuthPending: flow.state?.type === 'oauth:waiting' || flow.state?.type === 'oauth:processing',
    isOAuthComplete: flow.state?.type === 'oauth:completed',
    isOAuthWindowBeenClosedByTheUser: flow.state?.type === 'oauth:window_closed_by_user',
    isWalletLoading: flow.state?.type === 'wallet:loading',
    isWalletReady: flow.state?.type === 'wallet:ready',
    isQuoteLoading: flow.state?.type === 'quote:requesting',
    isQuoteReady: flow.state?.type === 'quote:ready',
    isQuoteExpired: flow.state?.type === 'quote:expired',
    isWithdrawing: flow.state?.type?.startsWith('withdraw:') && 
                   flow.state?.type !== 'withdraw:completed' && 
                   flow.state?.type !== 'withdraw:fatal' &&
                   !flow.state?.type?.startsWith('withdraw:error') || false,
    isWithdrawalComplete: flow.state?.type === 'withdraw:completed',
    hasFatalError: flow.state?.type === 'withdraw:fatal',
    requires2FA: flow.state?.type === 'withdraw:error2FA',
    requiresValid2FAMethod: (flow.state?.type === 'withdraw:fatal' && 
                            flow.error?.message?.includes('Two-factor authentication method not supported')) || false,
    requiresKYC: flow.state?.type === 'withdraw:errorKYC',
    hasInsufficientBalance: flow.state?.type === 'withdraw:errorBalance',
    canRetry: flow.state?.type === 'withdraw:retrying',
    invalid2FAAttempts: flow.context?.invalid2FAAttempts || 0,
    
    // Data
    exchanges: flow.context?.exchanges || exchanges,
    walletBalances: flow.context?.walletBalances || [],
    quote: flow.context?.quote,
    withdrawal: flow.context?.withdrawal,
    valid2FAMethods: flow.context?.errorDetails?.valid2FAMethods,
    
    // Client instance (for advanced use)
    client: flowClient
  };
}
