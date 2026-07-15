---
"@bluvo/sdk-ts": minor
"@bluvo/react": minor
---

Document the KuCoin integration in the agent skill docs (`packages/ts/skill/` and `packages/react/skill/`), with a focus on the withdrawal step.

KuCoin's broker withdrawal API validates every 2FA factor in a single call — there is no incremental per-factor verification. Re-executing the withdrawal with a partial factor set (e.g. only the Google code when EMAIL + GOOGLE are required with relation `AND`) makes KuCoin answer `200000` with no ids and the challenge dies server-side. The SDK therefore batch-collects codes for exchanges in `BATCH_2FA_VALIDATION_EXCHANGES` (currently `['kucoin']`), and the skill docs previously did not explain this: an agent reading only the docs would conclude that every `submit2FAMultiStep()` call triggers an immediate dry-run round-trip, which is exactly backwards for KuCoin.

What the docs now cover:

- **`@bluvo/sdk-ts` skill** (`skill/SKILL.md`): the `submit2FAMultiStep()` action doc now distinguishes incremental exchanges (binance-web, bybit-web) from batch-validation exchanges (KuCoin), and a new Gotcha explains the `COLLECT_2FA_MULTI_STEP` action — codes are stored locally (`GOOGLE` → `twofa`, `EMAIL` → `emailCode`, `SMS` → `smsCode`), the step is marked `success` locally so the UI advances, and the withdrawal endpoint is called exactly once with `bizNo` + all collected codes after the last required code arrives. Steps already `mfa.verified` count as satisfied; FACE/ROAMING_FIDO are excluded (poll-verified); relation `OR` keeps immediate re-execution.
- **`@bluvo/sdk-ts` skill reference** (`skill/references/state-transitions.md`): new `COLLECT_2FA_MULTI_STEP` transition-table row and a dedicated "Multi-step 2FA (KuCoin — batch factor validation)" sequence diagram showing the single `executeWithdrawal` call.
- **`@bluvo/react` skill** (`skill/SKILL.md`): new Gotcha with the UI implications — do not render a locally-collected KuCoin step as "backend verified" (an invalid code only surfaces after the final batch call as `WITHDRAWAL_2FA_INVALID`), and do not expect `isWithdrawProcessing`/`mfaVerified` updates between KuCoin code submissions.
- **`@bluvo/react` skill reference** (`skill/references/multistep-2fa.md`): new "Exchange Verification Models" section with an incremental-vs-batch comparison table, a KuCoin-specific state machine lifecycle diagram, the `{ collected: true, awaitingSteps }` return shape, and a UI labeling caveat ("Code entered" vs "Verified"). The existing lifecycle and dryRun sections are now explicitly scoped to incremental exchanges.
- **`AGENTS.md`**: new "Exchange-Specific Behavior" architecture section covering `QR_CODE_EXCHANGES` and `BATCH_2FA_VALIDATION_EXCHANGES`, pointing at the spec test (`packages/ts/test/machines/BluvoFlowClient.submit2FAMultiStep.test.ts`) and requiring skill docs to be kept in sync with exchange-specific behavior changes.

No runtime code changes — documentation only.
