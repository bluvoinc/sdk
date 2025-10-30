import type { WalletwithdrawbalancebalanceResponse } from "../../generated";
import type {
	PreviewCallbacks,
	PreviewWalletBalance,
	PreviewWalletInput,
	WalletPreviewState,
} from "../types/preview.types";
import {BluvoFlowClientOptions} from "./BluvoFlowClient";
import { ERROR_CODES, extractErrorCode } from "../error-codes";
import { transformBalancesForPreview } from "../utils/balanceTransform";

/**
 * Options for creating a BluvoPreviewManager
 */
export type BluvoPreviewManagerOptions = Pick<BluvoFlowClientOptions, "fetchWithdrawableBalanceFn"|"pingWalletByIdFn">;


/**
 * Manager for wallet preview states
 *
 * This class manages the preview states of multiple wallets independently,
 * allowing you to display balance information for multiple wallets without
 * requiring full OAuth flows for each one.
 *
 * @example
 * ```typescript
 * const previewManager = new BluvoPreviewManager({
 *   pingWalletByIdFn: pingWallet,
 *   fetchWithdrawableBalanceFn: getBalances
 * });
 *
 * // Load previews for multiple wallets
 * await previewManager.loadPreviewWallets([
 *   { id: 'wallet-1', exchange: 'coinbase' },
 *   { id: 'wallet-2', exchange: 'kraken' }
 * ]);
 *
 * // Subscribe to state changes
 * const unsubscribe = previewManager.subscribe((states) => {
 *   console.log('Preview states updated:', states);
 * });
 * ```
 */
export class BluvoPreviewManager {
	private states: Map<string, WalletPreviewState> = new Map();
	private listeners: Set<(states: Record<string, WalletPreviewState>) => void> =
		new Set();

	constructor(private options: BluvoPreviewManagerOptions) {}

	/**
	 * Load preview data for multiple wallets
	 */
	async loadPreviewWallets(
		wallets: Array<PreviewWalletInput>,
		callbacks?: PreviewCallbacks,
	): Promise<void> {
		// Load all wallets in parallel
		await Promise.allSettled(
			wallets.map((wallet) =>
				this.loadPreviewWallet(wallet.id, wallet.exchange, callbacks),
			),
		);
	}

	/**
	 * Load preview data for a single wallet
	 *
	 * This method:
	 * 1. Calls pingWalletByIdFn to validate wallet exists and has valid credentials
	 * 2. If valid, fetches withdrawable balance
	 * 3. Updates state and notifies listeners
	 */
	async loadPreviewWallet(
		walletId: string,
		exchange: string,
		callbacks?: PreviewCallbacks,
	): Promise<void> {
		// Initialize state as loading
		this.updateState(walletId, {
			walletId,
			exchange,
			status: "loading",
			lastUpdated: Date.now(),
		});

		// Step 1: Ping wallet to validate
		const {
			data: pingResult,
			error: pingError,
			success: pingSuccess
		} = await this.options.pingWalletByIdFn(walletId);

		// Check for ping errors
		if (!pingSuccess) {
			const errorCode = extractErrorCode(pingError);

			if (errorCode === ERROR_CODES.WALLET_NOT_FOUND) {
				this.updateState(walletId, {
					walletId,
					exchange,
					status: "error_not_found",
					error: new Error("Wallet not found"),
					lastUpdated: Date.now(),
				});
				callbacks?.onWalletNotFound?.(walletId);
				return;
			}

			// Unknown ping error
			this.updateState(walletId, {
				walletId,
				exchange,
				status: "error_unknown",
				error: pingError instanceof Error ? pingError : new Error((pingError as any)?.error || (pingError as any)?.message || "Failed to ping wallet"),
				lastUpdated: Date.now(),
			});
			return;
		}

		// Check ping result for specific error cases
		// The ping API returns {status: "SUCCESS" | "INVALID_API_CREDENTIALS"}
		if (pingResult?.status === "INVALID_API_CREDENTIALS") {
			this.updateState(walletId, {
				walletId,
				exchange,
				status: "error_invalid_credentials",
				error: new Error("Invalid API credentials"),
				lastUpdated: Date.now(),
			});
			callbacks?.onWalletInvalidApiCredentials?.(walletId);
			return;
		}

		// Step 2: Fetch withdrawable balance
		const {
			success: balanceSuccess,
			data: balanceResponse,
			error: balanceError
		} = await this.options.fetchWithdrawableBalanceFn(walletId);

		if (!balanceSuccess) {
			const errorCode = extractErrorCode(balanceError);

			if (errorCode === ERROR_CODES.WALLET_NOT_FOUND) {
				this.updateState(walletId, {
					walletId,
					exchange,
					status: "error_not_found",
					error: new Error("Wallet not found"),
					lastUpdated: Date.now(),
				});
				callbacks?.onWalletNotFound?.(walletId);
				return;
			}

			// Unknown balance error
			this.updateState(walletId, {
				walletId,
				exchange,
				status: "error_unknown",
				error: balanceError instanceof Error ? balanceError : new Error((balanceError as any)?.error || (balanceError as any)?.message || "Failed to fetch balance"),
				lastUpdated: Date.now(),
			});
			return;
		}

		if (!balanceResponse?.balances) {
			this.updateState(walletId, {
				walletId,
				exchange,
				status: "error_unknown",
				error: new Error("No balance data returned"),
				lastUpdated: Date.now(),
			});
			return;
		}

		// Transform balance data to preview format
		const balances: Array<PreviewWalletBalance> = transformBalancesForPreview(balanceResponse.balances);

		// Update state to ready
		this.updateState(walletId, {
			walletId,
			exchange,
			status: "ready",
			balances,
			lastUpdated: Date.now(),
		});

		callbacks?.onWalletBalance?.(walletId, balances);
	}

	/**
	 * Get preview state for a specific wallet
	 */
	getPreviewState(walletId: string): WalletPreviewState | undefined {
		return this.states.get(walletId);
	}

	/**
	 * Get all preview states
	 */
	getAllPreviewStates(): Record<string, WalletPreviewState> {
		const result: Record<string, WalletPreviewState> = {};
		this.states.forEach((state, walletId) => {
			result[walletId] = state;
		});
		return result;
	}

	/**
	 * Subscribe to preview state changes
	 *
	 * @param listener Function called when any preview state changes
	 * @returns Unsubscribe function
	 */
	subscribe(
		listener: (states: Record<string, WalletPreviewState>) => void,
	): () => void {
		this.listeners.add(listener);

		// Immediately call with current state
		listener(this.getAllPreviewStates());

		// Return unsubscribe function
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Clear preview for a specific wallet
	 */
	clearPreview(walletId: string): void {
		this.states.delete(walletId);
		this.notifyListeners();
	}

	/**
	 * Clear all previews
	 */
	clearAllPreviews(): void {
		this.states.clear();
		this.notifyListeners();
	}

	/**
	 * Cleanup resources
	 */
	dispose(): void {
		this.states.clear();
		this.listeners.clear();
	}

	/**
	 * Update state for a specific wallet and notify listeners
	 */
	private updateState(walletId: string, state: WalletPreviewState): void {
		this.states.set(walletId, state);
		this.notifyListeners();
	}

	/**
	 * Notify all listeners of state changes
	 */
	private notifyListeners(): void {
		const allStates = this.getAllPreviewStates();
		this.listeners.forEach((listener) => {
			listener(allStates);
		});
	}
}
