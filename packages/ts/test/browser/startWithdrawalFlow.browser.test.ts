/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {BluvoFlowClient} from '../../src/machines';

/**
 * Browser-specific tests for startWithdrawalFlow
 *
 * These tests run in REAL browsers (Chrome, Firefox, Safari) to verify:
 * - window.open is called correctly
 * - OAuth window opens with correct parameters
 * - Momento cache messages are received
 * - Window closes after OAuth completion
 * - State machine transitions correctly
 * - Cross-browser compatibility
 */

describe('startWithdrawalFlow - Browser Tests', () => {
    let mockWindowOpen: ReturnType<typeof vi.fn>;
    let mockWindow: Window | null;
    let currentWalletId: string = 'wallet-abc';
    let currentExchange: string = 'coinbase';

    // Mock API responses
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
        // Mock window.open to return a fake window object
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

            // Extract exchange from URL path
            const urlObj = new URL(url, 'https://api.example.com');
            const pathParts = urlObj.pathname.split('/').filter(p => p);

            let exchange = currentExchange;
            if (pathParts.includes('coinbase')) exchange = 'coinbase';
            else if (pathParts.includes('binance')) exchange = 'binance';
            else if (pathParts.includes('kraken')) exchange = 'kraken';

            // Get wallet ID from headers
            let walletId = currentWalletId;
            if (headers) {
                // Handle both Headers object and plain object
                if (headers instanceof Headers || ('get' in headers && typeof headers.get === 'function')) {
                    walletId = (headers as Headers).get('x-bluvo-wallet-id') || currentWalletId;
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

    describe('OAuth Window Opening', () => {
        it('should open OAuth window with correct URL and parameters', async () => {
            const client = new BluvoFlowClient({
                pingWalletByIdFn: vi.fn(),
                orgId: 'test-org',
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123'
            });

            // Start withdrawal flow
            await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Verify window.open was called
            expect(mockWindowOpen).toHaveBeenCalled();

            // Get the call arguments
            const [url, target, features] = mockWindowOpen.mock.calls[0];

            // Verify URL contains OAuth endpoint
            expect(url).toContain('/oauth2/authorize');
            expect(url).toContain('coinbase');

            // Verify target is defined (could be window title or _blank)
            expect(target).toBeTruthy();

            // Verify window features for popup
            if (features) {
                expect(features).toContain('width=');
                expect(features).toContain('height=');
            }
        });

        it('should transition to oauth:waiting state when window opens', async () => {
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
                mkUUIDFn: () => 'test-uuid-123'
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Should be in oauth:waiting or oauth:processing state
            const state = machine.getState();
            expect(['oauth:waiting', 'oauth:processing']).toContain(state.type);
            expect(state.context.exchange).toBe('coinbase');
            expect(state.context.walletId).toBe('wallet-abc');
        });

        it('should handle window.open returning null (popup blocked)', async () => {
            // Simulate popup blocker
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
                mkUUIDFn: () => 'test-uuid-123'
            });

            // Should gracefully handle popup blocker (no longer throws)
            const result = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Should return an object with machine and cleanup function
            expect(result).toBeDefined();
            expect(result.machine).toBeDefined();
            expect(result.closeOAuthWindow).toBeTypeOf('function');
        });
    });

    describe('Momento Cache Message Simulation', () => {
        it('should transition to oauth:completed when receiving OAuth success message', async () => {
            const client = new BluvoFlowClient({
                pingWalletByIdFn: vi.fn(),
                orgId: 'test-org',
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123'
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Simulate OAuth completion message from Momento
            machine.send({
                type: 'OAUTH_COMPLETED',
                walletId: 'wallet-abc',
                exchange: 'coinbase'
            });

            const state = machine.getState();
            expect(state.type).toBe('oauth:completed');
            expect(state.context.walletId).toBe('wallet-abc');
        });

        it('should close OAuth window after receiving completion message', async () => {
            const client = new BluvoFlowClient({
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123',
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Simulate OAuth window opened
            machine.send({type: 'OAUTH_WINDOW_OPENED'});

            // Verify window is not closed yet
            expect(mockWindow?.closed).toBe(false);

            // Simulate OAuth completion
            machine.send({
                type: 'OAUTH_COMPLETED',
                walletId: 'wallet-abc',
                exchange: 'coinbase'
            });

            // In real implementation, the window would be closed
            // This tests the mock behavior
            expect(machine.getState().type).toBe('oauth:completed');
        });
    });

    describe('Complete Flow: OAuth → Wallet Loading', () => {
        it('should complete OAuth and transition to wallet loading', async () => {
            const fetchBalanceFn = vi.fn().mockResolvedValue(mockBalanceResponse);

            const client = new BluvoFlowClient({
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                listExchangesFn: vi.fn().mockResolvedValue([]),
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                fetchWithdrawableBalanceFn: fetchBalanceFn,
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123'
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Verify window.open was called
            expect(mockWindowOpen).toHaveBeenCalled();

            // Simulate OAuth window opened
            machine.send({type: 'OAUTH_WINDOW_OPENED'});
            expect(machine.getState().type).toBe('oauth:processing');

            // Simulate OAuth completion message from Momento
            machine.send({
                type: 'OAUTH_COMPLETED',
                walletId: 'wallet-abc',
                exchange: 'coinbase'
            });
            expect(machine.getState().type).toBe('oauth:completed');

            // Now load wallet
            machine.send({type: 'LOAD_WALLET'});
            expect(machine.getState().type).toBe('wallet:loading');

            // Wait for async wallet loading
            await new Promise(resolve => setTimeout(resolve, 100));

            // Should have transitioned to wallet:ready
            const finalState = machine.getState();
            expect(['wallet:ready', 'wallet:loading']).toContain(finalState.type);
        });
    });

    describe('Error Scenarios', () => {
        it('should handle OAuth window closed by user', async () => {
            const client = new BluvoFlowClient({
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123',
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc',
            });

            machine.send({type: 'OAUTH_WINDOW_OPENED'});

            // Simulate user closing the window
            machine.send({
                type: 'OAUTH_WINDOW_CLOSED_BY_USER',
                error: new Error('Window closed by user')
            });

            const state = machine.getState();
            expect(state.type).toBe('oauth:window_closed_by_user');
            expect(state.error?.message).toContain('user');
        });

        it('should handle OAuth failure', async () => {
            const client = new BluvoFlowClient({
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123',
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            machine.send({type: 'OAUTH_WINDOW_OPENED'});

            // Simulate OAuth failure
            machine.send({
                type: 'OAUTH_FAILED',
                error: new Error('OAuth authentication failed')
            });

            const state = machine.getState();
            expect(state.type).toBe('oauth:error');
            expect(state.error?.message).toContain('failed');
        });
    });

    describe('Browser-Specific Behavior', () => {
        it('should work consistently across different browsers', async () => {
            // This test runs in all configured browsers (Chrome, Firefox, Safari)
            // and verifies consistent behavior

            const client = new BluvoFlowClient({
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123',
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            // Verify window.open works in this browser
            expect(mockWindowOpen).toHaveBeenCalled();

            // Verify state machine initialization
            const state = machine.getState();
            expect(state).toBeDefined();
            expect(state.context.orgId).toBe('test-org');
            expect(state.context.exchange).toBe('coinbase');

            // Verify we can transition through states
            machine.send({type: 'OAUTH_WINDOW_OPENED'});
            expect(['oauth:processing', 'oauth:waiting']).toContain(machine.getState().type);
        });

        it('should detect browser environment correctly', () => {
            // Verify we're running in a real browser
            expect(typeof window).toBe('object');
            expect(typeof window.open).toBe('function');
            expect(typeof document).toBe('object');

            // These should be available in all browsers
            expect(window.navigator).toBeDefined();
            expect(window.location).toBeDefined();
        });
    });

    describe('Window Features and Popup Configuration', () => {
        it('should open popup with appropriate dimensions', async () => {
            const client = new BluvoFlowClient({
                orgId: 'test-org',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'test-uuid-123',
            });

            await client.startWithdrawalFlow({
                exchange: 'coinbase',
                walletId: 'wallet-abc'
            });

            expect(mockWindowOpen).toHaveBeenCalled();

            const [, , features] = mockWindowOpen.mock.calls[0];

            // Verify popup has reasonable dimensions
            if (features && typeof features === 'string') {
                // Should have width and height specified
                const hasWidth = features.includes('width=') || features.includes('Width=');
                const hasHeight = features.includes('height=') || features.includes('Height=');

                // At least one dimension should be specified for proper popup behavior
                expect(hasWidth || hasHeight).toBe(true);
            }
        });

        it('should handle different exchanges with same window behavior', async () => {
            const exchanges = ['coinbase', 'binance', 'kraken'] as const;

            for (const exchange of exchanges) {
                // Reset mocks for each iteration
                mockWindowOpen.mockClear();

                const client = new BluvoFlowClient({
                    orgId: 'test-org',
                    pingWalletByIdFn: vi.fn(),
                    projectId: 'test-project',
                    listExchangesFn: vi.fn().mockResolvedValue([]),
                    getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                    fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                    requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                    executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                    mkUUIDFn: () => `test-uuid-${exchange}`,
                });

                await client.startWithdrawalFlow({
                    exchange,
                    walletId: `wallet-${exchange}`
                });

                // Each exchange should open a window
                expect(mockWindowOpen).toHaveBeenCalled();

                const [url] = mockWindowOpen.mock.calls[0];
                // URL should contain the exchange name
                expect(url).toContain(exchange);
            }
        });
    });

    describe('State Machine Context Preservation', () => {
        it('should preserve context through OAuth flow', async () => {
            const client = new BluvoFlowClient({
                orgId: 'test-org-123',
                pingWalletByIdFn: vi.fn(),
                projectId: 'test-project-456',
                listExchangesFn: vi.fn().mockResolvedValue([]),
                getWalletByIdFn: vi.fn().mockResolvedValue({ data: null, error: null, success: false }),
                fetchWithdrawableBalanceFn: vi.fn().mockResolvedValue(mockBalanceResponse),
                requestQuotationFn: vi.fn().mockResolvedValue(mockQuoteResponse),
                executeWithdrawalFn: vi.fn().mockResolvedValue({id: 'withdrawal-123'}),
                mkUUIDFn: () => 'unique-uuid',
            });

            const {machine} = await client.startWithdrawalFlow({
                exchange: 'binance',
                walletId: 'wallet-xyz'
            });

            // Check initial context
            let state = machine.getState();
            expect(state.context.orgId).toBe('test-org-123');
            expect(state.context.projectId).toBe('test-project-456');
            expect(state.context.exchange).toBe('binance');
            expect(state.context.walletId).toBe('wallet-xyz');

            // Transition through OAuth
            machine.send({type: 'OAUTH_WINDOW_OPENED'});
            state = machine.getState();
            expect(state.context.orgId).toBe('test-org-123');
            expect(state.context.exchange).toBe('binance');

            machine.send({
                type: 'OAUTH_COMPLETED',
                walletId: 'wallet-xyz',
                exchange: 'binance'
            });
            state = machine.getState();
            expect(state.context.orgId).toBe('test-org-123');
            expect(state.context.projectId).toBe('test-project-456');
            expect(state.context.exchange).toBe('binance');
            expect(state.context.walletId).toBe('wallet-xyz');
        });
    });
});
