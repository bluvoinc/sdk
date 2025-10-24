export interface WebSocketListenerOptions {
  onMessage: (data: any) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class WebSocketListener {
  private ws: WebSocket | null = null;
  private messageHandler?: (data: any) => void;
  private errorHandler?: (error: Error) => void;
  private closeHandler?: () => void;

  async connect(idem: string, orgId: string, wsBase: string, options?: WebSocketListenerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${wsBase}/v0/ws/oauth2/listen?idem=${encodeURIComponent(idem)}&orgId=${encodeURIComponent(orgId)}`;

      this.ws = new WebSocket(url);

      // Store handlers if provided
      if (options) {
        this.messageHandler = options.onMessage;
        this.errorHandler = options.onError;
        this.closeHandler = options.onClose;
      }

      this.ws.onopen = () => {
        console.log(`[WebSocket] Connected: idem=${idem}`);
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error(`[WebSocket] Connection error:`, error);
        const errorObj = new Error('WebSocket connection failed');
        if (this.errorHandler) {
          this.errorHandler(errorObj);
        }
        reject(errorObj);
      };

      this.ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          data = event.data;
        }

        console.log(`[WebSocket] Message received:`, data);

        if (this.messageHandler) {
          this.messageHandler(data);
        }
      };

      this.ws.onclose = () => {
        console.log(`[WebSocket] Connection closed`);
        if (this.closeHandler) {
          this.closeHandler();
        }
      };
    });
  }

  async waitForMessage(): Promise<{ latency: number; data: any }> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const startTime = performance.now();

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket message timeout'));
      }, 30000);

      const messageHandler = (event: MessageEvent) => {
        const latency = performance.now() - startTime;
        clearTimeout(timeout);
        this.ws?.removeEventListener('message', messageHandler);

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          data = event.data;
        }

        console.log(`[WebSocket] Message received in ${latency.toFixed(2)}ms`);
        resolve({ latency, data });
      };

      this.ws.addEventListener('message', messageHandler);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.messageHandler = undefined;
      this.errorHandler = undefined;
      this.closeHandler = undefined;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
