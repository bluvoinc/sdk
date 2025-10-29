import {BluvoWebClient} from '../BluvoWebClient';
import {createFlowMachine} from './flowMachine';
import {Machine} from '../types/machine.types';
import {FlowActionType, FlowState} from '../types/flow.types';
import {Subscription} from '../WebSocketClient';
import {WithdrawFundsWorkflowMessageBody, WorkflowMessageBody, WorkflowTypes} from '../WorkflowTypes';
import {
    ERROR_CODES,
    WITHDRAWAL_EXECUTION_ERROR_TYPES,
    WITHDRAWAL_QUOTATION_ERROR_TYPES,
    extractErrorCode,
    extractErrorResult
} from '../error-codes';
import {
    Walletwithdrawbalancebalance200ResponseBalancesInner,
    Walletwithdrawquotequotation200Response
} from "../../generated";
import {
    Walletwithdrawquoteidexecutewithdraw200Response
} from "../../generated";
import {Walletwithdrawbalancebalance200Response} from "../../generated";
import {
    type ListCentralizedExchangesResponse,
    ListCentralizedExchangesResponseStatusEnum,
    Wallet, WithdrawableBalance, WithdrawableBalanceNetwork
} from "../types/api.types";

export interface BluvoFlowClientOptions {
    orgId: string;
    projectId: string;
    listExchangesFn: (status?: ListCentralizedExchangesResponseStatusEnum) => Promise<ListCentralizedExchangesResponse['exchanges']>;
    fetchWithdrawableBalanceFn: (walletId: string) => Promise<Walletwithdrawbalancebalance200Response>;
    requestQuotationFn: (walletId: string, params: {
        asset: string;
        amount: string;
        address: string;
        network?: string;
        tag?: string;
        includeFee?: boolean;
    }) => Promise<Walletwithdrawquotequotation200Response>;
    executeWithdrawalFn: (walletId: string, idem: string, quoteId: string, params?: {
        twofa?: string;
        smsCode?: string;
    }) => Promise<Walletwithdrawquoteidexecutewithdraw200Response>;
    getWalletByIdFn: (walletId: string) => Promise<Pick<Wallet,'id'|'exchange'> | null>;
    mkUUIDFn?: () => string;
    onWalletConnectedFn?: (walletId: string, exchange: string) => any;

    options?: {
        sandbox?: boolean;
        dev?: boolean;
        maxRetryAttempts?: number;
        autoRefreshQuotation?: boolean;
        customDomain?: string | "api-bluvo.com" | {
            api: string;
            ws: string;
        }
    }
}

export interface WithdrawalFlowOptions {
    exchange: string;
    walletId: string;
    popupOptions?: {
        title?: string;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
    };
}

export interface ResumeWithdrawalFlowOptions {
    exchange: string;
    walletId: string;
}

export interface QuoteRequestOptions {
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
    private subscription?: Subscription;
    private generateId: () => string;
    private quoteRefreshTimer?: ReturnType<typeof setTimeout>;

    constructor(private options: BluvoFlowClientOptions) {

        this.webClient = BluvoWebClient.createClient({
            orgId: options.orgId,
            projectId: options.projectId,
            sandbox: options.options?.sandbox,
            dev: options.options?.dev,
            customDomain: options.options?.customDomain
        });

        this.generateId = options.mkUUIDFn || (() => crypto.randomUUID());
    }

    async loadExchanges(status?: ListCentralizedExchangesResponseStatusEnum) {
        if (!this.flowMachine) {
            // Create flow machine if it doesn't exist
            this.flowMachine = createFlowMachine({
                orgId: this.options.orgId,
                projectId: this.options.projectId,
                maxRetryAttempts: this.options.options?.maxRetryAttempts,
                autoRefreshQuotation: this.options.options?.autoRefreshQuotation
            });
        }

        this.flowMachine.send({type: 'LOAD_EXCHANGES'});

        try {
            const exchanges = await this.options.listExchangesFn(status);
            this.flowMachine.send({
                type: 'EXCHANGES_LOADED',
                exchanges
            });
            return exchanges;
        } catch (error) {
            this.flowMachine.send({
                type: 'EXCHANGES_FAILED',
                error: error instanceof Error ? error : new Error('Failed to load exchanges')
            });
            throw error;
        }
    }

    async startWithdrawalFlow(flowOptions: WithdrawalFlowOptions) {
        // Check if wallet already exists
        try {
            const existingWallet = await this.options.getWalletByIdFn(flowOptions.walletId);
            if (existingWallet) {
                // Wallet exists, redirect to resumeWithdrawalFlow
                return this.resumeWithdrawalFlow({
                    exchange: existingWallet.exchange,
                    walletId: flowOptions.walletId
                });
            }
        } catch (error) {
            // If getWalletByIdFn fails, continue with normal flow
            console.warn('Error checking wallet existence:', error);
        }

        // Dispose any existing flow
        this.dispose();

        // Create new flow machine
        this.flowMachine = createFlowMachine({
            orgId: this.options.orgId,
            projectId: this.options.projectId,
            maxRetryAttempts: this.options.options?.maxRetryAttempts,
            autoRefreshQuotation: this.options.options?.autoRefreshQuotation
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
            onOAuth2Complete: (message) => {
                this.flowMachine?.send({
                    type: 'OAUTH_COMPLETED',
                    walletId: message.walletId,
                    exchange: message.exchange,
                });

                // Call the onWalletConnected hook if provided
                if (this.options.onWalletConnectedFn) {
                    this.options.onWalletConnectedFn(message.walletId, message.exchange);
                }

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
            {
                walletId: flowOptions.walletId,
                idem
            },
            {
                onWindowClose: () => {
                    // const state = this.flowMachine?.getState();
                    // if (state?.type === 'oauth:processing') {
                    //     this.flowMachine?.send({
                    //         type: 'OAUTH_WINDOW_CLOSED_BY_USER',
                    //         error: new Error('OAuth window closed by user')
                    //     });
                    // }
                }
            },
            flowOptions.popupOptions
        );

        this.flowMachine.send({type: 'OAUTH_WINDOW_OPENED'});

        return {
            machine: this.flowMachine,
            closeOAuthWindow: closeWindow
        };
    }

    async resumeWithdrawalFlow(flowOptions: ResumeWithdrawalFlowOptions) {
        // Dispose any existing flow
        this.dispose();

        // Create new flow machine
        this.flowMachine = createFlowMachine({
            orgId: this.options.orgId,
            projectId: this.options.projectId,
            maxRetryAttempts: this.options.options?.maxRetryAttempts,
            autoRefreshQuotation: this.options.options?.autoRefreshQuotation
        });

        // We need to transition through the states properly
        // First, start OAuth flow to set up context
        this.flowMachine.send({
            type: 'START_OAUTH',
            exchange: flowOptions.exchange,
            walletId: flowOptions.walletId,
            idem: this.generateId()
        });

        // Then mark OAuth as completed
        this.flowMachine.send({
            type: 'OAUTH_WINDOW_OPENED'
        });

        // Complete OAuth
        this.flowMachine.send({
            type: 'OAUTH_COMPLETED',
            walletId: flowOptions.walletId,
            exchange: flowOptions.exchange,
        });

        // Call the onWalletConnected hook if provided
        if (this.options.onWalletConnectedFn) {
            this.options.onWalletConnectedFn(flowOptions.walletId, flowOptions.exchange);
        }

        // Load wallet immediately
        this.loadWallet(flowOptions.walletId);

        return {
            machine: this.flowMachine
        };
    }

    private async loadWallet(walletId: string) {
        if (!this.flowMachine) {
            return;
        }

        this.flowMachine.send({type: 'LOAD_WALLET'});

        try {
            const withdrawableBalanceInfo = await this.options.fetchWithdrawableBalanceFn(walletId);
            this.flowMachine.send({
                type: 'WALLET_LOADED',
                balances: withdrawableBalanceInfo.balances.map((b:WithdrawableBalance) => ({
                    asset: b.asset,
                    balance: String(b.amount),
                    networks: b.networks.map((n:WithdrawableBalanceNetwork) => ({
                        id: n.id,
                        name: n.name,
                        displayName: n.displayName,
                        minWithdrawal: n.minWithdrawal,
                        maxWithdrawal: n.maxWithdrawal,
                        assetName: n.assetName,
                        // Only include optional fields if they have meaningful values (not null or undefined)
                        ...(n.addressRegex !== null && n.addressRegex !== undefined ? {addressRegex: n.addressRegex} : {}),
                        ...(n.chainId !== null && n.chainId !== undefined ? {chainId: n.chainId} : {}),
                        ...(n.tokenAddress !== null && n.tokenAddress !== undefined ? {tokenAddress: n.tokenAddress} : {}),
                        ...(n.contractAddress !== null && n.contractAddress !== undefined ? {contractAddress: n.contractAddress} : {}),
                        // contractAddressVerified defaults to true if null or undefined
                        contractAddressVerified: n.contractAddressVerified ?? true
                    })),

                    // if amountInFiat is present (including 0), include balanceInFiat
                    ...(b.amountInFiat !== undefined ? {
                        balanceInFiat: String(b.amountInFiat),
                    } : {})
                }))
            });
        } catch (error) {
            this.flowMachine.send({
                type: 'WALLET_FAILED',
                error: error instanceof Error ? error : new Error('Failed to load wallet')
            });
        }
    }

    async requestQuote(options: QuoteRequestOptions) {
        if (!this.flowMachine) {
            return undefined;
        }

        const state = this.flowMachine.getState();
        if (!state.context.walletId) {
            return undefined;
        }

        console.log('[SDK] requestQuote called, current state:', state.type, 'amount:', options.amount);

        this.flowMachine.send({
            type: 'REQUEST_QUOTE',
            asset: options.asset,
            amount: options.amount,
            destinationAddress: options.destinationAddress,
            network: options.network
        });

        console.log('[SDK] REQUEST_QUOTE action sent to state machine');

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

            console.log('[SDK] Backend returned quote with ID:', quote.id,
                'ExpiresAt:', quote.expiresAt);

            const quoteData = {
                id: quote.id,
                asset: quote.asset,
                amount: String(quote.amountNoFee),
                estimatedFee: String(quote.estimatedFee),
                estimatedTotal: String(quote.estimatedTotal),

                amountWithFeeInFiat: String(quote.amountWithFeeInFiat),
                amountNoFeeInFiat: String(quote.amountNoFeeInFiat),
                estimatedFeeInFiat: String(quote.estimatedFeeInFiat),

                additionalInfo: quote.additionalInfo,

                expiresAt: new Date(quote.expiresAt).getTime()
            };

            console.log('[SDK] Sending QUOTE_RECEIVED action with new quote ID:', quoteData.id,
                'ExpiresAt:', new Date(quoteData.expiresAt).toLocaleTimeString());

            this.flowMachine.send({
                type: 'QUOTE_RECEIVED',
                quote: quoteData
            });

            // Clear any existing quote refresh timer
            if (this.quoteRefreshTimer) {
                clearTimeout(this.quoteRefreshTimer);
            }

            // Set up quote expiration timer
            const expiresIn = new Date(quote.expiresAt).getTime() - Date.now();
            if (expiresIn > 0) {
                this.quoteRefreshTimer = setTimeout(() => {
                    const currentState = this.flowMachine?.getState();
                    if (currentState?.type === 'quote:ready' && currentState.context.quote?.id === quote.id) {
                        // Check if auto-refresh is enabled
                        const autoRefresh = currentState.context.autoRefreshQuotation !== undefined
                            ? currentState.context.autoRefreshQuotation
                            : true; // Default to true

                        if (autoRefresh && currentState.context.lastQuoteRequest) {
                            // Auto-refresh the quote
                            console.log('[SDK] Quote expired, auto-refreshing...');
                            this.requestQuote(currentState.context.lastQuoteRequest);
                        } else {
                            // No auto-refresh, transition to expired state
                            console.log('[SDK] Quote expired, transitioning to expired state');
                            this.flowMachine?.send({type: 'QUOTE_EXPIRED'});
                        }
                    }
                }, expiresIn);
            }

            // return the quote
            return {
                rawQuote: quote,
                quoteData,
            };
        } catch (error: any) {
            // Extract error code from new format or legacy format
            const errorCode = extractErrorCode(error) || error.code || error.type || error.response?.data?.type;
            let flowError = error;

            if (errorCode) {
                switch (errorCode) {
                    case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
                    case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE_FOR_FEE:
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.INSUFFICIENT_BALANCE_CANNOT_COVER_FEE: // Legacy compatibility
                        flowError = new Error('Insufficient balance');
                        break;
                    case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_BELOW_MINIMUM: // Legacy compatibility
                        flowError = new Error('Amount below minimum');
                        break;
                    case ERROR_CODES.WITHDRAWAL_AMOUNT_ABOVE_MAXIMUM:
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.AMOUNT_ABOVE_MAXIMUM: // Legacy compatibility
                        flowError = new Error('Amount above maximum');
                        break;
                    case ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS:
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.INVALID_ADDRESS: // Legacy compatibility
                        flowError = new Error('Invalid destination address');
                        break;
                    case ERROR_CODES.WITHDRAWAL_NETWORK_NOT_SUPPORTED:
                    case WITHDRAWAL_QUOTATION_ERROR_TYPES.NETWORK_NOT_SUPPORTED: // Legacy compatibility
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
            await this.webClient.unsubscribe(this.subscription.topicName);
        }

        this.subscription = await this.webClient.listen(quoteId, {
            onWithdrawComplete: (message: any) => {
                console.log("onWithdrawComplete received:", message);

                // {
                //     "type": "withdraw",
                //     "success": true,
                //     "walletId": "a57f3fd3-0660-438c-8e4d-e781b414acfa",
                //     "step": "complete",
                //     "stepIndex": 4,
                //     "totalSteps": 4
                // }

                if (message.success && message.type === WorkflowTypes.WithdrawFunds) {
                    console.log("Withdrawal completed successfully, transitioning state machine");
                    console.log("Current flow machine state before completion:", this.flowMachine?.getState()?.type);

                    // First, send success to update the withdrawal machine state
                    this.flowMachine?.send({
                        type: 'WITHDRAWAL_SUCCESS',
                        transactionId: message.transactionId || message.walletId || 'completed'
                    });

                    // Then send completion action
                    this.flowMachine?.send({
                        type: 'WITHDRAWAL_COMPLETED',
                        transactionId: message.transactionId || message.walletId || 'completed'
                    });

                    // Log current state after sending actions
                    const currentState = this.flowMachine?.getState();
                    console.log("Flow machine state after completion actions:", currentState?.type);
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
                // Extract error code from new format or legacy format
                const errorCode = extractErrorCode(error);

                // Handle new error codes
                switch (errorCode) {
                    case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
                        this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_2FA'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
                        this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_SMS'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_2FA_INVALID:
                        this.flowMachine?.send({type: 'WITHDRAWAL_2FA_INVALID'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
                        this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_KYC'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
                        this.flowMachine?.send({type: 'WITHDRAWAL_INSUFFICIENT_BALANCE'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_INVALID_ADDRESS:
                        this.flowMachine?.send({
                            type: 'WITHDRAWAL_FATAL',
                            error: new Error('Invalid destination address')
                        });
                        return;

                    case ERROR_CODES.WITHDRAWAL_AMOUNT_BELOW_MINIMUM:
                        this.flowMachine?.send({type: 'WITHDRAWAL_FATAL', error: new Error('Amount below minimum')});
                        return;

                    case ERROR_CODES.QUOTE_EXPIRED:
                        this.flowMachine?.send({type: 'QUOTE_EXPIRED'});
                        return;

                    case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
                        this.flowMachine?.send({
                            type: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',
                            result: extractErrorResult(error)
                        });
                        return;
                }

                console.error("Unhandled withdrawal error", error);

                // Send WITHDRAWAL_FATAL to trigger the fatal state transition
                this.flowMachine?.send({
                    type: 'WITHDRAWAL_FATAL',
                    error: error
                });
            }
        });

        // Execute withdrawal
        try {
            return await this.options.executeWithdrawalFn(
                state.context.walletId,
                quoteId,
                quoteId,
                {}
            );
        } catch (error: any) {
            // IMMEDIATE ERROR HANDLING (i.e. wrong schema type, network error, etc)
            console.error("executeWithdrawal error", error);

            // Extract error code from new format or legacy format
            const errorCode = extractErrorCode(error) || error.code || error.type || error.response?.data?.type;

            switch (errorCode) {
                case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
                case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED: // Legacy compatibility
                    this.flowMachine.send({type: 'WITHDRAWAL_REQUIRES_2FA'});
                    break;
                case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
                case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED: // Legacy compatibility
                    this.flowMachine.send({type: 'WITHDRAWAL_REQUIRES_SMS'});
                    break;
                case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
                case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED: // Legacy compatibility
                    this.flowMachine.send({type: 'WITHDRAWAL_REQUIRES_KYC'});
                    break;
                case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
                case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
                    this.flowMachine.send({type: 'WITHDRAWAL_INSUFFICIENT_BALANCE'});
                    break;
                case ERROR_CODES.QUOTE_EXPIRED:
                case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED: // Legacy compatibility
                    this.flowMachine.send({type: 'QUOTE_EXPIRED'});
                    break;
                case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
                    this.flowMachine.send({
                        type: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',
                        result: extractErrorResult(error)
                    });
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
                return await this.options.executeWithdrawalFn(
                    state.context.walletId,
                    idem,
                    quote.id,
                    {twofa: code}
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
                return await this.options.executeWithdrawalFn(
                    state.context.walletId,
                    idem,
                    quote.id,
                    {smsCode: code}
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

        this.flowMachine.send({type: 'RETRY_WITHDRAWAL'});

        // Re-execute withdrawal with new idempotency key
        const quote = state.context.quote;
        if (quote) {
            return await this.executeWithdrawal(quote.id);
        }
    }

    private handleWithdrawalError(error: any) {
        // Extract error code from new format or legacy format
        const errorCode = extractErrorCode(error) || error.code || error.response?.data?.type;

        switch (errorCode) {
            case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_TOTP:
            case WITHDRAWAL_EXECUTION_ERROR_TYPES.TWO_FACTOR_REQUIRED: // Legacy compatibility
                this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_2FA'});
                break;
            case ERROR_CODES.WITHDRAWAL_2FA_REQUIRED_SMS:
            case WITHDRAWAL_EXECUTION_ERROR_TYPES.SMS_CODE_REQUIRED: // Legacy compatibility
                this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_SMS'});
                break;
            case ERROR_CODES.WITHDRAWAL_KYC_REQUIRED:
            case WITHDRAWAL_EXECUTION_ERROR_TYPES.KYC_REQUIRED: // Legacy compatibility
                this.flowMachine?.send({type: 'WITHDRAWAL_REQUIRES_KYC'});
                break;
            case ERROR_CODES.WITHDRAWAL_INSUFFICIENT_BALANCE:
            case WITHDRAWAL_EXECUTION_ERROR_TYPES.INSUFFICIENT_BALANCE: // Legacy compatibility
                this.flowMachine?.send({type: 'WITHDRAWAL_INSUFFICIENT_BALANCE'});
                break;
            case ERROR_CODES.QUOTE_EXPIRED:
            case WITHDRAWAL_EXECUTION_ERROR_TYPES.RESOURCE_EXHAUSTED: // Legacy compatibility
                this.flowMachine?.send({type: 'QUOTE_EXPIRED'});
                break;
            case ERROR_CODES.WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED:
                this.flowMachine?.send({
                    type: 'WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED',
                    result: extractErrorResult(error)
                });
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
        return this.flowMachine?.subscribe(listener) || (() => {
        });
    }

    cancel() {
        this.flowMachine?.send({type: 'CANCEL_FLOW'});
        this.dispose();
    }

    dispose() {
        if (this.quoteRefreshTimer) {
            clearTimeout(this.quoteRefreshTimer);
            this.quoteRefreshTimer = undefined;
        }

        if (this.subscription) {
            this.webClient.unsubscribe(this.subscription.topicName);
            this.subscription = undefined;
        }

        if (this.flowMachine) {
            this.flowMachine.dispose();
            this.flowMachine = undefined;
        }
    }

    // TEST METHOD - For testing withdrawal completion without real transactions
    testWithdrawalComplete(transactionId?: string) {
        console.log("🧪 TEST: Simulating withdrawal completion");

        // Simulate the same message that would come from onWithdrawComplete
        const mockMessage = {
            type: "withdraw",
            success: true,
            walletId: "test-wallet-id-" + Date.now(),
            step: "complete",
            stepIndex: 4,
            totalSteps: 4,
            transactionId: transactionId || "test-transaction-" + Date.now()
        };

        // Execute the same logic as in onWithdrawComplete
        if (mockMessage.success && mockMessage.type === "withdraw") {
            console.log("🧪 TEST: Withdrawal completed successfully, transitioning state machine");
            console.log("🧪 TEST: Current flow machine state before completion:", this.flowMachine?.getState()?.type);

            // First, send success to update the withdrawal machine state
            this.flowMachine?.send({
                type: 'WITHDRAWAL_SUCCESS',
                transactionId: mockMessage.transactionId
            });

            // Then send completion action
            this.flowMachine?.send({
                type: 'WITHDRAWAL_COMPLETED',
                transactionId: mockMessage.transactionId
            });

            // Log current state after sending actions
            const currentState = this.flowMachine?.getState();
            console.log("🧪 TEST: Flow machine state after completion actions:", currentState?.type);
        }
    }
}