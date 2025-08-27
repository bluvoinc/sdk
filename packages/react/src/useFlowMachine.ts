import { useEffect, useState, useCallback, useRef } from 'react';
import type { Machine } from '@bluvo/sdk-ts';
import type { FlowState, FlowActionType } from '@bluvo/sdk-ts';

export function useFlowMachine(
  machine: Machine<FlowState, FlowActionType> | null
) {
  const [state, setState] = useState<FlowState | null>(() => 
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

  const send = useCallback((action: FlowActionType) => {
    machineRef.current?.send(action);
  }, []);

  return {
    state,
    send,
    isInState: (stateType: FlowState['type']) => state?.type === stateType,
    hasError: state?.error !== null,
    error: state?.error,
    context: state?.context
  };
}