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
         *   @param hooks
         *   @param windowRef
         *
         * @example
         * const webClient = new BluvoWebClient('org-123', 'project-456');
         * await webClient.openOAuth2('coinbase', {
         *   walletId: 'user-coinbase-wallet',
         *   idem: 'oauth-flow-123'
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

            const newWindow = windowRef.open(
                url,
                `${exchange}OAuth`,
                'width=500,height=600,status=yes,scrollbars=yes,resizable=yes'
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