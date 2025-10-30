import type {
	Oauth2ExchangeslistexchangesResponses,
} from "../../generated";
import type { BluvoClient } from "../BluvoClient";
import { BluvoWebClient } from "../BluvoWebClient";
import {
	ERROR_CODES,
	extractErrorCode,
	extractErrorResult,
	WITHDRAWAL_EXECUTION_ERROR_TYPES,
	WITHDRAWAL_QUOTATION_ERROR_TYPES,
} from "../error-codes";
import type { FlowActionType, FlowState } from "../types/flow.types";
import type { Machine } from "../types/machine.types";
import type { Subscription } from "../WebSocketClient";
import {
	type WithdrawFundsWorkflowMessageBody,
	type WorkflowMessageBody,
	WorkflowTypes,
} from "../WorkflowTypes";
import { createFlowMachine } from "./flowMachine";

export interface BluvoFlowClientOptions {
	orgId: string;
	projectId: string;
	listExchangesFn: BluvoClient["oauth2"]["listExchanges"];
	fetchWithdrawableBalanceFn: BluvoClient["wallet"]["withdrawals"]["getWithdrawableBalance"];
	requestQuotationFn: BluvoClient["wallet"]["withdrawals"]["requestQuotation"];
	executeWithdrawalFn: BluvoClient["wallet"]["withdrawals"]["executeWithdrawal"];
	getWalletByIdFn: BluvoClient["wallet"]["get"];
	pingWalletByIdFn: BluvoClient["wallet"]["ping"];
	mkUUIDFn?: () => string;
	onWalletConnectedFn?: (walletId: string, exchange: string) => any;

	options?: {
		sandbox?: boolean;
		dev?: boolean;
		maxRetryAttempts?: number;
		autoRefreshQuotation?: boolean;
		customDomain?:
			| string
			| "api-bluvo.com"
			| {
					api: string;
					ws: string;
			  };
	};
}

export interface WithdrawalFlowOptions {
	exchange: string;
	walletId: string;
	popupOptions?: {
		title?: string;
		width?: number;
		height?: number;
		left?: number;
		top?: number;
	};
}

export interface ResumeWithdrawalFlowOptions {
	exchange: string;
	walletId: string;
}

/**
 * Options for silently resuming a withdrawal flow with preloaded balance data
 *
 * This interface allows you to resume a withdrawal flow for a wallet that
 * has already been previewed, jumping directly to the wallet:ready state
 * without requiring OAuth or re-fetching balance data.
 */
export interface SilentResumeWithdrawalFlowOptions {
	/** Wallet ID to resume */
	walletId: string;

	/** Exchange this wallet is connected to */
	exchange: string;

	/** Pre-loaded balance data (if available from preview) */
	preloadedBalances?: Array<{
		asset: string;
		balance: string;
		balanceInFiat?: string;
		networks?: Array<{
			id: string;
			name: string;
			displayName: string;
			minWithdrawal: string;
			maxWithdrawal?: string;
			assetName: string;
			addressRegex?: string;
		}>;
		extra?: {
			slug?: string;
			assetId?: string;
		};
	}>;

	/** Called when wallet is not found */
	onWalletNotFound?: (walletId: string) => void;

	/** Called when wallet has invalid API credentials */
	onWalletInvalidApiCredentials?: (walletId: string) => void;

	/** Called when wallet balance is loaded */
	onWalletBalance?: (walletId: string, balances: any[]) => void;
}

export interface QuoteRequestOptions {
	asset: string;
	amount: string;
	destinationAddress: string;
	network?: string;
	tag?: string;
	includeFee?: boolean;
}

export class BluvoFlowClient {
	private webClient: BluvoWebClient;
	private flowMachine?: Machine<FlowState, FlowActionType>;
	private subscription?: Subscription;
	private generateId: () => string;
	private quoteRefreshTimer?: ReturnType<typeof setTimeout>;

	constructor(private options: BluvoFlowClientOptions) {
		this.webClient = BluvoWebClient.createClient({
			orgId: options.orgId,
			projectId: options.projectId,
			sandbox: options.options?.sandbox,
			dev: options.options?.dev,
			customDomain: options.options?.customDomain,
		});

		this.generateId = options.mkUUIDFn || (() => crypto.randomUUID());
	}

	async loadExchanges(
		status?: Oauth2ExchangeslistexchangesResponses["200"]["exchanges"][number]["status"],
	) {
		if (!this.flowMachine) {
			// Create flow machine if it doesn't exist
			this.flowMachine = createFlowMachine({
				orgId: this.options.orgId,
				projectId: this.options.projectId,
				maxRetryAttempts: this.options.options?.maxRetryAttempts,
				autoRefreshQuotation: this.options.options?.autoRefreshQuotation,
			});
		}

		this.flowMachine.send({ type: "LOAD_EXCHANGES" });

		// Note: listExchangesFn returns the exchanges array directly, not {data, error, success}
		const exchanges = await this.options.listExchangesFn(status);

		if (!exchanges || !Array.isArray(exchanges)) {
			const error = new Error("Failed to load exchanges");
			this.flowMachine.send({
				type: "EXCHANGES_FAILED",
				error,
			});
			throw error;
		}

		this.flowMachine.send({
			type: "EXCHANGES_LOADED",
			exchanges,
		});
		return exchanges;
	}

	async startWithdrawalFlow(flowOptions: WithdrawalFlowOptions) {
		// Check if wallet already exists
		const { data, error, success } = await this.options.getWalletByIdFn(flowOptions.walletId);

		if (success && data?.exchange) {
			// Wallet exists, redirect to resumeWithdrawalFlow
			return this.resumeWithdrawalFlow({
				exchange: data.exchange,
				walletId: flowOptions.walletId,
			});
		}

		// If wallet doesn't exist or check failed, continue with normal OAuth flow
		if (!success) {
			console.warn("Error checking wallet existence:", (error as any)?.error || (error as any)?.message || "Unknown error");
		}

		// Dispose any existing flow
		this.dispose();

		// Create new flow machine
		this.flowMachine = createFlowMachine({
			orgId: this.options.orgId,
			projectId: this.options.projectId,
			maxRetryAttempts: this.options.options?.maxRetryAttempts,
			autoRefreshQuotation: this.options.options?.autoRefreshQuotation,
		});

		// Generate idempotency key for OAuth flow
		const idem = this.generateId();

		// Start OAuth flow
		this.flowMachine.send({
			type: "START_OAUTH",
			exchange: flowOptions.exchange,
			walletId: flowOptions.walletId,
			idem,
		});

		// Subscribe to workflow messages
		this.subscription = await this.webClient.listen(idem, {
			onOAuth2Complete: (message) => {
				this.flowMachine?.send({
					type: "OAUTH_COMPLETED",
					walletId: message.walletId,
					exchange: message.exchange,
				});

				// Call the onWalletConnected hook if provided
				if (this.options.onWalletConnectedFn) {
					this.options.onWalletConnectedFn(message.walletId, message.exchange);
				}

				// Auto-proceed to wallet loading
				this.loadWallet(message.walletId);
			},
			onError: (error) => {
				// Extract error code to check for specific OAuth errors
				const errorCode = extractErrorCode(error);

				// Convert error to Error instance with appropriate message
				let errorInstance: Error;
				if (error instanceof Error) {
					errorInstance = error;
				} else {
					const errorMessage =
						error && typeof error === "object" && "message" in error
							? String((error as any).message)
							: "OAuth authentication failed";
					errorInstance = new Error(errorMessage);
				}

				// Handle OAuth-specific errors
				if (
					errorCode === ERROR_CODES.OAUTH_TOKEN_EXCHANGE_FAILED ||
					errorCode === ERROR_CODES.OAUTH_AUTHORIZATION_FAILED ||
					errorCode === ERROR_CODES.OAUTH_INVALID_STATE
				) {
					this.flowMachine?.send({
						type: "OAUTH_FAILED",
						error: errorInstance,
					});
				} else {
					// For any other error during OAuth, also send OAUTH_FAILED
					this.flowMachine?.send({
						type: "OAUTH_FAILED",
						error: errorInstance,
					});
				}
			},
		});

		// Open OAuth window
		const closeWindow = await this.webClient.oauth2.openWindow(
			flowOptions.exchange as "coinbase",
			{
				walletId: flowOptions.walletId,
				idem,
			},
			{
				onWindowClose: () => {
					// const state = this.flowMachine?.getState();
					// if (state?.type === 'oauth:processing') {
					//     this.flowMachine?.send({
					//         type: 'OAUTH_WINDOW_CLOSED_BY_USER',
					//         error: new Error('OAuth window closed by user')
					//     });
					// }
				},
			},
			flowOptions.popupOptions,
		);

		this.flowMachine.send({ type: "OAUTH_WINDOW_OPENED" });

		return {
			machine: this.flowMachine,
			closeOAuthWindow: closeWindow,
		};
	}

	async resumeWithdrawalFlow(flowOptions: ResumeWithdrawalFlowOptions) {
		// Dispose any existing flow
		this.dispose();

		// Create new flow machine
		this.flowMachine = createFlowMachine({
			orgId: this.options.orgId,
			projectId: this.options.projectId,
			maxRetryAttempts: this.options.options?.maxRetryAttempts,
			autoRefreshQuotation: this.options.options?.autoRefreshQuotation,
		});

		// We need to transition through the states properly
		// First, start OAuth flow to set up context
		this.flowMachine.send({
			type: "START_OAUTH",
			exchange: flowOptions.exchange,
			walletId: flowOptions.walletId,
			idem: this.generateId(),
		});

		// Then mark OAuth as completed
		this.flowMachine.send({
			type: "OAUTH_WINDOW_OPENED",
		});

		// Complete OAuth
		this.flowMachine.send({
			type: "OAUTH_COMPLETED",
			walletId: flowOptions.walletId,
			exchange: flowOptions.exchange,
		});

		// Call the onWalletConnected hook if provided
		if (this.options.onWalletConnectedFn) {
			this.options.onWalletConnectedFn(
				flowOptions.walletId,
				flowOptions.exchange,
			);
		}

		// Load wallet immediately
		this.loadWallet(flowOptions.walletId);

		return {
			machine: this.flowMachine,
		};
	}

	/**
	 * Silently resume a withdrawal flow with optional preloaded balance data
	 *
	 * This method allows you to resume a withdrawal flow for a wallet that has already
	 * been previewed, jumping directly to the wallet:ready state. If balance data is
	 * preloaded (from a preview), it will be used directly. Otherwise, the method will
	 * ping the wallet and fetch the balance data.
	 *
	 * This is useful for scenarios where users select a wallet from a preview list and
	 * want to continue directly to the withdrawal interface without re-authenticating.
	 *
	 * @param options Configuration for silent resume
	 * @returns Object containing the flow machine instance
	 */
	async silentResumeWithdrawalFlow(options: SilentResumeWithdrawalFlowOptions) {
		// Dispose any existing flow
		this.dispose();

		// Create new flow machine
		this.flowMachine = createFlowMachine({
			orgId: this.options.orgId,
			projectId: this.options.projectId,
			maxRetryAttempts: this.options.options?.maxRetryAttempts,
			autoRefreshQuotation: this.options.options?.autoRefreshQuotation,
		});

		let balances = options.preloadedBalances;

		// If no preloaded balances, fetch them
		if (!balances) {
			// Step 1: Ping wallet to validate
			const {
				data: pingResult,
				error: pingError,
				success: pingSuccess
			} = await this.options.pingWalletByIdFn(
				options.walletId,
			);

			// Check for invalid credentials
			if (!pingSuccess) {
				const errorCode = extractErrorCode(pingError);
				if (errorCode === ERROR_CODES.WALLET_NOT_FOUND) {
					options.onWalletNotFound?.(options.walletId);
				}
				throw new Error((pingError as any)?.error || (pingError as any)?.message || "Failed to ping wallet");
			}

			if (pingResult?.status === "INVALID_API_CREDENTIALS") {
				options.onWalletInvalidApiCredentials?.(options.walletId);
				throw new Error("Invalid API credentials");
			}

			// Step 2: Fetch withdrawable balance
			const {
				data: balanceResponse,
				error: balanceError,
				success: balanceSuccess,
			} = await this.options.fetchWithdrawableBalanceFn(
				options.walletId,
			);

			if (!balanceSuccess) {
				const errorCode = extractErrorCode(balanceError);
				if (errorCode === ERROR_CODES.WALLET_NOT_FOUND) {
					options.onWalletNotFound?.(options.walletId);
				}
				throw new Error((balanceError as any)?.error || (balanceError as any)?.message || "Failed to fetch withdrawable balance");
			}

			// Transform to expected format
			balances = balanceResponse?.balances.map((b) => ({
				asset: b.asset,
				balance: String(b.amount),
				networks: b.networks.map((n) => ({
					id: n.id,
					name: n.name,
					displayName: n.displayName,
					minWithdrawal: n.minWithdrawal,
					maxWithdrawal: n.maxWithdrawal,
					assetName: n.assetName,
					...(n.addressRegex !== null && n.addressRegex !== undefined
						? { addressRegex: n.addressRegex }
						: {}),
				})),
				...(b.amountInFiat !== undefined
					? { balanceInFiat: String(b.amountInFiat) }
					: {}),
				...(b.extra !== undefined ? { extra: b.extra } : {}),
			})) ?? [];

			// Call success callback
			options.onWalletBalance?.(options.walletId, balances);
		}

		// Transition through states to reach wallet:ready
		// This ensures the state machine is in the correct state

		// 1. Start OAuth (to set up context)
		this.flowMachine.send({
			type: "START_OAUTH",
			exchange: options.exchange,
			walletId: options.walletId,
			idem: this.generateId(),
		});

		// 2. Mark OAuth window as opened
		this.flowMachine.send({
			type: "OAUTH_WINDOW_OPENED",
		});

		// 3. Complete OAuth
		this.flowMachine.send({
			type: "OAUTH_COMPLETED",
			walletId: options.walletId,
			exchange: options.exchange,
		});

		// 4. Load wallet (transition to wallet:loading)
		this.flowMachine.send({
			type: "LOAD_WALLET",
		});

		// 5. Set wallet as loaded with preloaded/fetched balances (transition to wallet:ready)
		this.flowMachine.send({
			type: "WALLET_LOADED",
			balances: balances as any, // Type assertion to satisfy TypeScript
		});

		return {
			machine: this.flowMachine,
		};
	}

	private async loadWallet(walletId: string) {
		if (!this.flowMachine) {
			return;
		}

		this.flowMachine.send({ type: "LOAD_WALLET" });

		const { data: withdrawableBalanceInfo, error, success } = await this.options
			.fetchWithdrawableBalanceFn(walletId);

		if (!success) {
			this.flowMachine.send({
				type: "WALLET_FAILED",
				error: error instanceof Error ? error : new Error((error as any)?.error || (error as any)?.message || "Failed to load wallet"),
			});
			return;
		}

		if (!withdrawableBalanceInfo?.balances) {
			this.flowMachine.send({
				type: "WALLET_FAILED",
				error: new Error("No balance data returned"),
			});
			return;
		}

		this.flowMachine.send({
			type: "WALLET_LOADED",
			balances: withdrawableBalanceInfo.balances.map(
				(b: any) => ({
					asset: b.asset,
					balance: String(b.amount),
					networks: b.networks.map((n: any) => ({
						id: n.id,
						name: n.name,
						displayName: n.displayName,
						minWithdrawal: n.minWithdrawal,
						maxWithdrawal: n.maxWithdrawal,
						assetName: n.assetName,
						// Only include optional fields if they have meaningful values (not null or undefined)
						...(n.addressRegex !== null && n.addressRegex !== undefined
							? { addressRegex: n.addressRegex }
							: {}),
						...(n.chainId !== null && n.chainId !== undefined
							? { chainId: n.chainId }
							: {}),
						...(n.tokenAddress !== null && n.tokenAddress !== undefined
							? { tokenAddress: n.tokenAddress }
							: {}),
						...(n.contractAddress !== null && n.contractAddress !== undefined
							? { contractAddress: n.contractAddress }
							: {}),
						// contractAddressVerified defaults to true if null or undefined
						contractAddressVerified: n.contractAddressVerified ?? true,
					})),

					// if amountInFiat is present (including 0), include balanceInFiat
					...(b.amountInFiat !== undefined
						? {
								balanceInFiat: String(b.amountInFiat),
							}
						: {}),

					// if extra is present, include it as is
					...(b.extra !== undefined
						? {
								extra: b.extra,
							}
						: {}),
				}),
			),
		});
	}

	async requestQuote(options: QuoteRequestOptions) {
		if (!this.flowMachine) {
			return undefined;
		}

		const state = this.flowMachine.getState();
		if (!state.context.walletId) {
			return undefined;
		}

		console.log(
			"[SDK] requestQuote called, current state:",
			state.type,
			"amount:",
			options.amount,
		);

		this.flowMachine.send({
			type: "REQUEST_QUOTE",
			asset: options.asset,
			amount: options.amount,
			destinationAddress: options.destinationAddress,
			network: options.network,
		});

		console.log("[SDK] REQUEST_QUOTE action sent to state machine");

		const {
			data: quote,
			error,
			success
		} = await this.options.requestQuotationFn(
			state.context.walletId,
			{
				asset: options.asset,
				amount: options.amount,
				address: options.destinationAddress,
				network: options.network,
				tag: options.tag,
				includeFee: options.includeFee ?? true,
			},
		);

		if (!success) {
			// Extract error code from the error object
			const errorCode = extractErrorCode(error);
			let flowError: Error;

			if (errorCode) {
				switch (errorCode) {
					case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
					case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE:
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE_CANNOT_COVER_FEE: // Legacy compatibility
						flowError = new Error("Insufficient balance");
						break;
					case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM: // Legacy compatibility
						flowError = new Error("Amount below minimum");
						break;
					case ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM:
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_ABOVE_MAXIMUM: // Legacy compatibility
						flowError = new Error("Amount above maximum");
						break;
					case ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS:
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.INVALID_ADDRESS: // Legacy compatibility
						flowError = new Error("Invalid destination address");
						break;
					case ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED:
					case WITHDRAWAL_QUOTATION_ERROR_TYPES.NETWORK_NOT_SUPPORTED: // Legacy compatibility
						flowError = new Error("Network not supported");
						break;
					default:
						flowError = error instanceof Error ? error : new Error((error as any)?.error || (error as any)?.message || "Failed to get quote");
				}
			} else {
				flowError = error instanceof Error ? error : new Error((error as any)?.error || (error as any)?.message || "Failed to get quote");
			}

			this.flowMachine.send({
				type: "QUOTE_FAILED",
				error: flowError,
			});
			return;
		}

		if (!quote) {
			this.flowMachine.send({
				type: "QUOTE_FAILED",
				error: new Error("No quote returned from backend"),
			});
			return;
		}

		console.log(
			"[SDK] Backend returned quote with ID:",
			quote.id,
			"ExpiresAt:",
			quote.expiresAt,
		);

		const quoteData = {
			id: quote.id,
			asset: quote.asset,
			amount: String(quote.amountNoFee),
			estimatedFee: String(quote.estimatedFee),
			estimatedTotal: String(quote.estimatedTotal),

			amountWithFeeInFiat: String(quote.amountWithFeeInFiat),
			amountNoFeeInFiat: String(quote.amountNoFeeInFiat),
			estimatedFeeInFiat: String(quote.estimatedFeeInFiat),

			additionalInfo: quote.additionalInfo,

			expiresAt: new Date(quote.expiresAt).getTime(),
		};

		console.log(
			"[SDK] Sending QUOTE_RECEIVED action with new quote ID:",
			quoteData.id,
			"ExpiresAt:",
			new Date(quoteData.expiresAt).toLocaleTimeString(),
		);

		this.flowMachine.send({
			type: "QUOTE_RECEIVED",
			quote: quoteData,
		});

		// Clear any existing quote refresh timer
		if (this.quoteRefreshTimer) {
			clearTimeout(this.quoteRefreshTimer);
		}

		// Set up quote expiration timer
		const expiresIn = new Date(quote.expiresAt).getTime() - Date.now();
		if (expiresIn > 0) {
			this.quoteRefreshTimer = setTimeout(() => {
				const currentState = this.flowMachine?.getState();
				if (
					currentState?.type === "quote:ready" &&
					currentState.context.quote?.id === quote.id
				) {
					// Check if auto-refresh is enabled
					const autoRefresh =
						currentState.context.autoRefreshQuotation !== undefined
							? currentState.context.autoRefreshQuotation
							: true; // Default to true

					if (autoRefresh && currentState.context.lastQuoteRequest) {
						// Auto-refresh the quote
						console.log("[SDK] Quote expired, auto-refreshing...");
						this.requestQuote(currentState.context.lastQuoteRequest);
					} else {
						// No auto-refresh, transition to expired state
						console.log(
							"[SDK] Quote expired, transitioning to expired state",
						);
						this.flowMachine?.send({ type: "QUOTE_EXPIRED" });
					}
				}
			}, expiresIn);
		}

		// return the quote
		return {
			rawQuote: quote,
			quoteData,
		};
	}

	async executeWithdrawal(quoteId: string) {
		if (!this.flowMachine) return;

		const state = this.flowMachine.getState();
		if (!state.context.walletId || state.type !== "quote:ready") return;

		// Start withdrawal process
		this.flowMachine.send({
			type: "START_WITHDRAWAL",
			quoteId,
		});

		if (this.subscription) {
			await this.webClient.unsubscribe(this.subscription.topicName);
		}

		this.subscription = await this.webClient.listen(quoteId, {
			onWithdrawComplete: (message: any) => {
				console.log("onWithdrawComplete received:", message);

				// {
				//     "type": "withdraw",
				//     "success": true,
				//     "walletId": "a57f3fd3-0660-438c-8e4d-e781b414acfa",
				//     "step": "complete",
				//     "stepIndex": 4,
				//     "totalSteps": 4
				// }

				if (message.success && message.type === WorkflowTypes.WithdrawFunds) {
					console.log(
						"Withdrawal completed successfully, transitioning state machine",
					);
					console.log(
						"Current flow machine state before completion:",
						this.flowMachine?.getState()?.type,
					);

					// First, send success to update the withdrawal machine state
					this.flowMachine?.send({
						type: "WITHDRAWAL_SUCCESS",
						transactionId:
							message.transactionId || message.walletId || "completed",
					});

					// Then send completion action
					this.flowMachine?.send({
						type: "WITHDRAWAL_COMPLETED",
						transactionId:
							message.transactionId || message.walletId || "completed",
					});

					// Log current state after sending actions
					const currentState = this.flowMachine?.getState();
					console.log(
						"Flow machine state after completion actions:",
						currentState?.type,
					);
				}
			},
			onStep: (message: WorkflowMessageBody) => {
				if (message.type === WorkflowTypes.WithdrawFunds) {
					const withdrawMessage = message as WithdrawFundsWorkflowMessageBody;
					this.flowMachine?.send({
						type: "WITHDRAWAL_PROGRESS",
						message: withdrawMessage.step,
					});
				}
			},
			// on error should check if the error is recoverable (i.e. requires 2FA, SMS, KYC, etc)
			onError: (error) => {
				// Extract error code from new format or legacy format
				const errorCode = extractErrorCode(error);

				// Handle new error codes
				switch (errorCode) {
					case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
						this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_2FA" });
						return;

					case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
						this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_SMS" });
						return;

					case ERROR_CODES.WITHDRAWAL_2FA_INVALID:
						this.flowMachine?.send({ type: "WITHDRAWAL_2FA_INVALID" });
						return;

					case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
						this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_KYC" });
						return;

					case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
						this.flowMachine?.send({ type: "WITHDRAWAL_INSUFFICIENT_BALANCE" });
						return;

					case ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS:
						this.flowMachine?.send({
							type: "WITHDRAWAL_FATAL",
							error: new Error("Invalid destination address"),
						});
						return;

					case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
						this.flowMachine?.send({
							type: "WITHDRAWAL_FATAL",
							error: new Error("Amount below minimum"),
						});
						return;

					case ERROR_CODES.QUOTE_EXPIRED:
						this.flowMachine?.send({ type: "QUOTE_EXPIRED" });
						return;

					case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
						this.flowMachine?.send({
							type: "WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED",
							result: extractErrorResult(error),
						});
						return;
				}

				console.error("Unhandled withdrawal error", error);

				// Send WITHDRAWAL_FATAL to trigger the fatal state transition
				this.flowMachine?.send({
					type: "WITHDRAWAL_FATAL",
					error: error,
				});
			},
		});

		// Execute withdrawal
		const { data: res, error, success } = await this.options.executeWithdrawalFn(
			state.context.walletId,
			quoteId,
			quoteId,
			{},
		);

		if (!success) {
			// IMMEDIATE ERROR HANDLING (i.e. wrong schema type, network error, etc)
			console.error("executeWithdrawal error", error);

			// Extract error code from the error object
			const errorCode = extractErrorCode(error);

			switch (errorCode) {
				case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
				case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED: // Legacy compatibility
					this.flowMachine.send({ type: "WITHDRAWAL_REQUIRES_2FA" });
					break;
				case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
				case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED: // Legacy compatibility
					this.flowMachine.send({ type: "WITHDRAWAL_REQUIRES_SMS" });
					break;
				case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
				case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED: // Legacy compatibility
					this.flowMachine.send({ type: "WITHDRAWAL_REQUIRES_KYC" });
					break;
				case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
				case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
					this.flowMachine.send({ type: "WITHDRAWAL_INSUFFICIENT_BALANCE" });
					break;
				case ERROR_CODES.QUOTE_EXPIRED:
				case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED: // Legacy compatibility
					this.flowMachine.send({ type: "QUOTE_EXPIRED" });
					break;
				case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
					this.flowMachine.send({
						type: "WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED",
						result: extractErrorResult(error),
					});
					break;
				default:
					this.flowMachine.send({
						type: "WITHDRAWAL_FATAL",
						error:
							error instanceof Error
								? error
								: new Error((error as any)?.error || (error as any)?.message || "Failed to execute withdrawal"),
					});
			}
			return;
		}

		// Withdrawal is in progress, will be handled by WebSocket callbacks
		return res;
	}

	async submit2FA(code: string) {
		if (!this.flowMachine) return;

		const state = this.flowMachine.getState();
		if (state.type !== "withdraw:error2FA") return;

		this.flowMachine.send({
			type: "SUBMIT_2FA",
			code,
		});

		// Re-execute withdrawal with 2FA code
		const quote = state.context.quote;
		if (quote && state.context.walletId) {
			const idem = this.generateId();

			const { data: res, error, success } = await this.options.executeWithdrawalFn(
				state.context.walletId,
				idem,
				quote.id,
				{ twofa: code },
			);

			if (!success) {
				// Handle errors same as in executeWithdrawal
				this.handleWithdrawalError(error);
				return;
			}

			// Withdrawal is in progress, will be handled by WebSocket callbacks
			return res;
		}
	}

	async submitSMS(code: string) {
		if (!this.flowMachine) return;

		const state = this.flowMachine.getState();
		if (state.type !== "withdraw:errorSMS") return;

		this.flowMachine.send({
			type: "SUBMIT_SMS",
			code,
		});

		// Re-execute withdrawal with SMS code
		const quote = state.context.quote;
		if (quote && state.context.walletId) {
			const idem = this.generateId();

			const { data: res, error, success } = await this.options.executeWithdrawalFn(
				state.context.walletId,
				idem,
				quote.id,
				{},
			);

			if (!success) {
				this.handleWithdrawalError(error);
				return;
			}

			// Withdrawal is in progress, will be handled by WebSocket callbacks
			return res;
		}
	}

	async retryWithdrawal() {
		if (!this.flowMachine) return;

		const state = this.flowMachine.getState();
		if (state.type !== "withdraw:retrying") return;

		this.flowMachine.send({ type: "RETRY_WITHDRAWAL" });

		// Re-execute withdrawal with new idempotency key
		const quote = state.context.quote;
		if (quote) {
			return await this.executeWithdrawal(quote.id);
		}
	}

	private handleWithdrawalError(error: any) {
		// Extract error code from the error object
		const errorCode = extractErrorCode(error);

		switch (errorCode) {
			case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
			case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED: // Legacy compatibility
				this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_2FA" });
				break;
			case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
			case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED: // Legacy compatibility
				this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_SMS" });
				break;
			case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
			case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED: // Legacy compatibility
				this.flowMachine?.send({ type: "WITHDRAWAL_REQUIRES_KYC" });
				break;
			case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
			case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
				this.flowMachine?.send({ type: "WITHDRAWAL_INSUFFICIENT_BALANCE" });
				break;
			case ERROR_CODES.QUOTE_EXPIRED:
			case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED: // Legacy compatibility
				this.flowMachine?.send({ type: "QUOTE_EXPIRED" });
				break;
			case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
				this.flowMachine?.send({
					type: "WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED",
					result: extractErrorResult(error),
				});
				break;
			default:
				this.flowMachine?.send({
					type: "WITHDRAWAL_FATAL",
					error:
						error instanceof Error
							? error
							: new Error((error as any)?.error || (error as any)?.message || "Failed to execute withdrawal"),
				});
		}
	}

	getState() {
		return this.flowMachine?.getState();
	}

	subscribe(listener: (state: FlowState) => void) {
		return this.flowMachine?.subscribe(listener) || (() => {});
	}

	cancel() {
		this.flowMachine?.send({ type: "CANCEL_FLOW" });
		this.dispose();
	}

	dispose() {
		if (this.quoteRefreshTimer) {
			clearTimeout(this.quoteRefreshTimer);
			this.quoteRefreshTimer = undefined;
		}

		if (this.subscription) {
			this.webClient.unsubscribe(this.subscription.topicName);
			this.subscription = undefined;
		}

		if (this.flowMachine) {
			this.flowMachine.dispose();
			this.flowMachine = undefined;
		}
	}

	// TEST METHOD - For testing withdrawal completion without real transactions
	testWithdrawalComplete(transactionId?: string) {
		console.log("🧪 TEST: Simulating withdrawal completion");

		// Simulate the same message that would come from onWithdrawComplete
		const mockMessage = {
			type: "withdraw",
			success: true,
			walletId: "test-wallet-id-" + Date.now(),
			step: "complete",
			stepIndex: 4,
			totalSteps: 4,
			transactionId: transactionId || "test-transaction-" + Date.now(),
		};

		// Execute the same logic as in onWithdrawComplete
		if (mockMessage.success && mockMessage.type === "withdraw") {
			console.log(
				"🧪 TEST: Withdrawal completed successfully, transitioning state machine",
			);
			console.log(
				"🧪 TEST: Current flow machine state before completion:",
				this.flowMachine?.getState()?.type,
			);

			// First, send success to update the withdrawal machine state
			this.flowMachine?.send({
				type: "WITHDRAWAL_SUCCESS",
				transactionId: mockMessage.transactionId,
			});

			// Then send completion action
			this.flowMachine?.send({
				type: "WITHDRAWAL_COMPLETED",
				transactionId: mockMessage.transactionId,
			});

			// Log current state after sending actions
			const currentState = this.flowMachine?.getState();
			console.log(
				"🧪 TEST: Flow machine state after completion actions:",
				currentState?.type,
			);
		}
	}
}
