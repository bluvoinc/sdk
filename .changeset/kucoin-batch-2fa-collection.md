---
"@bluvo/sdk-ts": patch
---

Collect all required 2FA codes before re-executing KuCoin withdrawals.

KuCoin's broker withdrawal API validates every 2FA factor in a single call: re-executing with a partial factor set (e.g. only the Google code when email + Google are both required with relation AND) makes KuCoin answer `200000` with no ids and the challenge dies, which previously surfaced as a fatal `KuCoin withdrawal failed: unexpected response shape` error.

`submit2FAMultiStep` now stores each code locally (new `COLLECT_2FA_MULTI_STEP` action, which marks the step done so the UI advances) and only calls the withdrawal endpoint once every required code-based step has a collected code. Exchanges with incremental server-side verification (binance-web, bybit-web) keep the existing per-step re-execution behavior.
