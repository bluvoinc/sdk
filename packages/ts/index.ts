import { BluvoWebClient } from './src/BluvoWebClient';
import { BluvoClient } from './src/BluvoClient';

export { BluvoWebClient } from './src/BluvoWebClient';
export { BluvoClient } from './src/BluvoClient';
export { WebSocketClient } from './src/WebSocketClient';
export type { TopicInfo } from './src/WebSocketClient';

/**
 * Create a fully configured Bluvo SDK client instance with a single function call.
 *
 * This is the recommended entry point for integrating the Bluvo SDK into your application.
 * It creates and initializes a client with your organization credentials, handling all the
 * necessary setup and authentication configuration automatically.
 *
 * The client provides access to all Bluvo API functionality through an intuitive, hierarchical
 * interface organized by domain (prices, wallets, transactions, etc.), making it easy to discover
 * and use the capabilities you need.
 *
 * @param credentials An object containing your Bluvo API credentials:
 *   @param orgId Your unique organization identifier provided during Bluvo onboarding.
 *                This identifies your organization across all projects and API calls.
 *   @param projectId The specific project identifier within your organization.
 *                    Different projects can be used for different applications or environments.
 *   @param apiKey Your secret API key that authorizes requests to the Bluvo API.
 *                 Handle this credential securely and never expose it in client-side code.
 *
 * @returns A fully initialized BluvoClient instance ready to make API calls.
 *
 * @example
 * // Create a new client instance
 * const bluvo = createClient({
 *   orgId: 'your-org-id',
 *   projectId: 'your-project-id',
 *   apiKey: 'your-api-key'
 * });
 *
 * // The client is ready to use
 * const btcPrice = await bluvo.prices.candlesticks('BTC', 'USDT');
 */
export function createClient(
    {orgId, projectId, apiKey}: { orgId: string; projectId: string; apiKey: string }
) {
    return BluvoClient.createClient({orgId, projectId, apiKey});
}

// createWebClient
/**
 * Create a BluvoWebClient instance for browser-based applications.
 *
 * This client is designed for use in web environments where you want to interact with
 * the Bluvo API without exposing sensitive API keys directly in client-side code.
 * It provides methods for OAuth2 authentication flows and other browser-specific features.
 *
 * @param orgId Your Bluvo organization identifier.
 * @param projectId Your Bluvo project identifier.
 *
 * @returns A new BluvoWebClient instance configured for your organization and project.
 */
export function createWebClient(
    {orgId, projectId}: { orgId: string; projectId: string }
): BluvoWebClient {
    return BluvoWebClient.createClient({orgId, projectId});
}