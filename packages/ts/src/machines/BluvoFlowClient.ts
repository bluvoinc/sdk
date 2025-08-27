import {BluvoWebClient} from '../BluvoWebClient';
import {createFlowMachine} from './flowMachine';
import {Machine} from '../types/machine.types';
import {FlowActionType, FlowState} from '../types/flow.types';
import {TopicSubscribe} from '@gomomento/sdk-web';
import {WithdrawFundsWorkflowMessageBody, WorkflowMessageBody, WorkflowTypes} from '../WorkflowTypes';
import {WITHDRAWAL_EXECUTION_ERROR_TYPES, WITHDRAWAL_QUOTATION_ERROR_TYPES} from '../ErrorTypes';

export interface BluvoFlowClientOptions {
  orgId: string;
  projectId: string;
  maxRetryAttempts?: number;
  topicToken?: string;
  cacheName?: string;
  // API function callbacks (to be implemented by the consumer)
  fetchWithdrawableBalanceFn: (walletId: string) => Promise<Array<{ asset: string; amount: string }>>;
  requestQuotationFn: (walletId: string, params: {
    asset: string;
    amount: string;
    address: string;
    network?: string;
    tag?: string;
    includeFee?: boolean;
  }) => Promise<{
    id: string;
    asset: string;
    amountWithFee?: number;
    amountNoFee?: number;
    destinationAddress: string;
    network?: string | null;
    tag?: string | null;
    estimatedFee?: number;
    estimatedTotal?: number;
    expiresAt: string;
  }>;
  executeWithdrawalFn: (walletId: string, idem: string, quoteId: string, params?: {
    twofa?: string;
    smsCode?: string;
  }) => Promise<{ workflowRunId: string }>;
  mkUUIDFn?: () => string;
}

export interface WithdrawalFlowOptions {
  exchange: string;
  walletId: string;
  asset: string;
  amount: string;
  destinationAddress: string;
  network?: string;
  tag?: string;
  includeFee?: boolean;
}

export class BluvoFlowClient {
  private webClient: BluvoWebClient;
  private flowMachine?: Machine<FlowState, FlowActionType>;
  private subscription?: TopicSubscribe.Subscription;
  private generateId: () => string;

  constructor(private options: BluvoFlowClientOptions) {
    this.webClient = BluvoWebClient.createClient({
      orgId: options.orgId,
      projectId: options.projectId
    });
    this.generateId = options.mkUUIDFn || (() => crypto.randomUUID());
  }

  async startWithdrawalFlow(flowOptions: WithdrawalFlowOptions) {
    // Dispose any existing flow
    this.dispose();

    // Create new flow machine
    this.flowMachine = createFlowMachine({
      orgId: this.options.orgId,
      projectId: this.options.projectId,
      maxRetryAttempts: this.options.maxRetryAttempts
    });

    // Generate idempotency key for OAuth flow
    const idem = this.generateId();

    // Start OAuth flow
    this.flowMachine.send({
      type: 'START_OAUTH',
      exchange: flowOptions.exchange,
      walletId: flowOptions.walletId,
      idem
    });

    // Subscribe to workflow messages
    this.subscription = await this.webClient.listen(idem, {
      topicToken: this.options.topicToken,
      cacheName: this.options.cacheName,
      onOAuth2Complete: (message) => {
        this.flowMachine?.send({
          type: 'OAUTH_COMPLETED',
          walletId: message.walletId
        });
        
        // Auto-proceed to wallet loading
        this.loadWallet(message.walletId);
      },
      onError: (error) => {
        this.flowMachine?.send({
          type: 'OAUTH_FAILED',
          error
        });
      }
    });

    // Open OAuth window
    const closeWindow = await this.webClient.oauth2.openWindow(
      flowOptions.exchange as 'coinbase',
      { walletId: flowOptions.walletId, idem },
      {
        onWindowClose: () => {
          const state = this.flowMachine?.getState();
          if (state?.type === 'oauth:processing') {
            this.flowMachine?.send({
              type: 'OAUTH_FAILED',
              error: new Error('OAuth window closed by user')
            });
          }
        }
      }
    );

    this.flowMachine.send({ type: 'OAUTH_WINDOW_OPENED' });

    // Store flow options for later use
    (this as any).flowOptions = flowOptions;

    return {
      machine: this.flowMachine,
      closeOAuthWindow: closeWindow
    };
  }

  private async loadWallet(walletId: string) {
    if (!this.flowMachine) return;

    this.flowMachine.send({ type: 'LOAD_WALLET' });

    try {
      const balances = await this.options.fetchWithdrawableBalanceFn(walletId);

      this.flowMachine.send({
        type: 'WALLET_LOADED',
        balances: balances.map(b => ({
          asset: b.asset,
          balance: b.amount
        }))
      });

      // Auto-proceed to quote request if we have flow options
      const flowOptions = (this as any).flowOptions as WithdrawalFlowOptions;
      if (flowOptions) {
        this.requestQuote(flowOptions);
      }
    } catch (error) {
      this.flowMachine.send({
        type: 'WALLET_FAILED',
        error: error instanceof Error ? error : new Error('Failed to load wallet')
      });
    }
  }

  private async requestQuote(options: WithdrawalFlowOptions) {
    if (!this.flowMachine) return;

    const state = this.flowMachine.getState();
    if (!state.context.walletId) return;

    this.flowMachine.send({
      type: 'REQUEST_QUOTE',
      asset: options.asset,
      amount: options.amount,
      destinationAddress: options.destinationAddress,
      network: options.network
    });

    try {
      const quote = await this.options.requestQuotationFn(
        state.context.walletId,
        {
          asset: options.asset,
          amount: options.amount,
          address: options.destinationAddress,
          network: options.network,
          tag: options.tag,
          includeFee: options.includeFee
        }
      );

      this.flowMachine.send({
        type: 'QUOTE_RECEIVED',
        quote: {
          id: quote.id,
          asset: quote.asset,
          amount: String(quote.amountNoFee),
          estimatedFee: String(quote.estimatedFee),
          estimatedTotal: String(quote.estimatedTotal),
          expiresAt: new Date(quote.expiresAt).getTime()
        }
      });

      // Set up quote expiration timer
      const expiresIn = new Date(quote.expiresAt).getTime() - Date.now();
      if (expiresIn > 0) {
        setTimeout(() => {
          const currentState = this.flowMachine?.getState();
          if (currentState?.type === 'quote:ready' && currentState.context.quote?.id === quote.id) {
            this.flowMachine?.send({ type: 'QUOTE_EXPIRED' });
          }
        }, expiresIn);
      }
    } catch (error: any) {
      const errorType = error.type || error.response?.data?.type;
      let flowError = error;

      if (errorType) {
        switch (errorType) {
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE:
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE_CANNOT_COVER_FEE:
            flowError = new Error('Insufficient balance');
            break;
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM:
            flowError = new Error('Amount below minimum');
            break;
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_ABOVE_MAXIMUM:
            flowError = new Error('Amount above maximum');
            break;
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.INVALID_ADDRESS:
            flowError = new Error('Invalid destination address');
            break;
          case WITHDRAWAL_QUOTATION_ERROR_TYPES.NETWORK_NOT_SUPPORTED:
            flowError = new Error('Network not supported');
            break;
        }
      }

      this.flowMachine.send({
        type: 'QUOTE_FAILED',
        error: flowError instanceof Error ? flowError : new Error('Failed to get quote')
      });
    }
  }

  async executeWithdrawal(quoteId: string) {
    if (!this.flowMachine) return;

    const state = this.flowMachine.getState();
    if (!state.context.walletId || state.type !== 'quote:ready') return;

    // Start withdrawal process
    this.flowMachine.send({
      type: 'START_WITHDRAWAL',
      quoteId
    });
    
    if (this.subscription) {
      await this.webClient.unsubscribe((this.subscription as any).topicName);
    }

    this.subscription = await this.webClient.listen(quoteId, {
      topicToken: this.options.topicToken,
      cacheName: this.options.cacheName,
      onWithdrawComplete: (message: any) => {
        if (message.success && message.type === WorkflowTypes.WithdrawFunds) {
          // TODO: once u store transactions check for transactionId as well
          // if (message.transactionId) {
            this.flowMachine?.send({
              type: 'WITHDRAWAL_COMPLETED',
              transactionId: message.transactionId
            });
          // }
        }
      },
      onStep: (message: WorkflowMessageBody) => {
        if (message.type === WorkflowTypes.WithdrawFunds) {
          const withdrawMessage = message as WithdrawFundsWorkflowMessageBody;
          this.flowMachine?.send({
            type: 'WITHDRAWAL_PROGRESS',
            message: withdrawMessage.step
          });
        }
      },
      // on error should check if the error is recoverable (i.e. requires 2FA, SMS, KYC, etc)
      onError: (error) => {
        console.error("errore ricevuto", error);
        
        // Ensure we have a proper Error object with a message
        let fatalError: Error;
        if (!error) {
          fatalError = new Error('Unknown withdrawal error occurred');
        } else {
          fatalError = error;
        }

        console.log("will send fatal error", fatalError);
        this.flowMachine?.send({
          type: 'WITHDRAWAL_FATAL',
          error: fatalError
        });
      }
    });

    // Execute withdrawal
    try {
      await this.options.executeWithdrawalFn(
        state.context.walletId,
        quoteId,
        quoteId,
        {}
      );
    } catch (error: any) {

      // IMMEDIATE ERRROR HANDLING (i.e. wrong schema type, network error, etc)
      console.error("executeWithdrawal error", error);

      const errorType = error.type || error.response?.data?.type;
      
      switch (errorType) {
        case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED:
          this.flowMachine.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });
          break;
        case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED:
          this.flowMachine.send({ type: 'WITHDRAWAL_REQUIRES_SMS' });
          break;
        case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED:
          this.flowMachine.send({ type: 'WITHDRAWAL_REQUIRES_KYC' });
          break;
        case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE:
          this.flowMachine.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });
          break;
        case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED:
          this.flowMachine.send({ type: 'QUOTE_EXPIRED' });
          break;
        default:
          this.flowMachine.send({
            type: 'WITHDRAWAL_FATAL',
            error: error instanceof Error ? error : new Error('Failed to execute withdrawal')
          });
      }
    }
  }

  async submit2FA(code: string) {
    if (!this.flowMachine) return;
    
    const state = this.flowMachine.getState();
    if (state.type !== 'withdraw:error2FA') return;

    this.flowMachine.send({
      type: 'SUBMIT_2FA',
      code
    });

    // Re-execute withdrawal with 2FA code
    const quote = state.context.quote;
    if (quote && state.context.walletId) {
      const idem = this.generateId();
      
      try {
        await this.options.executeWithdrawalFn(
          state.context.walletId,
          idem,
          quote.id,
          { twofa: code }
        );
      } catch (error: any) {
        // Handle errors same as in executeWithdrawal
        this.handleWithdrawalError(error);
      }
    }
  }

  async submitSMS(code: string) {
    if (!this.flowMachine) return;
    
    const state = this.flowMachine.getState();
    if (state.type !== 'withdraw:errorSMS') return;

    this.flowMachine.send({
      type: 'SUBMIT_SMS',
      code
    });

    // Re-execute withdrawal with SMS code
    const quote = state.context.quote;
    if (quote && state.context.walletId) {
      const idem = this.generateId();
      
      try {
        await this.options.executeWithdrawalFn(
          state.context.walletId,
          idem,
          quote.id,
          { smsCode: code }
        );
      } catch (error: any) {
        this.handleWithdrawalError(error);
      }
    }
  }

  async retryWithdrawal() {
    if (!this.flowMachine) return;
    
    const state = this.flowMachine.getState();
    if (state.type !== 'withdraw:retrying') return;

    this.flowMachine.send({ type: 'RETRY_WITHDRAWAL' });

    // Re-execute withdrawal with new idempotency key
    const quote = state.context.quote;
    if (quote) {
      await this.executeWithdrawal(quote.id);
    }
  }

  private handleWithdrawalError(error: any) {
    const errorType = error.response?.data?.type;
    
    switch (errorType) {
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED:
        this.flowMachine?.send({ type: 'WITHDRAWAL_REQUIRES_2FA' });
        break;
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED:
        this.flowMachine?.send({ type: 'WITHDRAWAL_REQUIRES_SMS' });
        break;
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED:
        this.flowMachine?.send({ type: 'WITHDRAWAL_REQUIRES_KYC' });
        break;
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE:
        this.flowMachine?.send({ type: 'WITHDRAWAL_INSUFFICIENT_BALANCE' });
        break;
      case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED:
        this.flowMachine?.send({ type: 'QUOTE_EXPIRED' });
        break;
      default:
        this.flowMachine?.send({
          type: 'WITHDRAWAL_FATAL',
          error: error instanceof Error ? error : new Error('Failed to execute withdrawal')
        });
    }
  }

  getState() {
    return this.flowMachine?.getState();
  }

  subscribe(listener: (state: FlowState) => void) {
    return this.flowMachine?.subscribe(listener) || (() => {});
  }

  cancel() {
    this.flowMachine?.send({ type: 'CANCEL_FLOW' });
    this.dispose();
  }

  dispose() {
    if (this.subscription) {
      this.webClient.unsubscribe((this.subscription as any).topicName);
      this.subscription = undefined;
    }
    
    if (this.flowMachine) {
      this.flowMachine.dispose();
      this.flowMachine = undefined;
    }
  }
}