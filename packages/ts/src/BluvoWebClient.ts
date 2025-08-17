import {createConfiguration, OAuth2Api, PromiseConfigurationOptions} from "../generated";

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
    /**
     * Creates a new BluvoWebClient instance for browser environments.
     * 
     * @param orgId Your Bluvo organization identifier.
     * @param projectId Your Bluvo project identifier.
     */
    constructor(
        private readonly orgId: string,
        private readonly projectId: string
    ) {}



    static createClient(
        {orgId, projectId}: { orgId: string; projectId: string }
    ): BluvoWebClient {
        return new BluvoWebClient(orgId, projectId);
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
         *   @param walletId - A unique identifier for this wallet connection
         *   @param idem - A unique identifier for this specific OAuth2 flow instance
         * @param hooks Optional callback hooks:
         *   @param onWindowClose - Called when the OAuth window is closed by the user
         * @param popupOptions Optional window customization:
         *   @param title - Window title (defaults to '{exchange}OAuth')
         *   @param width - Window width in pixels (defaults to 500)
         *   @param height - Window height in pixels (defaults to 600)
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
            },
            windowRef?: Window | undefined
        ) {

            if(typeof windowRef === 'undefined') {
                if (typeof window === 'undefined') {
                    throw new Error('This method can only be called in a browser environment');
                }
                windowRef = window;
            }

            const {
                url,
                success
            } = await this
                .getLink(
                    exchange,
                    {
                        walletId: options.walletId,
                        idem: options.idem
                    }
                );

            if (!success) {
                throw new Error('Failed to generate OAuth2 link');
            }

            // Set default window options
            const windowTitle = popupOptions?.title || `${exchange} OAuth`;
            const windowWidth = popupOptions?.width || 500;
            const windowHeight = popupOptions?.height || 600;
            
            const newWindow = windowRef.open(
                url,
                windowTitle,
                `width=${windowWidth},height=${windowHeight},status=yes,scrollbars=yes,resizable=yes`
            );
            
            if (!newWindow) {
                throw new Error('Failed to open OAuth2 window. Please allow pop-ups for this site.');
            }
            
            newWindow.focus();
            
            // Set up window close detection
            if (hooks?.onWindowClose) {
                const CHECK_INTERVAL = 500;
                const intervalId = setInterval(() => {
                    if (newWindow.closed) {
                        clearInterval(intervalId);
                        hooks.onWindowClose!();
                    }
                }, CHECK_INTERVAL);
                
                // Return cleanup function
                return () => {
                    clearInterval(intervalId);
                    if (!newWindow.closed) {
                        try {
                            newWindow.location.href = 'about:blank';
                        } catch {}
                        newWindow.close();
                    }
                };
            }
            
            return () => {
                if (!newWindow.closed) {
                    try {
                        newWindow.location.href = 'about:blank';
                    } catch {}
                    newWindow.close();
                }
            };
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
        getLink : (
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
                .oAuth2Link(exchange, idem!)
        }


        // listen is a function that uses MomentoTopic to subscribe to a topic and receive messages.
        // it can be used to listen for the WalletId/Completion/Error of an OAuth2 flow for example.
        // it works only if previously called client.ott.getWithSubscribe from the server-side SDK.
        //  that getWithSubscribe function will return an object like this:
        //  {{
        //   "idem": "c6b20b11-297a-4721-895b-c1a6abc1ea02",
        //   "ott": "eyJhbGciOiJIUzI1NiJ9.eyJvcmdJZCI6ImEyZTk4NDA5LWNkNjgtNDhjNC04NTNjLTczZDkyMjg3NjRjMCIsImlkZW0iOiJjN2UzNjViYS04MjRhLTQ1MWQtYjM3Ny04MDI2NzQ2MTdkZmMiLCJpYXQiOjE3NTMyMDEzMDQsImV4cCI6MTc1MzIwNDkwNH0.xwwx-Jl1ij1S1vufBfAI8btytCr_9skTqFTPPh5qVOI",
        //   "topic": {
        //     "success": true,
        //     "name": "c6b20b11-297a-4721-895b-c1a6abc1ea02",
        //     "token": "eyJlbmRwb2ludCI6ImNlbGwtNC11cy13ZXN0LTItMS5wcm9kLmEubW9tZW50b2hxLmNvbSIsImFwaV9rZXkiOiJleUpoYkdjaU9pSklVekkxTmlKOS5leUp6ZFdJaU9pSm1iRzlBWW14MWRtOHVZMjhpTENKMlpYSWlPakVzSW5BaU9pSkZhRWxMUlVKSlQwTkJTV0ZEUVc5SFlqSkdNV1JIWjNsSlowRTlJbjAuU0Y2M3NHWkoxYUdKckJpRVZCdXZlbG9pOEFWWkNFVzd1ZnNOUklGYUx5dyJ9",
        //     "expiresAt": 1752425364044
        //   }
        // }
        //  the idem is the same that will be used by the openWindow method
        //  the ott can be used for other API calls that require authentication from UI.
        //  the topic.name is the same as idem
        //  the topic.token is required by MomentoTopic to subscribe to the topic!
        // implement the listen method so that it can be used to subscribe to a momento topic, and have 2 hooks:
        //  onComplete: (walletId: string) => void;
        //  onError: (error: any) => void;
        // can create a WebSocketClient class to be used to handle subscriptions with MomentoTopic

    }


    /**
     * Creates and returns a properly configured API client configuration object.
     *
     * This private getter method centralizes the creation of API configuration objects,
     * ensuring consistent authentication and request handling across all API calls made
     * through this client. It automatically injects the organization ID and API key
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
        return createConfiguration({
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