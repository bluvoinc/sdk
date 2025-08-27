import { useEffect, useState, useCallback, useRef } from 'react';
import type { Machine } from '@bluvo/sdk-ts';
import type { WithdrawalState, WithdrawalActionType } from '@bluvo/sdk-ts';

export function useWithdrawMachine(
  machine: Machine<WithdrawalState, WithdrawalActionType> | null
) {
  const [state, setState] = useState<WithdrawalState | null>(() => 
    machine?.getState() || null
  );
  
  const machineRef = useRef(machine);
  machineRef.current = machine;

  useEffect(() => {
    if (!machine) {
      setState(null);
      return;
    }

    // Set initial state
    setState(machine.getState());

    // Subscribe to state changes
    const unsubscribe = machine.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [machine]);

  const send = useCallback((action: WithdrawalActionType) => {
    machineRef.current?.send(action);
  }, []);

  return {
    state,
    send,
    isInState: (stateType: WithdrawalState['type']) => state?.type === stateType,
    hasError: state?.error !== null,
    error: state?.error,
    context: state?.context,
    requires2FA: state?.type === 'waitingFor2FA',
    requiresSMS: state?.type === 'waitingForSMS',
    requiresKYC: state?.type === 'waitingForKYC',
    isCompleted: state?.type === 'completed',
    isBlocked: state?.type === 'blocked',
    canRetry: state?.type === 'retrying'
  };
}