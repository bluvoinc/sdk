import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    BluvoPreviewManager,
    BluvoPreviewManagerOptions,
    PreviewWalletInput,
    WalletPreviewState,
    PreviewCallbacks
} from '@bluvo/sdk-ts';

/**
 * Options for the useWalletPreviews hook
 */
export interface UseWalletPreviewsOptions extends BluvoPreviewManagerOptions {
    /** Array of wallets to preview */
    wallets: Array<PreviewWalletInput>;

    /** Callbacks for wallet preview events */
    callbacks?: PreviewCallbacks;

    /** Whether to automatically load previews on mount (default: true) */
    autoLoad?: boolean;
}

/**
 * Hook for managing wallet preview states
 *
 * This hook provides a simple way to load and display preview information
 * (balances, status) for multiple wallets without requiring full OAuth flows.
 * Perfect for showing a dashboard of connected wallets.
 *
 * @param options Configuration for wallet previews
 * @returns Preview state and control functions
 *
 * @example
 * ```typescript
 * const { previews, isLoading, loadPreviews, clearPreview } = useWalletPreviews({
 *   wallets: [
 *     { id: 'wallet-1', exchange: 'coinbase' },
 *     { id: 'wallet-2', exchange: 'kraken' }
 *   ],
 *   pingWalletByIdFn: pingWallet,
 *   fetchWithdrawableBalanceFn: getBalances,
 *   callbacks: {
 *     onWalletBalance: (walletId, balances) => {
 *       console.log(`Loaded balances for ${walletId}:`, balances);
 *     }
 *   }
 * });
 * ```
 */
export function useWalletPreviews(options: UseWalletPreviewsOptions) {
    const [previewManager] = useState(() => {
        // Lazy import to avoid SSR issues
        const { BluvoPreviewManager } = require('@bluvo/sdk-ts');
        return new BluvoPreviewManager({
            pingWalletByIdFn: options.pingWalletByIdFn,
            fetchWithdrawableBalanceFn: options.fetchWithdrawableBalanceFn
        });
    });

    const [previews, setPreviews] = useState<Record<string, WalletPreviewState>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const walletsRef = useRef(options.wallets);
    const callbacksRef = useRef(options.callbacks);

    // Update refs when options change
    useEffect(() => {
        walletsRef.current = options.wallets;
        callbacksRef.current = options.callbacks;
    }, [options.wallets, options.callbacks]);

    // Subscribe to preview state changes
    useEffect(() => {
        const unsubscribe = previewManager.subscribe((states: Record<string, WalletPreviewState>) => {
            setPreviews(states);
        });

        return unsubscribe;
    }, [previewManager]);

    /**
     * Load preview data for all configured wallets
     */
    const loadPreviews = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);

        try {
            await previewManager.loadPreviewWallets(
                walletsRef.current,
                callbacksRef.current
            );
        } catch (error) {
            console.error('Error loading wallet previews:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [previewManager]);

    /**
     * Load preview data for a single wallet
     */
    const loadPreview = useCallback(async (walletId: string, exchange: string) => {
        try {
            await previewManager.loadPreviewWallet(
                walletId,
                exchange,
                callbacksRef.current
            );
        } catch (error) {
            console.error(`Error loading preview for wallet ${walletId}:`, error);
        }
    }, [previewManager]);

    /**
     * Clear preview data for a specific wallet
     */
    const clearPreview = useCallback((walletId: string) => {
        previewManager.clearPreview(walletId);
    }, [previewManager]);

    /**
     * Clear all preview data
     */
    const clearAllPreviews = useCallback(() => {
        previewManager.clearAllPreviews();
    }, [previewManager]);

    /**
     * Get preview state for a specific wallet
     */
    const getPreview = useCallback((walletId: string) => {
        return previewManager.getPreviewState(walletId);
    }, [previewManager]);

    // Auto-load on mount if enabled
    useEffect(() => {
        if (options.autoLoad !== false && walletsRef.current.length > 0) {
            loadPreviews();
        }
    }, []); // Only run on mount

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            previewManager.dispose();
        };
    }, [previewManager]);

    // Derived states
    const isAnyLoading = Object.values(previews).some(p => p.status === 'loading');
    const hasAnyError = Object.values(previews).some(
        p => p.status.startsWith('error_') || Boolean(p.error)
    );
    const allReady = Object.values(previews).every(p => p.status === 'ready');

    return {
        /** All wallet preview states keyed by wallet ID */
        previews,

        /** Whether initial load is in progress */
        isLoading,

        /** Whether any preview has an error */
        hasError: hasError || hasAnyError,

        /** Whether any wallet is currently loading */
        isAnyLoading,

        /** Whether all wallets are ready */
        allReady,

        /** Load all wallet previews */
        loadPreviews,

        /** Load a single wallet preview */
        loadPreview,

        /** Get preview for a specific wallet */
        getPreview,

        /** Clear preview for a specific wallet */
        clearPreview,

        /** Clear all previews */
        clearAllPreviews,

        /** The preview manager instance (for advanced use) */
        manager: previewManager
    };
}

// Export the return type for convenience
export type UseWalletPreviewsReturn = ReturnType<typeof useWalletPreviews>;
