import type { QRCodeAuthWorkflowMessageBody } from "./WorkflowTypes";

/**
 * Async cache adapter interface.
 * By default, Bluvo uses localStorage. Users can provide their own
 * async get/set implementation (e.g., IndexedDB, sessionStorage, etc.).
 */
export interface BluvoCacheAdapter {
	get: (key: string) => Promise<string | null> | string | null;
	set: (key: string, value: string) => Promise<void> | void;
	remove: (key: string) => Promise<void> | void;
}

export interface BluvoCacheOptions {
	/**
	 * Custom cache adapter. Defaults to localStorage.
	 */
	adapter?: BluvoCacheAdapter;

	/**
	 * Prefix for all cache keys. Defaults to "bluvo:".
	 */
	prefix?: string;

	/**
	 * Minimum remaining lifetime (in seconds) for a cached QR code to be considered valid.
	 * If the QR code expires within this threshold, the cache is ignored.
	 * Defaults to 15 seconds.
	 */
	minRemainingLifetimeSec?: number;

	/**
	 * Disable caching entirely. Defaults to false.
	 */
	disabled?: boolean;
}

interface CachedQRCode {
	message: QRCodeAuthWorkflowMessageBody;
	cachedAt: number;
}

const QRCODE_CACHE_KEY_SUFFIX = "qrcode";

/**
 * Default localStorage adapter. Silently fails if localStorage is unavailable.
 */
function createLocalStorageAdapter(): BluvoCacheAdapter {
	return {
		get(key: string): string | null {
			try {
				if (typeof localStorage !== "undefined") {
					return localStorage.getItem(key);
				}
			} catch {
				// localStorage may throw in some environments (e.g., Safari private browsing)
			}
			return null;
		},
		set(key: string, value: string): void {
			try {
				if (typeof localStorage !== "undefined") {
					localStorage.setItem(key, value);
				}
			} catch {
				// Silently fail - cache is best-effort
			}
		},
		remove(key: string): void {
			try {
				if (typeof localStorage !== "undefined") {
					localStorage.removeItem(key);
				}
			} catch {
				// Silently fail
			}
		},
	};
}

export class BluvoCache {
	private adapter: BluvoCacheAdapter;
	private prefix: string;
	private minRemainingLifetimeSec: number;
	private disabled: boolean;

	constructor(options?: BluvoCacheOptions) {
		this.adapter = options?.adapter || createLocalStorageAdapter();
		this.prefix = options?.prefix ?? "bluvo:";
		this.minRemainingLifetimeSec = options?.minRemainingLifetimeSec ?? 15;
		this.disabled = options?.disabled ?? false;
	}

	private buildKey(exchange: string, suffix: string): string {
		return `${this.prefix}${exchange}:${suffix}`;
	}

	/**
	 * Retrieve a cached QR code for the given exchange, if still valid.
	 * Returns null if cache is empty, expired, or within the safety threshold.
	 */
	async getCachedQRCode(
		exchange: string,
	): Promise<QRCodeAuthWorkflowMessageBody | null> {
		if (this.disabled) return null;

		try {
			const key = this.buildKey(exchange, QRCODE_CACHE_KEY_SUFFIX);
			const raw = await this.adapter.get(key);
			if (!raw) return null;

			const cached: CachedQRCode = JSON.parse(raw);
			if (!cached?.message) return null;

			const expiresAt = cached.message.qrCodeExpiresAt;
			if (!expiresAt) {
				// No expiration info - don't use cache (can't verify validity)
				return null;
			}

			const now = Date.now();
			const remainingMs = expiresAt - now;
			const thresholdMs = this.minRemainingLifetimeSec * 1000;

			if (remainingMs <= thresholdMs) {
				// QR code is expired or too close to expiring - remove and skip
				await this.adapter.remove(key);
				return null;
			}

			return cached.message;
		} catch {
			// Parse error or adapter failure - silently ignore
			return null;
		}
	}

	/**
	 * Cache a QR code message for the given exchange.
	 * Only caches if the message has both a URL and expiration time.
	 */
	async cacheQRCode(
		exchange: string,
		message: QRCodeAuthWorkflowMessageBody,
	): Promise<void> {
		if (this.disabled) return;
		if (!message.qrCodeUrl || !message.qrCodeExpiresAt) return;

		try {
			const key = this.buildKey(exchange, QRCODE_CACHE_KEY_SUFFIX);
			const cached: CachedQRCode = {
				message,
				cachedAt: Date.now(),
			};
			await this.adapter.set(key, JSON.stringify(cached));
		} catch {
			// Silently fail - cache is best-effort
		}
	}

	/**
	 * Remove cached QR code for the given exchange.
	 */
	async removeCachedQRCode(
		exchange: string,
	): Promise<void> {
		if (this.disabled) return;

		try {
			const key = this.buildKey(exchange, QRCODE_CACHE_KEY_SUFFIX);
			await this.adapter.remove(key);
		} catch {
			// Silently fail
		}
	}
}
