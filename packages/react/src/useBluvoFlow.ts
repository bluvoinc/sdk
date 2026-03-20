"use client";

import type {
	BluvoFlowClientOptions,
	FlowActionType,
	FlowState,
	Machine,
	QuoteRequestOptions,
	ResumeWithdrawalFlowOptions,
	SilentResumeWithdrawalFlowOptions,
	WithdrawalFlowOptions,
} from "@bluvo/sdk-ts";
import { BluvoFlowClient } from "@bluvo/sdk-ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFlowMachine } from "./useFlowMachine";

export interface UseBluvoFlowOptions extends BluvoFlowClientOptions {}

export function useBluvoFlow(options: UseBluvoFlowOptions) {
	const [flowClient] = useState(() => {
		return new BluvoFlowClient(options);
	});
	const [flowMachine, setFlowMachine] = useState<Machine<
		FlowState,
		FlowActionType
	> | null>(null);
	const [exchanges, setExchanges] = useState<
		Array<{
			id: string;
			name: string;
			logoUrl: string;
			status: string;
		}>
	>([]);
	const [exchangesLoading, setExchangesLoading] = useState(false);
	const [exchangesError, setExchangesError] = useState<Error | null>(null);
	const closeOAuthWindowRef = useRef<(() => void) | null>(null);

	const flow = useFlowMachine(flowMachine);

	const startWithdrawalFlow = useCallback(
		async (flowOptions: WithdrawalFlowOptions) => {
			const result = await flowClient.startWithdrawalFlow(flowOptions);
			setFlowMachine(result.machine);
            if(result.closeOAuthWindow) {
                closeOAuthWindowRef.current = result.closeOAuthWindow;
            }
			return result;
		},
		[flowClient],
	);

	const resumeWithdrawalFlow = useCallback(
		async (flowOptions: ResumeWithdrawalFlowOptions) => {
			const result = await flowClient.resumeWithdrawalFlow(flowOptions);
			setFlowMachine(result.machine);
			return result;
		},
		[flowClient],
	);

	const silentResumeWithdrawalFlow = useCallback(
		async (flowOptions: SilentResumeWithdrawalFlowOptions) => {
			const result = await flowClient.silentResumeWithdrawalFlow(flowOptions);
            if(!result) {
                console.error("Error resuming withdrawal flow silently");
                return null;
            }
			setFlowMachine(result.machine);
			return result;
		},
		[flowClient],
	);

	const requestQuote = useCallback(
		async (options: QuoteRequestOptions) => {
			return await flowClient.requestQuote(options);
		},
		[flowClient],
	);

	const executeWithdrawal = useCallback(
		async (quoteId: string) => {
			return await flowClient.executeWithdrawal(quoteId);
		},
		[flowClient],
	);

	const submit2FA = useCallback(
		async (code: string) => {
			return await flowClient.submit2FA(code);
		},
		[flowClient],
	);

	const retryWithdrawal = useCallback(async () => {
		return await flowClient.retryWithdrawal();
	}, [flowClient]);

	const submit2FAMultiStep = useCallback(
		async (stepType: 'GOOGLE' | 'EMAIL' | 'SMS', code: string) => {
			return await flowClient.submit2FAMultiStep(stepType, code);
		},
		[flowClient],
	);

	const pollFaceVerification = useCallback(async () => {
		return await flowClient.pollFaceVerification();
	}, [flowClient]);

	const confirmWithdrawal = useCallback(async () => {
		return await flowClient.confirmWithdrawal();
	}, [flowClient]);

	const listExchanges = useCallback(
		async (status?: "live" | "offline" | "maintenance" | "coming_soon") => {
			setExchangesLoading(true);
			setExchangesError(null);

			try {
				const result = await flowClient.loadExchanges(status);
                if(!result) {
                    console.error("Error loading exchanges");
                    return null;
                }

				// Handle standardized error/success response
				if (!result.success) {
					const errorObj = new Error(result.error || "Failed to load exchanges");
					setExchangesError(errorObj);
					throw errorObj;
				}

				// Use legacy flat field for backwards compatibility
				const exchangesData = result.exchanges || result.result || [];
				setExchanges(exchangesData);
				return exchangesData;
			} catch (error) {
				const errorObj =
					error instanceof Error
						? error
						: new Error("Failed to load exchanges");
				setExchangesError(errorObj);
				throw errorObj;
			} finally {
				setExchangesLoading(false);
			}
		},
		[flowClient],
	);

	const cancel = useCallback(() => {
		flowClient.cancel();
		setFlowMachine(null);
		if (closeOAuthWindowRef.current) {
			closeOAuthWindowRef.current();
			closeOAuthWindowRef.current = null;
		}
	}, [flowClient]);

	const refreshQRCode = useCallback(async () => {
		return await flowClient.refreshQRCode();
	}, [flowClient]);

	// TEST METHOD - For testing withdrawal completion without real transactions
	const testWithdrawalComplete = useCallback(
		(transactionId?: string) => {
			flowClient.testWithdrawalComplete(transactionId);
		},
		[flowClient],
	);

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
		listExchanges,
		startWithdrawalFlow,
		resumeWithdrawalFlow,
		silentResumeWithdrawalFlow, // NEW - backwards compatible
		requestQuote,
		executeWithdrawal,
		submit2FA,
		submit2FAMultiStep, // Multi-step 2FA action
		pollFaceVerification, // Multi-step 2FA FACE polling action
		confirmWithdrawal, // Multi-step 2FA confirmation action (after all steps verified)
		retryWithdrawal,
		cancel,
		refreshQRCode, // QR Code flow action
		testWithdrawalComplete, // TEST METHOD

		// === General Flow State ===
		isIdle: flow.state?.type === "idle",
		isFlowCancelled: flow.state?.type === "flow:cancelled",

		// === Exchanges State ===
		isExchangesLoading:
			exchangesLoading || flow.state?.type === "exchanges:loading",
		isExchangesReady:
			flow.state?.type === "exchanges:ready" || exchanges.length > 0,
		isExchangesError: flow.state?.type === "exchanges:error",
		exchangesError:
			exchangesError ||
			(flow.state?.type === "exchanges:error" ? flow.error || null : null),

		// === OAuth State ===
		isOAuthPending:
			flow.state?.type === "oauth:waiting" ||
			flow.state?.type === "oauth:processing",
		isOAuthWaiting: flow.state?.type === "oauth:waiting",
		isOAuthProcessing: flow.state?.type === "oauth:processing",
		isOAuthError:
			flow.state?.type === "oauth:error" || flow.state?.type === "oauth:fatal",
		isOAuthFatal: flow.state?.type === "oauth:fatal",
		isWalletConnectionInvalid: flow.state?.type === "oauth:fatal" || flow.state?.type === "qrcode:fatal",
		isOAuthComplete: flow.state?.type === "oauth:completed",
		isOAuthWindowBeenClosedByTheUser:
			flow.state?.type === "oauth:window_closed_by_user",

		// === QR Code State ===
		isQRCodePending:
			flow.state?.type?.startsWith("qrcode:") &&
			!["qrcode:error", "qrcode:fatal", "qrcode:timeout"].includes(flow.state?.type || ""),
		isQRCodeWaiting: flow.state?.type === "qrcode:waiting",
		isQRCodeDisplaying: flow.state?.type === "qrcode:displaying",
		isQRCodeScanning: flow.state?.type === "qrcode:scanning",
		isQRCodeError:
			flow.state?.type === "qrcode:error" || flow.state?.type === "qrcode:fatal",
		isQRCodeFatal: flow.state?.type === "qrcode:fatal",
		isQRCodeTimeout: flow.state?.type === "qrcode:timeout",
		qrCodeUrl: flow.context?.qrCodeUrl,
		qrCodeExpiresAt: flow.context?.qrCodeExpiresAt,
		qrCodeStatus: flow.context?.qrCodeStatus,
		isQRCodeFlow: flow.context?.isQRCodeFlow || false,

		// === Wallet State ===
		isWalletLoading: flow.state?.type === "wallet:loading",
		isWalletError: flow.state?.type === "wallet:error",
		isWalletReady: flow.state?.type === "wallet:ready",

		// === Quote State ===
		isQuoteLoading: flow.state?.type === "quote:requesting",
		isQuoteReady: flow.state?.type === "quote:ready",
		isQuoteExpired: flow.state?.type === "quote:expired",
		isQuoteError: flow.state?.type === "quote:error",

		// === Withdrawal State ===
		isWithdrawing:
			(flow.state?.type?.startsWith("withdraw:") &&
				flow.state?.type !== "withdraw:completed" &&
				flow.state?.type !== "withdraw:fatal" &&
				!flow.state?.type?.startsWith("withdraw:error")) ||
			false,
		isWithdrawProcessing: flow.state?.type === "withdraw:processing",
		isWithdrawalComplete: flow.state?.type === "withdraw:completed",
		isWithdrawBlocked: flow.state?.type === "withdraw:blocked",
		hasFatalError: flow.state?.type === "withdraw:fatal",

		// === Withdrawal Requirements & Errors ===
		requires2FA: flow.state?.type === "withdraw:error2FA",
		requires2FAMultiStep: flow.state?.type === "withdraw:error2FAMultiStep",
		isReadyToConfirm: flow.state?.type === "withdraw:readyToConfirm",
		requiresSMS: flow.state?.type === "withdraw:errorSMS",
		requiresKYC: flow.state?.type === "withdraw:errorKYC",
		requiresValid2FAMethod:
			(flow.state?.type === "withdraw:fatal" &&
				!!flow.context?.errorDetails?.valid2FAMethods) ||
			false,
		requiresEmailVerification:
			(flow.state?.type === "withdraw:fatal" &&
				flow.error?.message?.includes("email")) ||
			false,
		hasInsufficientBalance: flow.state?.type === "withdraw:errorBalance",
		canRetry: flow.state?.type === "withdraw:retrying",

		// === Error Detection Helpers ===
		hasAmountError:
			((flow.state?.type === "quote:error" ||
				flow.state?.type === "withdraw:fatal") &&
				(flow.error?.message?.toLowerCase().includes("amount") ||
					flow.error?.message?.includes("minimum") ||
					flow.error?.message?.includes("maximum"))) ||
			false,
		hasAddressError:
			((flow.state?.type === "quote:error" ||
				flow.state?.type === "withdraw:fatal") &&
				(flow.error?.message?.toLowerCase().includes("address") ||
					flow.error?.message
						?.toLowerCase()
						.includes("invalid destination"))) ||
			false,
		hasNetworkError:
			((flow.state?.type === "quote:error" ||
				flow.state?.type === "withdraw:fatal") &&
				flow.error?.message?.toLowerCase().includes("network")) ||
			false,
		hasWalletNotFoundError:
			(flow.state?.type === "wallet:error" &&
				flow.error?.message?.toLowerCase().includes("not found")) ||
			false,
		hasInvalidCredentialsError:
			(flow.state?.type === "wallet:error" &&
				flow.error?.message?.toLowerCase().includes("invalid") &&
				flow.error?.message?.toLowerCase().includes("credential")) ||
			false,

		// === Context Data ===
		invalid2FAAttempts: flow.context?.invalid2FAAttempts || 0,
		retryAttempts: flow.context?.retryAttempts || 0,
		maxRetryAttempts: flow.context?.maxRetryAttempts || 3,

		// Data
		exchanges: flow.context?.exchanges || exchanges,
		walletBalances: flow.context?.walletBalances || [],
		quote: flow.context?.quote,
		withdrawal: flow.context?.withdrawal,
		valid2FAMethods: flow.context?.errorDetails?.valid2FAMethods,

		// === Multi-step 2FA Context ===
		multiStep2FA: flow.context?.multiStep2FA,
		multiStep2FASteps: flow.context?.multiStep2FA?.steps || [],
		multiStep2FABizNo: flow.context?.multiStep2FA?.bizNo,
		multiStep2FARelation: flow.context?.multiStep2FA?.relation,
		collectedMultiStep2FACodes: flow.context?.multiStep2FA?.collectedCodes,

		// Multi-step 2FA step type helpers
		hasGoogleStep: flow.context?.multiStep2FA?.steps?.some(s => s.type === 'GOOGLE') || false,
		hasEmailStep: flow.context?.multiStep2FA?.steps?.some(s => s.type === 'EMAIL') || false,
		hasFaceStep: flow.context?.multiStep2FA?.steps?.some(s => s.type === 'FACE') || false,
		hasSmsStep: flow.context?.multiStep2FA?.steps?.some(s => s.type === 'SMS') || false,

		// Multi-step 2FA step status helpers (using mfa.verified as PRIMARY source of truth)
		isGoogleStepVerified: flow.context?.multiStep2FA?.mfa?.verified?.GOOGLE === true ||
			flow.context?.multiStep2FA?.steps?.find(s => s.type === 'GOOGLE')?.status === 'success',
		isEmailStepVerified: flow.context?.multiStep2FA?.mfa?.verified?.EMAIL === true ||
			flow.context?.multiStep2FA?.steps?.find(s => s.type === 'EMAIL')?.status === 'success',
		isFaceStepVerified: flow.context?.multiStep2FA?.mfa?.verified?.FACE === true ||
			flow.context?.multiStep2FA?.steps?.find(s => s.type === 'FACE')?.status === 'success',
		isSmsStepVerified: flow.context?.multiStep2FA?.mfa?.verified?.SMS === true ||
			flow.context?.multiStep2FA?.steps?.find(s => s.type === 'SMS')?.status === 'success',

		// MFA verified object (PRIMARY source of truth for verification status)
		mfaVerified: flow.context?.multiStep2FA?.mfa?.verified,

		// Computed: all required steps verified (using mfa.verified as PRIMARY)
		allMultiStep2FAStepsVerified: (() => {
			const multiStep2FA = flow.context?.multiStep2FA;
			if (!multiStep2FA?.steps) return false;

			const requiredSteps = multiStep2FA.steps.filter(s => s.required);
			if (requiredSteps.length === 0) return false;

			const mfaVerified = multiStep2FA.mfa?.verified;

			// Check using mfa.verified as PRIMARY source
			if (mfaVerified) {
				return requiredSteps.every(step => mfaVerified[step.type] === true);
			}

			// Fallback to step status if no mfa object
			return requiredSteps.every(step => step.status === 'success');
		})(),

		// Multi-step 2FA FACE step QR code
		faceQrCodeUrl: flow.context?.multiStep2FA?.faceQrCodeUrl,
		faceQrCodeExpiresAt: flow.context?.multiStep2FA?.faceQrCodeExpiresAt,

		// Client instance (for advanced use)
		client: flowClient,
	};
}

// Dynamically inferred type that automatically stays in sync with the hook's return value
export type UseBluvoFlowHook = ReturnType<typeof useBluvoFlow>;
