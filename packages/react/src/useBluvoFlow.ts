import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  BluvoFlowClientOptions,
  WithdrawalFlowOptions,
  ResumeWithdrawalFlowOptions,
  QuoteRequestOptions,
  Machine,
  FlowState,
  FlowActionType
} from '@bluvo/sdk-ts';
import { useFlowMachine } from './useFlowMachine';

export interface UseBluvoFlowOptions extends BluvoFlowClientOptions {}

export function useBluvoFlow(options: UseBluvoFlowOptions) {
  const [flowClient] = useState(() => {
    // Lazy import to avoid SSR issues
    const { BluvoFlowClient } = require('@bluvo/sdk-ts');
    return new BluvoFlowClient(options);
  });
  const [flowMachine, setFlowMachine] = useState<Machine<FlowState, FlowActionType> | null>(null);
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
    await flowClient.requestQuote(options);
  }, [flowClient]);

  const executeWithdrawal = useCallback(async (quoteId: string) => {
    await flowClient.executeWithdrawal(quoteId);
  }, [flowClient]);

  const submit2FA = useCallback(async (code: string) => {
    await flowClient.submit2FA(code);
  }, [flowClient]);

  const submitSMS = useCallback(async (code: string) => {
    await flowClient.submitSMS(code);
  }, [flowClient]);

  const retryWithdrawal = useCallback(async () => {
    await flowClient.retryWithdrawal();
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
    startWithdrawalFlow,
    resumeWithdrawalFlow,
    requestQuote,
    executeWithdrawal,
    submit2FA,
    submitSMS,
    retryWithdrawal,
    cancel,
    testWithdrawalComplete, // TEST METHOD
    
    // Computed state helpers
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
    requiresSMS: flow.state?.type === 'withdraw:errorSMS',
    requiresKYC: flow.state?.type === 'withdraw:errorKYC',
    hasInsufficientBalance: flow.state?.type === 'withdraw:errorBalance',
    canRetry: flow.state?.type === 'withdraw:retrying',
    invalid2FAAttempts: flow.context?.invalid2FAAttempts || 0,
    
    // Data
    walletBalances: flow.context?.walletBalances || [],
    quote: flow.context?.quote,
    withdrawal: flow.context?.withdrawal,
    
    // Client instance (for advanced use)
    client: flowClient
  };
}