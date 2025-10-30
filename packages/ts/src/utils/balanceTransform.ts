import type { WalletwithdrawbalancebalanceResponse } from "../../generated";

/**
 * Raw balance data from the API
 */
type RawBalance = WalletwithdrawbalancebalanceResponse["balances"][number];

/**
 * Raw network data from the API
 */
type RawNetwork = RawBalance["networks"][number];

/**
 * Transformed network for state machine
 */
export interface TransformedNetwork {
	id: string;
	name: string;
	displayName: string;
	minWithdrawal: string;
	maxWithdrawal?: string;
	assetName: string;
	addressRegex?: string;
	chainId?: RawNetwork["chainId"];
	tokenAddress?: RawNetwork["tokenAddress"];
	contractAddress?: string | null;
	contractAddressVerified?: boolean | null;
}

/**
 * Transformed balance for state machine
 */
export interface TransformedBalance {
	asset: string;
	balance: string;
	balanceInFiat?: string;
	networks?: TransformedNetwork[];
	extra?: {
		slug?: string;
		assetId?: string;
	};
}

/**
 * Transform a raw network from the API to the format expected by the state machine
 */
function transformNetwork(network: RawNetwork): TransformedNetwork {
	const transformed: TransformedNetwork = {
		id: network.id,
		name: network.name,
		displayName: network.displayName,
		minWithdrawal: network.minWithdrawal,
		maxWithdrawal: network.maxWithdrawal,
		assetName: network.assetName,
		// contractAddressVerified defaults to true if null or undefined
		contractAddressVerified: network.contractAddressVerified ?? true,
	};

	// Only include optional fields if they have meaningful values (not null or undefined)
	if (network.addressRegex !== null && network.addressRegex !== undefined) {
		transformed.addressRegex = network.addressRegex;
	}

	if (network.chainId !== null && network.chainId !== undefined) {
		transformed.chainId = network.chainId;
	}

	if (network.tokenAddress !== null && network.tokenAddress !== undefined) {
		transformed.tokenAddress = network.tokenAddress;
	}

	if (network.contractAddress !== null && network.contractAddress !== undefined) {
		transformed.contractAddress = network.contractAddress;
	}

	return transformed;
}

/**
 * Transform a raw balance from the API to the format expected by the state machine
 */
function transformBalance(balance: RawBalance): TransformedBalance {
	const transformed: TransformedBalance = {
		asset: balance.asset,
		balance: String(balance.amount),
		networks: balance.networks.map(transformNetwork),
	};

	// Include balanceInFiat if amountInFiat is present (including 0)
	if (balance.amountInFiat !== undefined) {
		transformed.balanceInFiat = String(balance.amountInFiat);
	}

	// Include extra if present
	if (balance.extra !== undefined) {
		transformed.extra = balance.extra;
	}

	return transformed;
}

/**
 * Simplified balance for preview (without networks)
 */
export interface PreviewBalance {
	asset: string;
	balance: string;
	balanceInFiat?: string;
	extra?: {
		slug?: string;
		assetId?: string;
	};
}

/**
 * Transform a raw balance to preview format (without networks)
 */
function transformBalanceForPreview(balance: RawBalance): PreviewBalance {
	const transformed: PreviewBalance = {
		asset: balance.asset,
		balance: String(balance.amount),
	};

	// Include balanceInFiat if amountInFiat is present (including 0)
	if (balance.amountInFiat !== undefined) {
		transformed.balanceInFiat = String(balance.amountInFiat);
	}

	// Include extra if present
	if (balance.extra !== undefined) {
		transformed.extra = balance.extra;
	}

	return transformed;
}

/**
 * Transform an array of raw balances from the API to the format expected by the state machine
 *
 * This utility consolidates all the repetitive balance transformation logic that was
 * scattered across BluvoFlowClient and BluvoPreviewManager.
 *
 * @param balances - Raw balance data from WalletwithdrawbalancebalanceResponse
 * @returns Transformed balances ready for state machine consumption
 *
 * @example
 * ```typescript
 * const { data: withdrawableBalanceInfo } = await fetchWithdrawableBalanceFn(walletId);
 * const balances = transformBalances(withdrawableBalanceInfo.balances);
 * ```
 */
export function transformBalances(balances: RawBalance[]): TransformedBalance[] {
	return balances.map(transformBalance);
}

/**
 * Transform an array of raw balances for preview display (without network details)
 *
 * This is a lighter-weight transformation used by BluvoPreviewManager that only
 * includes basic balance information without network configuration.
 *
 * @param balances - Raw balance data from WalletwithdrawbalancebalanceResponse
 * @returns Preview balances without network details
 *
 * @example
 * ```typescript
 * const { data: balanceResponse } = await fetchWithdrawableBalanceFn(walletId);
 * const balances = transformBalancesForPreview(balanceResponse.balances);
 * ```
 */
export function transformBalancesForPreview(balances: RawBalance[]): PreviewBalance[] {
	return balances.map(transformBalanceForPreview);
}
