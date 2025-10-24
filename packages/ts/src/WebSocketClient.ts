import { WebSocketListener } from './WebsocketListener';

export interface SubscriptionOptions {
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

export interface Subscription {
    topicName: string;
    unsubscribe: () => void;
}

/**
 * WebSocketClient handles WebSocket subscriptions
 */
export class WebSocketClient {
    private activeSubscriptions = new Map<string, { listener: WebSocketListener; subscription: Subscription }>();
    
    /**
     * Subscribe to a WebSocket connection
     * @param topicName The identifier for this subscription (typically idem or quoteId)
     * @param orgId The organization ID
     * @param wsBase The WebSocket base URL
     * @param options Subscription options including callbacks
     * @returns A subscription object that can be used to unsubscribe
     */
    async subscribe(
        topicName: string,
        orgId: string,
        wsBase: string,
        options: SubscriptionOptions
    ): Promise<Subscription> {
        // Check if already subscribed to this topic
        if (this.activeSubscriptions.has(topicName)) {
            console.warn(`Already subscribed to topic: ${topicName}. Closing existing subscription.`);
            await this.unsubscribe(topicName);
        }

        // Validate inputs
        if (!topicName || topicName.trim().length === 0) {
            throw new Error(`Topic name cannot be empty`);
        }

        if (!orgId || orgId.trim().length === 0) {
            throw new Error(`Organization ID cannot be empty`);
        }

        if (!wsBase || wsBase.trim().length === 0) {
            throw new Error(`WebSocket base URL cannot be empty`);
        }

        try {
            // Create WebSocket listener
            const listener = new WebSocketListener();

            // Connect to WebSocket with message handlers
            await listener.connect(topicName, orgId, wsBase, {
                onMessage: (data) => {
                    try {
                        console.log(`Received message on topic ${topicName}:`, data);
                        options.onMessage(data);
                    } catch (error) {
                        console.error(`Error processing message on topic ${topicName}:`, error);
                        options.onError?.(error instanceof Error ? error : new Error(String(error)));
                    }
                },
                onError: (error) => {
                    console.error(`Subscription error on topic ${topicName}:`, error);
                    options.onError?.(error);
                    this.unsubscribe(topicName);
                },
                onClose: () => {
                    console.log(`WebSocket closed for topic ${topicName}`);
                    this.activeSubscriptions.delete(topicName);
                }
            });

            // Create subscription object
            const subscription: Subscription = {
                topicName,
                unsubscribe: () => {
                    listener.disconnect();
                    this.activeSubscriptions.delete(topicName);
                }
            };

            // Store the subscription and listener
            this.activeSubscriptions.set(topicName, { listener, subscription });
            console.log(`Successfully subscribed to topic: ${topicName}`);

            return subscription;
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
        const entry = this.activeSubscriptions.get(topicName);
        if (entry) {
            try {
                entry.subscription.unsubscribe();
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