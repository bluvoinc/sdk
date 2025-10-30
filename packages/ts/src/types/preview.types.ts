/**
 * Preview functionality types for wallet balance display
 *
 * This module provides types for displaying preview information about multiple wallets
 * without requiring full OAuth flows. This enables showing users their connected wallets
 * with balance information before they interact with the withdrawal flow.
 */

/**
 * Status of a wallet preview
 */
export type PreviewStatus =
    | 'idle'                          // Not yet started loading
    | 'loading'                        // Currently fetching preview data
    | 'ready'                          // Preview data loaded successfully
    | 'error_not_found'               // Wallet not found (404)
    | 'error_invalid_credentials'     // Invalid API credentials
    | 'error_unknown';                // Unknown error occurred

/**
 * Balance information for a single asset in preview mode
 */
export interface PreviewWalletBalance {
    asset: string;
    balance: string;
    balanceInFiat?: string;
    extra?: {
        slug?: string;
        assetId?: string;
    };
}

/**
 * Complete state of a wallet preview
 */
export interface WalletPreviewState {
    /** Unique identifier for this wallet */
    walletId: string;

    /** Exchange this wallet is connected to */
    exchange: string;

    /** Current status of the preview */
    status: PreviewStatus;

    /** Available balances (populated when status is 'ready') */
    balances?: Array<PreviewWalletBalance>;

    /** Error details (populated when status starts with 'error_') */
    error?: Error;

    /** Timestamp of last update (milliseconds since epoch) */
    lastUpdated?: number;
}

/**
 * Input for loading a wallet preview
 */
export interface PreviewWalletInput {
    /** Wallet ID to preview */
    id: string;

    /** Exchange the wallet is connected to */
    exchange: string;
}

/**
 * Callbacks for wallet preview events
 */
export interface PreviewCallbacks {
    /** Called when wallet balance is successfully loaded */
    onWalletBalance?: (walletId: string, balances: Array<PreviewWalletBalance>) => void;

    /** Called when wallet is not found (404) */
    onWalletNotFound?: (walletId: string) => void;

    /** Called when wallet has invalid API credentials */
    onWalletInvalidApiCredentials?: (walletId: string) => void;
}
