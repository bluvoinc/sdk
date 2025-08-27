import {
    CredentialProvider,
    SubscribeCallOptions,
    TopicClient,
    TopicSubscribe,
    TopicSubscribeResponse
} from '@gomomento/sdk-web';
import {TopicManager} from './TopicManager';

export interface SubscriptionOptions {
    cacheName: string;
    onMessage: (data: any) => void;
    onError?: (error: Error) => void;
    onFatal?: (error: Error) => void;
}

export interface TopicInfo {
    success: boolean;
    name: string;
    token: string;
    expiresAt?: number;
}

/**
 * WebSocketClient handles WebSocket-like subscriptions using Momento Topics
 */
export class WebSocketClient {
    private activeSubscriptions = new Map<string, TopicSubscribe.Subscription>();
    
    /**
     * Subscribe to a Momento topic
     * @param topicName The name of the topic to subscribe to
     * @param topicToken
     * @param options Subscription options including callbacks
     * @returns A subscription object that can be used to unsubscribe
     */
    async subscribe(
        topicName: string,
        topicToken: string,
        options: SubscriptionOptions
    ): Promise<TopicSubscribe.Subscription> {
        // Check if already subscribed to this topic
        if (this.activeSubscriptions.has(topicName)) {
            console.warn(`Already subscribed to topic: ${topicName}. Closing existing subscription.`);
            await this.unsubscribe(topicName);
        }
        
        // Validate topic info
        if (!topicToken) {
            throw new Error(`Invalid topic info provided for subscription to ${topicName}`);
        }

        if (topicToken.trim().length === 0) {
            throw new Error(`Topic token cannot be empty for subscription to ${topicName}`);
        }
        
        // Create credential provider from token with better error handling
        let credentialProvider;
        try {
            // First decode and validate the token manually
            const decoded = atob(topicToken);
            const tokenData = JSON.parse(decoded);
            
            if (!tokenData.endpoint || !tokenData.api_key) {
                throw new Error('Token missing required fields: endpoint or api_key');
            }
            
            // Try creating the credential provider directly with the original token
            credentialProvider = CredentialProvider.fromString(topicToken);
        } catch (error) {
            // If the error is related to the 'replace' method, it might be an issue with the SDK
            // Let's try a workaround by reconstructing the token
            try {
                const decoded = atob(topicToken);
                const tokenData = JSON.parse(decoded);
                
                // Reconstruct the token to ensure clean encoding
                const cleanToken = btoa(JSON.stringify({
                    endpoint: tokenData.endpoint,
                    api_key: tokenData.api_key
                }));
                
                credentialProvider = CredentialProvider.fromString(cleanToken);
            } catch (fallbackError) {
                const errorMessage = `Failed to create credential provider from token for ${topicName}: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMessage);
                throw new Error(`${errorMessage}. Please check the token format or try updating the Momento SDK.`);
            }
        }
        
        // Create Momento client
        const client = new TopicClient({ credentialProvider });
        
        // TODO: Manually split cacheName per argument and per-tenant
        // Configure subscription options
        const subscribeOptions: SubscribeCallOptions = {
            onItem: (item: any) => {
                try {
                    // Parse the message data using TopicManager
                    const data = TopicManager.parseBufferInput(item.valueString());
                    console.log(`Received message on topic ${topicName}:`, data);
                    options.onMessage(data);
                } catch (error) {
                    console.error(`Error parsing message on topic ${topicName}:`, error);
                    options.onError?.(error instanceof Error ? error : new Error(String(error)));
                }
            },
            onError: (err: any, sub: any) => {
                console.error(`Subscription error on topic ${topicName}:`, err.message());
                options.onError?.(new Error(err.message()));
                this.unsubscribe(topicName);
            }
        };
        
        try {
            // Subscribe to the topic
            console.log(`Subscribing to topic: ${topicName}`);
            const response = await client.subscribe(options.cacheName, topicName, subscribeOptions);
            
            if (response.type === TopicSubscribeResponse.Subscription) {
                const subscription = response as TopicSubscribe.Subscription;
                this.activeSubscriptions.set(topicName, subscription);
                console.log(`Successfully subscribed to topic: ${topicName}`);
                return subscription;
            }
            
            throw new Error(`Failed to subscribe to topic ${topicName}: ${response.message()}`);
        } catch (error) {
            console.error(`Error subscribing to topic ${topicName}:`, error);
            throw error;
        }
    }
    
    /**
     * Unsubscribe from a topic
     * @param topicName The name of the topic to unsubscribe from
     */
    async unsubscribe(topicName: string): Promise<void> {
        const subscription = this.activeSubscriptions.get(topicName);
        if (subscription) {
            try {
                subscription.unsubscribe();
                this.activeSubscriptions.delete(topicName);
                console.log(`Successfully unsubscribed from topic: ${topicName}`);
            } catch (error) {
                console.error(`Error unsubscribing from topic ${topicName}:`, error);
            }
        }
    }
    
    /**
     * Unsubscribe from all active topics
     */
    async unsubscribeAll(): Promise<void> {
        const topics = Array.from(this.activeSubscriptions.keys());
        await Promise.all(topics.map(topic => this.unsubscribe(topic)));
    }
    
    
    /**
     * Check if subscribed to a topic
     * @param topicName The topic name to check
     * @returns True if subscribed, false otherwise
     */
    isSubscribed(topicName: string): boolean {
        return this.activeSubscriptions.has(topicName);
    }
    
    /**
     * Get the number of active subscriptions
     * @returns Number of active subscriptions
     */
    getActiveSubscriptionCount(): number {
        return this.activeSubscriptions.size;
    }
}