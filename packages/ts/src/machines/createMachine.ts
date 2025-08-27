import { Machine, Listener, StateTransition } from '../types/machine.types';

export function createMachine<TState, TAction>(
  initialState: TState,
  transition: StateTransition<TState, TAction>
): Machine<TState, TAction> {
  let state = initialState;
  let listeners: Set<Listener<TState>> = new Set();
  let isDisposed = false;

  function assertNotDisposed() {
    if (isDisposed) {
      throw new Error('Machine has been disposed');
    }
  }

  function notifyListeners() {
    listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  return {
    getState(): TState {
      assertNotDisposed();
      return state;
    },

    send(action: TAction): void {
      assertNotDisposed();
      const prevState = state;
      state = transition(state, action);
      
      if (state !== prevState) {
        notifyListeners();
      }
    },

    subscribe(listener: Listener<TState>) {
      assertNotDisposed();
      listeners.add(listener);
      
      // Immediately notify with current state
      listener(state);
      
      return () => {
        listeners.delete(listener);
      };
    },

    dispose(): void {
      if (!isDisposed) {
        listeners.clear();
        isDisposed = true;
      }
    }
  };
}