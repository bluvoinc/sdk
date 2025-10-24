import {createConfiguration, OAuth2Api, server1, server2, ServerConfiguration} from "../generated";
import {WebSocketClient, Subscription} from "./WebSocketClient";
import {
    OAuth2WorkflowMessageBody,
    WithdrawFundsWorkflowMessageBody,
    WorkflowMessageBody,
    WorkflowTypes
} from "./WorkflowTypes";

export type BaseOptions = {
    onStep?: (message: WorkflowMessageBody) => void;
    onError?: (error: Error) => void;
    onFatal?: (error: Error) => void;
};

export type OAuth2Options = BaseOptions & {
    onOAuth2Complete: (message: OAuth2WorkflowMessageBody) => any;
    onWithdrawComplete?: never;
};

export type WithdrawOptions = BaseOptions & {
    onWithdrawComplete: (message: WithdrawFundsWorkflowMessageBody) => any;
    onOAuth2Complete?: never;
};

/**
 * A web-specific client for Bluvo SDK that provides browser-oriented functionality
 * for cryptocurrency exchange integrations and OAuth2 authentication flows.
 * 
 * This client is designed for use in browser environments where direct API key usage
 * is not secure. It provides methods for OAuth2 authentication flows and other
 * browser-specific features that require user interaction.
 * 
 * Unlike the main BluvoClient which requires API keys, BluvoWebClient uses only
 * organization and project identifiers, making it safe for client-side applications.
 */
export class BluvoWebClient {
    private wsClient: WebSocketClient;
    private readonly wsBase: string;

    /**
     * Creates a new BluvoWebClient instance for browser environments.
     *
     * @param orgId Your Bluvo organization identifier.
     * @param projectId Your Bluvo project identifier.
     * @param sandbox Whether to use the sandbox environment.
     * @param dev Whether to use the local development environment (localhost:8787).
     */
    constructor(
        private readonly orgId: string,
        private readonly projectId: string,
        private readonly sandbox: boolean = false,
        private readonly dev: boolean = false
    ) {
        this.wsClient = new WebSocketClient();

        // Configure WebSocket base URL based on environment
        if (dev) {
            this.wsBase = 'ws://localhost:8787';
        } else if (sandbox) {
            this.wsBase = 'wss://test.api-bluvo.com';
        } else {
            this.wsBase = 'wss://api-bluvo.com';
        }
    }

    static createClient(
        {orgId, projectId, sandbox, dev}: {
            orgId: string;
            projectId: string;
            sandbox?: boolean;
            dev?: boolean;
        }
    ): BluvoWebClient {
        return new BluvoWebClient(orgId, projectId, sandbox, dev);
    }

    oauth2 = {

        /**
         * Opens an OAuth2 authentication flow for connecting to a cryptocurrency exchange.
         *
         * This method initiates the OAuth2 authorization process by opening a new window
         * or redirecting the user to the exchange's authorization page. After the user
         * grants permission, they will be redirected back to your application with the
         * necessary credentials to complete the wallet connection.
         *
         * @param exchange The exchange to authenticate with (currently supports 'coinbase').
         * @param options OAuth2 flow configuration options:
         * @param hooks Optional callback hooks:
         * @param popupOptions Optional window customization:
         * @param windowRef Optional window reference (defaults to global window)
         *
         * @example
         * const webClient = new BluvoWebClient('org-123', 'project-456');
         * await webClient.oauth2.openWindow('coinbase', {
         *   walletId: 'user-coinbase-wallet',
         *   idem: 'oauth-flow-123'
         * }, {
         *   onWindowClose: () => console.log('Window closed')
         * }, {
         *   title: 'Connect to Coinbase',
         *   width: 600,
         *   height: 700
         * });
         */
        async openWindow(
            exchange: 'coinbase',
            options: {
                walletId: string;
                idem: string;
            },
            hooks?: {
                onWindowClose?: () => void;

                // instead those two will be used on .listen
                // onComplete?: (walletId: string) => void;
                // onError?: (error: any) => void;
            },
            popupOptions?: {
                title?: string;
                width?: number;
                height?: number;
                left?: number;
                top?: number;
            },
            windowRef?: Window | undefined
        ) {

            if (typeof windowRef === 'undefined') {
                if (typeof window === 'undefined') {
                    throw new Error('This method can only be called in a browser environment');
                }
                windowRef = window;
            }

            const {
                url,
                success
            } = await this
                .getURL(
                    exchange,
                    {
                        walletId: options.walletId,
                        idem: options.idem
                    }
                );

            if (!success) {
                throw new Error('Failed to generate OAuth2 URL');
            }

            // Set default window options
            const windowTitle = popupOptions?.title || `${exchange} OAuth`;
            const windowWidth = popupOptions?.width || 500;
            const windowHeight = popupOptions?.height || 600;

            // Calculate position: use provided values or center the window
            let left: number;
            let top: number;

            if (popupOptions?.left !== undefined && popupOptions?.top !== undefined) {
                // Use provided position
                left = popupOptions.left;
                top = popupOptions.top;
            } else {
                // Center the window on the screen
                const screenLeft = windowRef.screenLeft || windowRef.screenX || 0;
                const screenTop = windowRef.screenTop || windowRef.screenY || 0;
                const screenWidth = windowRef.screen.width;
                const screenHeight = windowRef.screen.height;

                left = screenLeft + (screenWidth - windowWidth) / 2;
                top = screenTop + (screenHeight - windowHeight) / 2;
            }

            const newWindow = windowRef.open(
                url,
                windowTitle,
                `width=${windowWidth},height=${windowHeight},left=${left},top=${top},status=yes,scrollbars=yes,resizable=yes`
            );

            if (!newWindow) {
                throw new Error('Failed to open OAuth2 window. Please allow pop-ups for this site.');
            }

            newWindow.focus();

            // Set up window close detection
            // FIXME: this is not working for all browsers for some we give false-positives
            // Set up window close detection
            if (hooks?.onWindowClose) {
                const CHECK_INTERVAL = 500;
                let hasCalledClose = false;

                const checkWindowClosed = () => {
                    try {
                        // Check if window is explicitly closed
                        if (newWindow.closed) {
                            if (!hasCalledClose) {
                                hasCalledClose = true;
                                clearInterval(intervalId);
                                hooks.onWindowClose!();
                            }
                            return true;
                        }
                        // Attempt to access a property to confirm state
                        void newWindow.location.href;
                        return false;
                    } catch (e:any) {
                        // SecurityError or DOMException code 18: window is open but cross-origin
                        if (e.name === 'SecurityError' || (e instanceof DOMException && e.code === 18)) {
                            return false;
                        }
                        // Other errors (e.g., TypeError) indicate the window is closed
                        if (!hasCalledClose) {
                            hasCalledClose = true;
                            clearInterval(intervalId);
                            hooks.onWindowClose!();
                        }
                        return true;
                    }
                };

                const intervalId = setInterval(checkWindowClosed, CHECK_INTERVAL);

                // Return cleanup function
                return () => {
                    clearInterval(intervalId);
                    if (!hasCalledClose) {
                        try {
                            if (newWindow && !newWindow.closed) {
                                newWindow.close();
                            }
                        } catch (e) {
                            // Suppress cross-origin errors on close attempt
                            console.warn('Failed to close OAuth window:', e);
                        }
                    }
                };
            }

// Default cleanup if no hooks provided
            return () => {
                try {
                    if (newWindow && !newWindow.closed) {
                        newWindow.close();
                    }
                } catch (e) {
                    // Suppress cross-origin errors
                    console.warn('Failed to close OAuth window:', e);
                }
            }
        },

        /**
         * Generates a URL for the OAuth2 authentication flow.
         *
         * This method constructs a URL that can be used to redirect the user to the
         * exchange's authorization page. The user will authenticate and authorize
         * your application to access their account.
         *
         * @param exchange The exchange to authenticate with (currently supports 'coinbase').
         * @param walletId A unique identifier for this wallet connection.
         * @param idem A unique identifier for this specific OAuth2 flow instance.
         *
         * @returns A URL string that can be used to initiate the OAuth2 flow.
         */
        getURL : (
            exchange: 'coinbase' | 'kraken',
            {
                walletId,
                idem
            }: {
                walletId: string;
                idem: string;
            }
        ) => {
            return new OAuth2Api(this.configuration(walletId, undefined, idem))
                .oauth2exchangeurlgeturl(exchange, idem!)
        },
    }

    /**
     * Listen to a Momento topic for messages (generic version).
     *
     * This method provides a general-purpose subscription to Momento topics,
     * useful for any real-time messaging needs beyond OAuth2 flows.
     *
     * @param topicName The name of the topic to subscribe to
     * @param topicToken
     * @param options Subscription options including callbacks
     * @returns A subscription object that can be used to unsubscribe
     *
     * @example
     * // Listen to a custom topic
     * const subscription = await webClient.listen(
     *   'my-topic-123',
     *   topicInfo,
     *   {
     *     onMessage: (data) => {
     *       console.log('Received message:', data);
     *     },
     *     onError: (error) => {
     *       console.error('Subscription error:', error);
     *     }
     *   }
     * );
     *
     * // Later: unsubscribe
     * await webClient.unsubscribe('my-topic-123');
     */
    async listen(
        topicName: string,
        options: OAuth2Options | WithdrawOptions
    ): Promise<Subscription> {
        const onMessage = (rawData: any) => {
            // Extract the body if the message has a wrapper structure
            // WebSocket messages come in format: { messageId, idem, timestamp, body }
            // We need to extract the body which contains the actual WorkflowMessageBody
            const data: WorkflowMessageBody = (rawData && typeof rawData === 'object' && 'body' in rawData)
                ? rawData.body
                : rawData;

            // if success === true
            const success = data?.success === true;
            const failure = data?.success === false;
            const pending = typeof data?.success === 'undefined' || (!success && !failure);

            if (pending) {
                if (options.onStep) {
                    return options.onStep(data);
                }
                return;
            }

            if (data.type === WorkflowTypes.OAuth2Flow && !options.onOAuth2Complete) {
                throw new Error('received OAuth2 message but no onOAuth2Complete handler is defined');
            }

            if (data.type === WorkflowTypes.WithdrawFunds && !options.onWithdrawComplete) {
                throw new Error('received Withdraw message but no onWithdrawComplete handler is defined');
            }

            if (data.type === WorkflowTypes.OAuth2Flow) {
                if (success && data.walletId) {
                    return options.onOAuth2Complete?.(data);
                }
                if (failure) {
                    return options.onError?.(new Error(data.error || 'OAuth2 flow failed'));
                }
            }

            if (data.type === WorkflowTypes.WithdrawFunds) {
                if (success && data.walletId) {
                    return options.onWithdrawComplete?.(data);
                }
                if (failure) {
                    // handle better error
                    if (data.error && typeof data.error === 'object') {
                        // Handle new SerializedError format from backend
                        if (data.error.code && data.error.message) {
                            // Create error with proper name based on error code
                            const error = new Error(data.error.message);
                            error.name = data.error.code;
                            // Preserve original error data for debugging
                            (error as any).originalError = data.error;
                            (error as any).code = data.error.code;
                            return options.onError?.(error);
                        }
                        // Legacy error object format (backward compatibility)
                        else if (data.error.name || data.error.message) {
                            const error = new Error(data.error.message || 'Withdraw funds flow failed');
                            error.name = data.error.name || 'WithdrawError';
                            // Preserve original error data for debugging
                            (error as any).originalError = data.error;
                            return options.onError?.(error);
                        }
                    }
                    return options.onError?.(new Error(data.error || 'Withdraw funds flow failed'));
                }
            }
        }

        return this.wsClient.subscribe(
            topicName,
            this.orgId,
            this.wsBase,
            {
                onError: options.onError,
                onMessage: onMessage,
            }
        )
    }

    /**
     * Unsubscribe from a topic.
     * 
     * @param topicName The name of the topic to unsubscribe from
     */
    async unsubscribe(topicName: string) {
        return this.wsClient.unsubscribe(topicName);
    }

    /**
     * Unsubscribe from all active topics.
     */
    async unsubscribeAll() {
        return this.wsClient.unsubscribeAll();
    }

    /**
     * Check if currently subscribed to a topic.
     * 
     * @param topicName The topic name to check
     * @returns True if subscribed, false otherwise
     */
    isSubscribed(topicName: string): boolean {
        return this.wsClient.isSubscribed(topicName);
    }

    /**
     * Get the number of active subscriptions.
     * 
     * @returns Number of active subscriptions
     */
    getActiveSubscriptionCount(): number {
        return this.wsClient.getActiveSubscriptionCount();
    }

    /**
     * Creates and returns a properly configured API client configuration object.
     *
     * This private getter method centralizes the creation of API configuration objects,
     * ensuring consistent authentication and request handling across all API calls made
     * through this client. It automatically injects the organization ID and project ID
     * credentials that were provided when the client was initialized.
     *
     * The configuration includes:
     * - Authentication credentials for the Bluvo API
     * - Request middleware setup
     * - Response handling configuration
     * - Base URL and endpoint configuration
     *
     * @private
     * @returns A fully configured API configuration object ready for use with API clients
     */
    private configuration(walletId?:string, ott?:string, idem?:string) {
        const serverDev = new ServerConfiguration<{  }>("http://localhost:8787", {  })

        const baseServer = this.sandbox ?
            server2 :
            this.dev ? serverDev : server1;

        return createConfiguration({
            baseServer: baseServer,
            authMethods: {
                bluvoOtt: ott,
                bluvoOrgId: this.orgId,
                bluvoProjectId: this.projectId,
                bluvoWalletId: walletId,
                bluvoOttActionId: idem,
            },
        });
    }
}