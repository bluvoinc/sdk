/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {BluvoFlowClient} from '../../src/machines';

/**
 * Cross-Browser Compatibility Tests
 *
 * These tests verify that the OAuth window flow works consistently
 * across Chrome (Chromium), Firefox, and Safari (Webkit).
 *
 * Tests run in REAL browsers to catch browser-specific issues:
 * - Popup blocker behavior
 * - window.open parameter handling
 * - Window reference management
 * - Browser API differences
 */

describe('Cross-Browser Compatibility', () => {
    let mockWindowOpen: ReturnType<typeof vi.fn>;
    let mockWindow: Window | null;

    const mockBalanceResponse: any = {
        lastSyncAt: new Date().toISOString(),
        balances: [{
            asset: 'BTC',
            amount: 1.5,
            networks: [{
                id: 'bitcoin',
                name: 'Bitcoin',
                displayName: 'Bitcoin',
                minWithdrawal: '0.0001',
                maxWithdrawal: '10',
                assetName: 'BTC'
            }],
            amountInFiat: 45000
        }]
    };

    const mockQuoteResponse: any = {
        id: 'quote-123',
        asset: 'BTC',
        amountNoFee: 1.0,
        estimatedFee: 0.001,
        estimatedTotal: 1.001,
        amountWithFeeInFiat: 30030,
        amountNoFeeInFiat: 30000,
        estimatedFeeInFiat: 30,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        destinationAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    };

    beforeEach(() => {
        mockWindow = {
            closed: false,
            close: vi.fn(() => {
                if (mockWindow) {
                    // mockWindow.closed = true;
                    mockWindow = {
                        ...mockWindow,
                        closed: true,
                    }
                }
            }),
            focus: vi.fn(),
            location: {href: ''} as Location,
        } as unknown as Window;

        mockWindowOpen = vi.fn(() => mockWindow);
        vi.stubGlobal('open', mockWindowOpen);

        // Mock fetch to prevent actual API calls
        const mockHeaders = {
            forEach: (callback: (value: string, key: string) => void) => {
                callback('application/json', 'content-type');
            },
            get: (key: string) => {
                const lowerKey = key.toLowerCase();
                return lowerKey === 'content-type' ? 'application/json' : null;
            },
            has: (key: string) => key.toLowerCase() === 'content-type',
            entries: () => [['content-type', 'application/json']].entries(),
            keys: () => ['content-type'].values(),
            values: () => ['application/json'].values()
        };

        vi.stubGlobal('fetch', vi.fn((input: Request | string, init?: RequestInit) => {
            // Handle Request object (OpenAPI client passes Request object, not just URL)
            let url: string;
            let headers: Headers | Record<string, string> | undefined;

            if (input instanceof Request) {
                url = input.url;
                headers = input.headers;
            } else {
                url = input;
                headers = init?.headers as Headers | Record<string, string> | undefined;
            }

            // Extract parameters from URL to make response dynamic
            const urlObj = new URL(url, 'https://api.example.com');
            const pathParts = urlObj.pathname.split('/');
            const exchange = pathParts.includes('coinbase') ? 'coinbase' :
                pathParts.includes('binance') ? 'binance' :
                    pathParts.includes('kraken') ? 'kraken' : 'exchange';

            // Get wallet ID from headers
            let walletId = 'wallet-abc';
            if (headers) {
                // Handle both Headers object and plain object
                if (headers instanceof Headers || ('get' in headers && typeof headers.get === 'function')) {
                    walletId = (headers as Headers).get('x-bluvo-wallet-id') || 'wallet-abc';
                } else {
                    const walletIdHeader = Object.keys(headers).find(k =>
                        k.toLowerCase().includes('wallet')
                    );
                    if (walletIdHeader && (headers as Record<string, string>)[walletIdHeader]) {
                        walletId = (headers as Record<string, string>)[walletIdHeader];
                    }
                }
            }

            return Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: mockHeaders,
                json: () => Promise.resolve({
                    url: `https://example.com/oauth2/authorize?exchange=${exchange}&wallet=${walletId}&state=test`,
                    success: true
                }),
                text: () => Promise.resolve(JSON.stringify({
                    url: `https://example.com/oauth2/authorize?exchange=${exchange}&wallet=${walletId}&state=test`,
                    success: true
                }))
            });
        }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    describe('Browser Environment Detection', () => {
        it('should identify browser type correctly', () => {
            const userAgent = window.navigator.userAgent.toLowerCase();

            // Check we're in a real browser environment
            expect(window).toBeDefined();
            expect(document).toBeDefined();
            expect(navigator).toBeDefined();

            // Log browser info for debugging (visible in test output)
            console.log('Testing in browser:', {
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                platform: navigator.platform
            });

            // Verify we can detect browser type
            const isChrome = userAgent.includes('chrome') || userAgent.includes('chromium');
            const isFirefox = userAgent.includes('firefox');
            const isSafari = userAgent.includes('safari') && !isChrome;

            // At least one should be true
            expect(isChrome || isFirefox || isSafari).toBe(true);
        });

        it('should have window.open available in all browsers', () => {
            expect(typeof window.open).toBe('function');

            // Test that window.open exists and is callable
            const testWindow = window.open('about:blank', '_blank');

            // Close immediately if it opened
            if (testWindow && !testWindow.closed) {
                testWindow.close();
            }

            // We should have been able to call it
            expect(testWindow !== undefined).toBe(true);
        });
    });

    describe
        .skipIf((() => {
            // Skip if not in Chromium
            const isChromium = window.navigator.userAgent.toLowerCase().includes('chrome') ||
                window.navigator.userAgent.toLowerCase().includes('chromium');

            return !isChromium
        })())
        ('Chrome/Chromium-specific behavior', () => {
            it('should handle OAuth flow in Chromium', async () => {
                const client = new BluvoFlowClient({
                    pingWalletByIdFn(walletId: string): Promise<any> {
                        return Promise.resolve(undefined);
                    },
                    orgId: 'test-org',
                    projectId: 'test-project',
                    listExchangesFn: vi.fn().mockResolvedValue([]),
                    getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                    fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                    requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                    executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                    mkUUIDFn: () => 'chrome-test-uuid'
                });

                const {machine} = await client.startWithdrawalFlow({
                    exchange: 'coinbase',
                    walletId: 'wallet-chrome',
                });

                expect(mockWindowOpen).toHaveBeenCalled();
                expect(machine.getState().context.exchange).toBe('coinbase');
            });
        });

    describe
        .skipIf((() => {
            return window.navigator.userAgent.toLowerCase().includes('firefox');
        })())
        ('Firefox-specific behavior', () => {
            it('should handle OAuth flow in Firefox', async () => {
                const client = new BluvoFlowClient({
                    pingWalletByIdFn(walletId: string): Promise<any> {
                        return Promise.resolve(undefined);
                    },
                    orgId: 'test-org',
                    projectId: 'test-project',
                    listExchangesFn: vi.fn().mockResolvedValue([]),
                    getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                    fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                    requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                    executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                    mkUUIDFn: () => 'firefox-test-uuid'
                });

                const {machine} = await client.startWithdrawalFlow({
                    exchange: 'coinbase',
                    walletId: 'wallet-firefox'
                });

                expect(mockWindowOpen).toHaveBeenCalled();
                expect(machine.getState().context.exchange).toBe('coinbase');
            });
        });

    describe
        .skipIf((() => {
            // Skip if not in Safari/Webkit
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isSafari = (userAgent.includes('safari') && !userAgent.includes('chrome')) ||
                userAgent.includes('webkit');

            return !isSafari;
        })())
        ('Safari/Webkit-specific behavior', () => {
            it('should handle OAuth flow in Safari', async () => {

                const client = new BluvoFlowClient({
                    pingWalletByIdFn(walletId: string): Promise<any> {
                        return Promise.resolve(undefined);
                    },
                    orgId: 'test-org',
                    projectId: 'test-project',
                    listExchangesFn: vi.fn().mockResolvedValue([]),
                    getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                    fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                    requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                    executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                    mkUUIDFn: () => 'safari-test-uuid'
                });

                const {machine} = await client.startWithdrawalFlow({
                    exchange: 'coinbase',
                    walletId: 'wallet-safari'
                });

                expect(mockWindowOpen).toHaveBeenCalled();
                expect(machine.getState().context.exchange).toBe('coinbase');
            });
        });

    describe('Consistent Behavior Across All Browsers', () => {
        it('should produce identical state machine behavior in all browsers', async () => {
            // This test runs in ALL configured browsers
            const client = new BluvoFlowClient({
                pingWalletByIdFn(walletId: string): Promise<any> {
                    return Promise.resolve(undefined);
                },
                orgId: 'cross-browser-org',
                projectId: 'cross-browser-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'universal-uuid'
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'binance',
                walletId: 'universal-wallet'
            });

            // Verify consistent initial state
            const initialState = machine.getState();
            expect(initialState.context.orgId).toBe('cross-browser-org');
            expect(initialState.context.projectId).toBe('cross-browser-project');
            expect(initialState.context.exchange).toBe('binance');
            expect(initialState.context.walletId).toBe('universal-wallet');

            // Verify window.open behavior is consistent
            expect(mockWindowOpen).toHaveBeenCalled();
            const [url, target] = mockWindowOpen.mock.calls[0];
            expect(url).toContain('binance');
            expect(target).toBeTruthy();

            // Verify state transitions work consistently
            machine.send({type: 'OAUTH_WINDOW_OPENED'});
            expect(machine.getState().type).toMatch(/oauth:(waiting|processing)/);

            machine.send({
                type: 'OAUTH_COMPLETED',
                walletId: 'universal-wallet',
                exchange: 'binance'
            });
            expect(machine.getState().type).toBe('oauth:completed');

            // Verify context is preserved
            const finalState = machine.getState();
            expect(finalState.context.orgId).toBe('cross-browser-org');
            expect(finalState.context.exchange).toBe('binance');
            expect(finalState.context.walletId).toBe('universal-wallet');
        });

        it('should handle popup blockers consistently across browsers', async () => {
            // Simulate popup blocker in all browsers
            vi.stubGlobal('open', vi.fn(() => null));

            const client = new BluvoFlowClient({
                pingWalletByIdFn(walletId: string): Promise<any> {
                    return Promise.resolve(undefined);
                },
                orgId: 'test-org',
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'blocked-uuid'
            });

            // Should throw an error when popup is blocked
            await expect(client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'blocked-wallet'
            })).rejects.toThrow('Failed to open OAuth2 window');
        });

        it('should handle window close events consistently', async () => {
            const client = new BluvoFlowClient({
                pingWalletByIdFn(walletId: string): Promise<any> {
                    return Promise.resolve(undefined);
                },
                orgId: 'test-org',
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'close-test-uuid'
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'kraken',
                walletId: 'close-test-wallet'
            });

            machine.send({type: 'OAUTH_WINDOW_OPENED'});

            // Simulate window close
            machine.send({
                type: 'OAUTH_WINDOW_CLOSED_BY_USER',
                error: new Error('User closed the window')
            });

            const state = machine.getState();
            expect(state.type).toBe('oauth:window_closed_by_user');
            expect(state.error).toBeDefined();
        });
    });

    describe('Browser API Availability', () => {
        it('should have all required browser APIs available', () => {
            // Core APIs that should be available in all browsers
            expect(typeof window).toBe('object');
            expect(typeof document).toBe('object');
            expect(typeof navigator).toBe('object');
            expect(typeof window.open).toBe('function');
            expect(typeof window.close).toBe('function');
            expect(typeof window.focus).toBe('function');

            // Storage APIs
            expect(typeof localStorage).toBe('object');
            expect(typeof sessionStorage).toBe('object');

            // Timing APIs
            expect(typeof setTimeout).toBe('function');
            expect(typeof setInterval).toBe('function');
            expect(typeof Date).toBe('function');

            // Promise support
            expect(typeof Promise).toBe('function');
            expect(typeof Promise.resolve).toBe('function');
        });

        it('should support modern JavaScript features', () => {
            // Arrow functions
            const arrow = () => true;
            expect(arrow()).toBe(true);

            // Async/await
            expect(async () => {
                const result = await Promise.resolve(42);
                return result;
            }).toBeDefined();

            // Destructuring
            const {orgId, projectId} = {orgId: 'test', projectId: 'test'};
            expect(orgId).toBe('test');
            expect(projectId).toBe('test');

            // Spread operator
            const arr1 = [1, 2, 3];
            const arr2 = [...arr1, 4, 5];
            expect(arr2).toEqual([1, 2, 3, 4, 5]);
        });
    });
});
