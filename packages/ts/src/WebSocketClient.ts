import {
    CredentialProvider,
    SubscribeCallOptions,
    TopicClient,
    TopicSubscribe,
    TopicSubscribeResponse
} from '@gomomento/sdk-web';
import { TopicManager } from './TopicManager';

export interface SubscriptionOptions {
    cacheName?: string;
    onMessage: (data: any) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
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
     * @param topicInfo Topic information including authentication token
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
        
        // Create credential provider from token
        const credentialProvider = CredentialProvider.fromString(topicToken);
        
        // Create Momento client
        const client = new TopicClient({ credentialProvider });
        
        // Default cache name
        const cacheName = options.cacheName || 'oauth2';
        
        // Configure subscription options
        const subscribeOptions: SubscribeCallOptions = {
            onItem: (item: any) => {
                try {
                    // Parse the message data using TopicManager
                    const data = TopicManager.parseBufferInput(item.valueString());
                    console.log(`Received message on topic ${topicName}:`, data);
                    
                    // Call the message handler
                    options.onMessage(data);
                    
                    // Check if this is a completion message for OAuth flows
                    if (data?.success === true && data?.walletId) {
                        options.onComplete?.();
                    }
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
            const response = await client.subscribe(cacheName, topicName, subscribeOptions);
            
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