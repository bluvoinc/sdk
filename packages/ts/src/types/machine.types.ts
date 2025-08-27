export type Listener<TState> = (state: TState) => void;

export type Unsubscribe = () => void;

export interface Machine<TState, TAction> {
  getState(): TState;
  send(action: TAction): void;
  subscribe(listener: Listener<TState>): Unsubscribe;
  dispose(): void;
}

export interface StateValue<TStateType extends string = string> {
  type: TStateType;
  context: Record<string, any>;
  error?: Error | null;
}

export type StateTransition<TState, TAction> = (
  state: TState,
  action: TAction
) => TState;