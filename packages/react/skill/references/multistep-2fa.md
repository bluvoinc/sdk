# Multi-Step 2FA Handling

> Deep-dive reference for AI agents building multi-step 2FA verification UIs for exchanges like Binance.

---

## 1. Overview

Exchanges like Binance require multiple verification factors before allowing a withdrawal. The SDK manages this as a multi-step 2FA flow with 5 possible step types.

### Step Types

| Type | Input | Metadata | Description |
|------|-------|----------|-------------|
| `GOOGLE` | 6-digit TOTP code | None | Google Authenticator / TOTP app |
| `EMAIL` | 4-10 character code | `{ email: string, emailSent: boolean }` | Code sent to masked email |
| `FACE` | None (polling) | `{ qrCodeUrl: string, qrCodeValidSeconds: number }` | QR code scanned on exchange mobile app |
| `SMS` | 4-10 character code | None | SMS verification code |
| `ROAMING_FIDO` | None (polling) | `{ roamingFlowId: string }` | Security key / Binance app verification |

### Key Principles

1. **`mfa.verified` is the PRIMARY source of truth** — not `step.status`
2. **`relation`** determines logic: `'AND'` = all required steps, `'OR'` = any one step
3. **`dryRun` pattern**: intermediate submissions validate codes without executing the withdrawal; only `confirmWithdrawal()` executes for real
4. **`bizNo`** must be preserved across ALL multi-step 2FA API calls in the same flow
5. **`WITHDRAWAL_DRY_RUN_COMPLETE`** is NOT an error — it's a success signal meaning all steps are verified

---

## 2. State Machine Flow

### Complete Lifecycle

```
withdraw:processing (executeWithdrawal called)
    │
    ├─ WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS
    │
    ▼
withdraw:error2FAMultiStep  ◄──────────────────────────────┐
    │                                                       │
    ├─ User submits code → submit2FAMultiStep(type, code)   │
    ├─ FACE auto-poll → pollFaceVerification()              │
    ├─ ROAMING_FIDO auto-poll → pollRoamingFidoVerification() │
    │                                                       │
    ▼                                                       │
withdraw:processing (re-invoke with bizNo + collected codes)│
    │                                                       │
    ├─ WITHDRAWAL_2FA_INCOMPLETE (some steps pending) ──────┘
    │       → updates mfa.verified, stays in multi-step
    │
    ├─ WITHDRAWAL_DRY_RUN_COMPLETE (all steps verified)
    │       ▼
    │  withdraw:readyToConfirm
    │       │
    │       ├─ confirmWithdrawal() (NO dryRun — real execution)
    │       ▼
    │  withdraw:processing
    │       │
    │       ├─ Success → withdraw:completed
    │       └─ Error → withdraw:fatal
    │
    └─ WITHDRAWAL_2FA_INVALID (wrong code)
            → back to withdraw:error2FAMultiStep
            → mfaVerified[stepType] === false
```

### State Reference

| State | Meaning | Trigger |
|-------|---------|---------|
| `withdraw:error2FAMultiStep` | Multi-step 2FA required, show verification UI | `WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS` or `WITHDRAWAL_2FA_INCOMPLETE` |
| `withdraw:processing` | Code submission or confirmation in progress | `submit2FAMultiStep()` or `confirmWithdrawal()` |
| `withdraw:readyToConfirm` | All steps verified, awaiting final confirmation | `WITHDRAWAL_DRY_RUN_COMPLETE` |
| `withdraw:completed` | Withdrawal successful | Successful `confirmWithdrawal()` |
| `withdraw:fatal` | Unrecoverable error | Fatal error during confirmation |

---

## 3. Data Structures

### MultiStep2FAContext (on FlowContext)

```typescript
multiStep2FA?: {
  bizNo: string;                    // Transaction identifier — preserve across ALL calls
  steps: Array<{
    type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS' | 'ROAMING_FIDO';
    status: 'pending' | 'success' | 'failed';
    required: boolean;
    metadata?: {
      email?: string;               // EMAIL: masked address (e.g., "j***@gmail.com")
      emailSent?: boolean;          // EMAIL: whether code was sent
      qrCodeUrl?: string;           // FACE: QR code URL to display
      qrCodeValidSeconds?: number;  // FACE: QR code validity duration
      roamingFlowId?: string;       // ROAMING_FIDO: flow identifier
    };
  }>;
  relation: 'AND' | 'OR';          // 'AND' = all required, 'OR' = any one
  collectedCodes?: {
    twofa?: string;                 // GOOGLE authenticator code
    emailCode?: string;             // EMAIL verification code
    smsCode?: string;               // SMS verification code
  };
  faceQrCodeUrl?: string;           // Extracted FACE QR code URL
  faceQrCodeExpiresAt?: number;     // FACE QR expiration timestamp (ms)
  mfa?: {
    verified: {                     // PRIMARY source of truth
      GOOGLE?: boolean;             // true = verified, false = invalid code
      EMAIL?: boolean;
      FACE?: boolean;
      SMS?: boolean;
      ROAMING_FIDO?: boolean;
    };
  };
};
```

### MfaVerified Interface

```typescript
interface MfaVerified {
  GOOGLE?: boolean;
  EMAIL?: boolean;
  FACE?: boolean;
  SMS?: boolean;
  ROAMING_FIDO?: boolean;
}
```

### Step Metadata by Type

| Step Type | `metadata` Fields | Notes |
|-----------|-------------------|-------|
| `GOOGLE` | None | — |
| `EMAIL` | `email: string`, `emailSent: boolean` | Email is masked: `"j***@gmail.com"` |
| `FACE` | `qrCodeUrl: string`, `qrCodeValidSeconds: number` | QR code for exchange mobile app |
| `SMS` | None | — |
| `ROAMING_FIDO` | `roamingFlowId: string` | Flow identifier for security key verification |

### Verification Helpers

```typescript
// PRIMARY source of truth: mfa.verified, FALLBACK: step.status
function isStepVerified(step: MultiStep2FAStep, mfaVerified?: MfaVerified): boolean {
  if (mfaVerified && mfaVerified[step.type] === true) return true;
  return step.status === 'success';
}

// Detect wrong code submission
function isStepVerificationFailed(
  stepType: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS' | 'ROAMING_FIDO',
  mfaVerified?: MfaVerified
): boolean {
  return mfaVerified?.[stepType] === false;
}
```

---

## 4. React Hook Fields

All `useBluvoFlow()` return fields for multi-step 2FA:

### State Booleans

| Field | Condition | Use |
|-------|-----------|-----|
| `requires2FAMultiStep` | `state.type === 'withdraw:error2FAMultiStep'` | Show multi-step 2FA UI |
| `isReadyToConfirm` | `state.type === 'withdraw:readyToConfirm'` | Show confirm button |
| `isWithdrawProcessing` | `state.type === 'withdraw:processing'` | Disable inputs during submission |

### Step Detection

| Field | Condition |
|-------|-----------|
| `hasGoogleStep` | Steps array contains type `'GOOGLE'` |
| `hasEmailStep` | Steps array contains type `'EMAIL'` |
| `hasFaceStep` | Steps array contains type `'FACE'` |
| `hasSmsStep` | Steps array contains type `'SMS'` |
| `hasRoamingFidoStep` | Steps array contains type `'ROAMING_FIDO'` |

### Step Verification (PRIMARY = `mfa.verified`)

| Field | Logic |
|-------|-------|
| `isGoogleStepVerified` | `mfaVerified?.GOOGLE === true` OR step status `'success'` |
| `isEmailStepVerified` | `mfaVerified?.EMAIL === true` OR step status `'success'` |
| `isFaceStepVerified` | `mfaVerified?.FACE === true` OR step status `'success'` |
| `isSmsStepVerified` | `mfaVerified?.SMS === true` OR step status `'success'` |
| `isRoamingFidoStepVerified` | `mfaVerified?.ROAMING_FIDO === true` OR step status `'success'` |
| `allMultiStep2FAStepsVerified` | All required steps verified |

### Context Data

| Field | Type | Source |
|-------|------|--------|
| `multiStep2FA` | `MultiStep2FAContext` | Full multi-step 2FA context object |
| `multiStep2FASteps` | `Step[]` | `multiStep2FA.steps` |
| `multiStep2FABizNo` | `string` | `multiStep2FA.bizNo` |
| `multiStep2FARelation` | `'AND' \| 'OR'` | `multiStep2FA.relation` |
| `collectedMultiStep2FACodes` | `{ twofa?, emailCode?, smsCode? }` | Accumulated submitted codes |
| `mfaVerified` | `MfaVerified` | `multiStep2FA.mfa.verified` |
| `faceQrCodeUrl` | `string \| undefined` | FACE step QR code URL |
| `faceQrCodeExpiresAt` | `number \| undefined` | FACE QR expiration timestamp |

### Actions

| Method | Signature | When |
|--------|-----------|------|
| `submit2FAMultiStep` | `(stepType: 'GOOGLE' \| 'EMAIL' \| 'SMS', code: string) => Promise<...>` | Submit code for a step |
| `pollFaceVerification` | `() => Promise<...>` | Check if FACE step is verified |
| `pollRoamingFidoVerification` | `() => Promise<...>` | Poll for ROAMING_FIDO verification status |
| `confirmWithdrawal` | `() => Promise<...>` | Execute real withdrawal after all steps verified |

---

## 5. Rendering Each Step Type

### Universal Step Container

Each step should have:
- Border color based on verification status: green (verified), red (failed), gray (pending)
- Icon per step type (lock for GOOGLE, envelope for EMAIL, camera for FACE, phone for SMS)
- Required badge if `step.required === true`
- Status badge: pending (yellow), success (green), failed (red)

### GOOGLE Step

```tsx
<input
  type="text"
  inputMode="numeric"
  maxLength={6}
  minLength={6}
  placeholder="000000"
  autoComplete="one-time-code"
/>
<button disabled={code.length !== 6 || isSubmitting}>Submit</button>
```

- 6-digit numeric input only
- Submit button disabled until exactly 6 characters entered

### EMAIL Step

```tsx
<p>Code sent to: {step.metadata?.email}</p>  {/* e.g., "j***@gmail.com" */}
<input
  type="text"
  inputMode="numeric"
  maxLength={10}
  minLength={4}
  placeholder="Enter code"
/>
<button disabled={code.length < 4 || isSubmitting}>Submit</button>
```

- Variable-length code (4-10 characters)
- Display masked email from `step.metadata.email`

### SMS Step

```tsx
<input
  type="text"
  inputMode="numeric"
  maxLength={10}
  minLength={4}
  placeholder="Enter SMS code"
/>
<button disabled={code.length < 4 || isSubmitting}>Submit</button>
```

- Variable-length code (4-10 characters)
- Same input pattern as EMAIL

### FACE Step

**No code input.** Renders QR code + polling indicator.

```tsx
<QRCodeDisplay url={faceQrCodeUrl} size={200} />
<CountdownTimer expiresAt={faceQrCodeExpiresAt} />
<p>Auto-checking every 5 seconds...</p>
```

- User scans QR code with exchange mobile app
- Polling happens automatically (see section 6)
- No submit button — verification is detected via polling

### ROAMING_FIDO Step

**No code input.** Shows instruction message + polling indicator.

```tsx
<p style={{ fontWeight: '600' }}>Complete the verification in your Binance App</p>
<p>Auto-checking every 5 seconds...</p>
```

- User completes verification in Binance mobile app
- Polling happens automatically (see section 6b)
- No submit button, no QR code — just an instruction message

### Verified State (All Types)

When `isStepVerified(step, mfaVerified)` returns `true`:

```tsx
<div style={{ borderColor: 'green', background: '#f0fff0' }}>
  <span>✓ Verified</span>
</div>
```

- Hide the code input
- Show green checkmark + "Verified" text

### Failed State

When `isStepVerificationFailed(step.type, mfaVerified)` returns `true`:

- Red border on input
- "Invalid code. Please try again." message
- Allow re-submission with new code

---

## 6. FACE & ROAMING_FIDO Polling Implementation

### Why Polling

The user completes FACE verification on a separate device (the exchange's mobile app). The SDK cannot detect completion via user input — it must poll the backend.

### Polling Mechanism (React)

Uses refs (not state) to prevent concurrent calls:

```tsx
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const isPollingRef = useRef(false);    // Guards against concurrent pollFaceVerification() calls
const isActiveRef = useRef(false);     // Master switch for polling lifecycle
```

### Timing

| Parameter | Value | Reason |
|-----------|-------|--------|
| Initial delay | 10 seconds | Give user time to scan QR code |
| Poll interval | 5 seconds | Balance responsiveness vs server load |
| Concurrency guard | `isPollingRef` | Prevents overlapping API calls |

### Polling Pattern

```tsx
const stopPolling = useCallback(() => {
  isActiveRef.current = false;
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
}, []);

const poll = useCallback(async () => {
  if (!isActiveRef.current) return;
  if (isPollingRef.current) return;       // Prevent concurrent calls
  try {
    isPollingRef.current = true;
    await onPollFaceVerification();
  } finally {
    isPollingRef.current = false;
  }
  if (!isActiveRef.current) return;
  timeoutRef.current = setTimeout(poll, 5000);
}, [onPollFaceVerification]);

// Start polling
useEffect(() => {
  if (shouldPoll) {
    isActiveRef.current = true;
    timeoutRef.current = setTimeout(poll, 10000);  // 10s initial delay
  }
  return stopPolling;
}, [shouldPoll]);
```

### shouldPoll Condition

```typescript
const isFaceVerified = mfaVerified?.FACE === true ||
  steps.find(s => s.type === 'FACE')?.status === 'success';
const faceStepPending = steps.find(s => s.type === 'FACE' && s.status === 'pending');
const shouldPoll = !isFaceVerified && faceStepPending && faceQrCodeUrl;
```

### Stop Conditions

- FACE step verified (`mfaVerified.FACE === true`)
- Component unmount (cleanup function)
- `shouldPoll` becomes false

### What `pollFaceVerification()` Does Internally

Calls `executeWithdrawalFn()` with `dryRun: true` and `bizNo` — backend checks if FACE step is complete without processing the withdrawal. Returns updated `mfa.verified` state.

**Important:** `pollFaceVerification()` does NOT transition the state machine to `withdraw:processing`. The MFA UI stays visible during polling.

### 6b. ROAMING_FIDO Polling

Same mechanism as FACE but with different timing and no QR code dependency.

| Parameter | Value | Reason |
|-----------|-------|--------|
| Initial delay | **None** (immediate) | No QR code to scan — user already prompted |
| Poll interval | 5 seconds | Same as FACE |
| Concurrency guard | `isPollingRoamingFidoRef` | Separate from FACE refs |

**shouldPollRoamingFido Condition:**

```typescript
const isRoamingFidoVerified = mfaVerified?.ROAMING_FIDO === true ||
  steps.find(s => s.type === 'ROAMING_FIDO')?.status === 'success';
const roamingFidoStepPending = steps.find(s => s.type === 'ROAMING_FIDO' && s.status === 'pending');
const shouldPollRoamingFido = !isRoamingFidoVerified && !!roamingFidoStepPending;
```

**Critical: No loading spinner during polling.** Both `pollFaceVerification()` and `pollRoamingFidoVerification()` do NOT transition the state machine to `withdraw:processing`. The MFA UI stays visible throughout polling.

---

## 7. The dryRun Pattern Explained

### How It Works

When `submit2FAMultiStep()` is called, the SDK sends the code to the backend. The backend validates and returns one of three outcomes:

| Backend Response | Error Code | SDK Action | Next State |
|-----------------|------------|------------|------------|
| Some steps still pending | `WITHDRAWAL_2FA_INCOMPLETE` | Updates `mfa.verified`, keeps collecting | `withdraw:error2FAMultiStep` |
| All steps verified | `WITHDRAWAL_DRY_RUN_COMPLETE` | Marks all steps verified | `withdraw:readyToConfirm` |
| Wrong code | `WITHDRAWAL_2FA_INVALID` | Sets `mfaVerified[stepType] = false` | `withdraw:error2FAMultiStep` |

### Key Points

- `submit2FAMultiStep()` sends accumulated `collectedCodes` + `bizNo`
- `pollFaceVerification()` sends `dryRun: true` explicitly (no collected codes, just checking)
- `pollRoamingFidoVerification()` sends `dryRun: true` explicitly (same as FACE — just checking)
- `confirmWithdrawal()` sends the final request WITHOUT `dryRun` — the actual withdrawal executes
- `bizNo` is preserved across all calls in the same multi-step flow
- `WITHDRAWAL_DRY_RUN_COMPLETE` is mapped to `withdraw:readyToConfirm` by `withdrawalErrorHandler.ts`

---

## 8. Confirmation Flow

### When to Show Confirm Button

```typescript
// Primary condition
const showConfirm = isReadyToConfirm;  // state === 'withdraw:readyToConfirm'

// Alternative: all steps verified but state hasn't transitioned yet
const showConfirmAlt = allMultiStep2FAStepsVerified && requires2FAMultiStep;
```

### Confirmation UI

```tsx
{(isReadyToConfirm || allMultiStep2FAStepsVerified) && (
  <div>
    <p>✓ All verification steps completed!</p>
    <button
      onClick={confirmWithdrawal}
      disabled={isWithdrawProcessing}
    >
      {isWithdrawProcessing ? 'Processing...' : 'Confirm Withdrawal'}
    </button>
  </div>
)}
```

### Internal Flow

1. `confirmWithdrawal()` dispatches `CONFIRM_WITHDRAWAL`
2. State → `withdraw:processing`
3. SDK calls `executeWithdrawalFn()` with all collected codes + `bizNo` (no `dryRun`)
4. Success → `withdraw:completed`
5. Error → `withdraw:fatal`

---

## 9. Progress Indicator

### Calculation

```typescript
const verifiedCount = steps.filter(s => isStepVerified(s, mfaVerified)).length;
const totalSteps = steps.length;
const percentage = (verifiedCount / totalSteps) * 100;
```

### Rendering

```tsx
<div>
  <div style={{ width: '100%', background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
    <div style={{
      width: `${percentage}%`,
      background: '#28a745',
      height: 8,
      transition: 'width 0.3s ease'
    }} />
  </div>
  <span>{verifiedCount}/{totalSteps} verified</span>
</div>
```

- Animate width with CSS `transition: width 0.3s ease`
- Green fill color (`#28a745`)

---

## 10. Error Handling

### Error Code Reference

| Error Code | Meaning | SDK Behavior |
|-----------|---------|--------------|
| `WITHDRAWAL_2FA_REQUIRED_MULTI_STEPS` | Initial: multi-step 2FA needed | → `withdraw:error2FAMultiStep` with steps array |
| `WITHDRAWAL_2FA_INCOMPLETE` | Some steps verified, more needed | → `withdraw:error2FAMultiStep` with updated `mfa.verified` |
| `WITHDRAWAL_DRY_RUN_COMPLETE` | All steps verified (dry-run success) | → `withdraw:readyToConfirm` |
| `WITHDRAWAL_2FA_INVALID` | Wrong code submitted | → `withdraw:error2FAMultiStep` with `mfaVerified[type] = false` |

### Quote Expiration During 2FA

- Display countdown timer for `quote.expiresAt` while the user completes 2FA steps
- If the quote expires during 2FA: request a new quote and re-execute the withdrawal
- The multi-step 2FA state will be re-triggered with fresh `bizNo` and steps

### Fatal Errors

If `withdraw:fatal` occurs during multi-step 2FA:
- Show error message
- Offer "Restart" option — the entire flow must be restarted from the beginning

---

## 11. Complete React Pattern

### Container Component

```tsx
function WithdrawalVerification() {
  const flow = useBluvoFlow({ /* options */ });

  if (!flow.requires2FAMultiStep && !flow.isReadyToConfirm) return null;

  return (
    <MultiStep2FAComponent
      steps={flow.multiStep2FASteps}
      relation={flow.multiStep2FARelation || 'AND'}
      onSubmitCode={flow.submit2FAMultiStep}
      onPollFaceVerification={flow.pollFaceVerification}
      onPollRoamingFidoVerification={flow.pollRoamingFidoVerification}
      onConfirm={flow.confirmWithdrawal}
      isSubmitting={flow.isWithdrawProcessing}
      isReadyToConfirm={flow.isReadyToConfirm}
      faceQrCodeUrl={flow.faceQrCodeUrl}
      faceQrCodeExpiresAt={flow.faceQrCodeExpiresAt}
      expiresAt={flow.quote?.expiresAt}
      collectedCodes={flow.collectedMultiStep2FACodes}
      mfaVerified={flow.mfaVerified}
    />
  );
}
```

### MultiStep2FAComponent Props

```typescript
interface MultiStep2FAComponentProps {
  steps: MultiStep2FAStep[];
  relation: 'AND' | 'OR';
  onSubmitCode: (stepType: 'GOOGLE' | 'EMAIL' | 'SMS', code: string) => void;
  onPollFaceVerification: () => void;
  onPollRoamingFidoVerification: () => void;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  isReadyToConfirm?: boolean;
  faceQrCodeUrl?: string;
  faceQrCodeExpiresAt?: number;
  expiresAt?: number;
  collectedCodes?: { twofa?: string; emailCode?: string; smsCode?: string };
  mfaVerified?: MfaVerified;
}
```

### Component Responsibilities

1. Render progress indicator (section 9)
2. Render each step based on type (section 5)
3. Manage FACE and ROAMING_FIDO polling lifecycles (section 6)
4. Show confirmation UI when all steps verified (section 8)
5. Display quote expiration countdown if `expiresAt` is provided
