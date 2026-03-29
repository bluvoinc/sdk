# Components Reference

`@bluvo/react` **does not export any React components**. It exports only hooks:

- `useBluvoFlow` — Main flow hook
- `useFlowMachine` — Lower-level flow machine hook
- `useWithdrawMachine` — Withdrawal machine hook
- `useWalletPreviews` — Wallet preview hook

The test application (`packages/test-open-window/src/app/components/`) contains example components for rendering each flow state, but these are **not** part of the published `@bluvo/react` package. They serve as reference implementations only.

Build your own UI components that consume the hook return values. See `references/hooks-complete.md` for the full API surface.
