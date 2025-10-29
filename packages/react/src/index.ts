export { useFlowMachine } from './useFlowMachine';
export { useWithdrawMachine } from './useWithdrawMachine';
export { useBluvoFlow } from './useBluvoFlow';
export type { UseBluvoFlowOptions, UseBluvoFlowHook } from './useBluvoFlow';

// Preview hooks (NEW - backwards compatible)
export { useWalletPreviews } from './useWalletPreviews';
export type { UseWalletPreviewsOptions, UseWalletPreviewsReturn } from './useWalletPreviews';

// Re-export types from the core SDK for convenience
export type {
  BluvoFlowClientOptions,
  WithdrawalFlowOptions,
  ResumeWithdrawalFlowOptions,
  SilentResumeWithdrawalFlowOptions,
  QuoteRequestOptions,
  FlowState,
  FlowActionType,
  WithdrawalState,
  WithdrawalActionType,
  Machine,
  // Preview types
  PreviewWalletInput,
  WalletPreviewState,
  PreviewStatus,
  PreviewCallbacks,
  BluvoPreviewManager,
  BluvoPreviewManagerOptions
} from '@bluvo/sdk-ts';