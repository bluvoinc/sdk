import type {WalletwithdrawbalancebalanceResponse} from "../../generated";
import type {StateValue} from "./machine.types";

type Network =
    WalletwithdrawbalancebalanceResponse["balances"][number]["networks"][number];

type ChainId = Network["chainId"];
type TokenAddress = Network["tokenAddress"];

export type FlowStateType =
    | "idle"
    | "exchanges:loading"
    | "exchanges:ready"
    | "exchanges:error"
    | "oauth:waiting"
    | "oauth:processing"
    | "oauth:completed"
    | "oauth:error"
    | "oauth:fatal"
    | "oauth:window_closed_by_user"
    | "qrcode:waiting"
    | "qrcode:displaying"
    | "qrcode:scanning"
    | "qrcode:error"
    | "qrcode:timeout"
    | "qrcode:fatal"
    | "wallet:loading"
    | "wallet:ready"
    | "wallet:error"
    | "quote:requesting"
    | "quote:ready"
    | "quote:expired"
    | "quote:error"
    | "withdraw:idle"
    | "withdraw:processing"
    | "withdraw:error2FA"
    | "withdraw:error2FAMultiStep"
    | "withdraw:errorSMS"
    | "withdraw:errorKYC"
    | "withdraw:errorBalance"
    | "withdraw:retrying"
    | "withdraw:readyToConfirm"
    | "withdraw:completed"
    | "withdraw:blocked"
    | "withdraw:fatal"
    | "flow:cancelled";

export interface FlowContext {
    orgId: string;
    projectId: string;
    autoRefreshQuotation?: boolean;
    lastQuoteRequest?: {
        asset: string;
        amount: string;
        destinationAddress: string;
        network?: string;
        tag?: string;
        includeFee?: boolean;
    };
    exchanges?: Array<{
        id: string;
        name: string;
        logoUrl: string;
        status: string;
    }>;
    exchange?: string;
    walletId?: string;
    walletBalances?: Array<{
        asset: string;
        balance: string;
        balanceInFiat?: string;
        networks?: Array<{
            id: string;
            name: string;
            displayName: string;
            minWithdrawal: string;
            maxWithdrawal?: string;
            assetName: string;
            addressRegex?: string | null;
        }>;
        extra?: {
            slug?: string;
            assetId?: string;
        };
    }>;
    quote?: {
        id: string;
        asset: string;
        amount: string;
        estimatedFee: string;
        estimatedTotal: string;

        amountWithFeeInFiat: string;
        amountNoFeeInFiat: string;
        estimatedFeeInFiat: string;

        additionalInfo: {
            minWithdrawal: string | null;
            maxWithdrawal?: string | null;
        };

        expiresAt: number;
    };
    withdrawal?: {
        id: string;
        status: string;
        transactionId?: string;
    };
    retryAttempts: number;
    maxRetryAttempts: number;
    idempotencyKey?: string;
    topicName?: string;
    invalid2FAAttempts?: number;
    oauthErrorType?: 'recoverable' | 'fatal';
    errorDetails?: {
        valid2FAMethods?: string[];
    };
    // QR Code flow context
    qrCodeUrl?: string;
    qrCodeExpiresAt?: number;
    isQRCodeFlow?: boolean;
    // Multi-step 2FA context (for Binance Web and similar)
    multiStep2FA?: {
        bizNo: string;
        steps: Array<{
            type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
            status: 'pending' | 'success' | 'failed';
            required: boolean;
            metadata?: {
                email?: string;
                emailSent?: boolean;
                qrCodeUrl?: string;
                qrCodeValidSeconds?: number;
            };
        }>;
        relation: 'AND' | 'OR';
        collectedCodes?: {
            twofa?: string;
            emailCode?: string;
            smsCode?: string;
        };
        faceQrCodeUrl?: string;
        faceQrCodeExpiresAt?: number;
        // MFA verified state (PRIMARY source of truth for verification status)
        mfa?: {
            verified: {
                GOOGLE?: boolean;
                EMAIL?: boolean;
                FACE?: boolean;
                SMS?: boolean;
            };
        };
    };
}

export type FlowState = StateValue<FlowStateType> & {
    context: FlowContext;
};

export type FlowActionType =
    | { type: "LOAD_EXCHANGES" }
    | {
    type: "EXCHANGES_LOADED";
    exchanges: Array<{
        id: string;
        name: string;
        logoUrl: string;
        status: string;
    }>;
}
    | { type: "EXCHANGES_FAILED"; error: Error }
    | { type: "START_OAUTH"; exchange: string; walletId: string; idem: string }
    | { type: "OAUTH_WINDOW_OPENED" }
    | { type: "OAUTH_COMPLETED"; walletId: string; exchange: string }
    | { type: "OAUTH_FAILED"; error: Error }
    | { type: "OAUTH_FATAL"; error: Error }
    | { type: "OAUTH_WINDOW_CLOSED_BY_USER"; error: Error }
    | { type: "LOAD_WALLET" }
    | {
    type: "WALLET_LOADED";
    balances: Array<{
        asset: string;
        balance: string;
        balanceInFiat?: string;
        networks?: Array<{
            id: string;
            name: string;
            displayName: string;
            minWithdrawal: string;
            maxWithdrawal?: string | undefined;
            assetName: string;

            addressRegex?: string;
            chainId?: ChainId;
            tokenAddress?: TokenAddress;
            contractAddress?: string | null;
            contractAddressVerified?: boolean | null;
        }>;
        extra?: {
            slug?: string;
            assetId?: string;
        };
    }>;
}
    | { type: "WALLET_FAILED"; error: Error }
    | {
    type: "REQUEST_QUOTE";
    asset: string;
    amount: string;
    destinationAddress: string;
    network?: string;
}
    | { type: "QUOTE_RECEIVED"; quote: FlowContext["quote"] }
    | { type: "QUOTE_EXPIRED" }
    | { type: "QUOTE_FAILED"; error: Error }
    | { type: "START_WITHDRAWAL"; quoteId: string }
    | { type: "WITHDRAWAL_PROGRESS"; message: string }
    | { type: "WITHDRAWAL_REQUIRES_2FA" }
    | { type: "WITHDRAWAL_REQUIRES_SMS" }
    | { type: "WITHDRAWAL_REQUIRES_KYC" }
    | { type: "WITHDRAWAL_2FA_INVALID" }
    | { type: "WITHDRAWAL_INSUFFICIENT_BALANCE" }
    | {
    type: "WITHDRAWAL_2FA_METHOD_NOT_SUPPORTED";
    result?: { valid2FAMethods?: string[] };
}
    | { type: "SUBMIT_2FA"; code: string }
    | { type: "SUBMIT_SMS"; code: string }
    | { type: "RETRY_WITHDRAWAL" }
    | { type: "WITHDRAWAL_SUCCESS"; transactionId?: string }
    | { type: "WITHDRAWAL_COMPLETED"; transactionId: string }
    | { type: "WITHDRAWAL_BLOCKED"; reason: string }
    | { type: "WITHDRAWAL_FATAL"; error: Error }
    | { type: "CANCEL_FLOW" }
    // QR Code actions
    | { type: "START_QRCODE"; exchange: string; walletId: string; idem: string }
    | { type: "QRCODE_URL_RECEIVED"; qrCodeUrl: string; expiresAt?: number }
    | { type: "QRCODE_SCANNED" }
    | { type: "QRCODE_COMPLETED"; walletId: string; exchange: string }
    | { type: "QRCODE_FAILED"; error: Error }
    | { type: "QRCODE_TIMEOUT" }
    | { type: "QRCODE_FATAL"; error: Error }
    | { type: "REFRESH_QRCODE" }
    // Multi-step 2FA actions
    | {
    type: "WITHDRAWAL_REQUIRES_2FA_MULTI_STEPS";
    result: {
        bizNo: string;
        steps: Array<{
            type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
            status: 'pending' | 'success' | 'failed';
            required: boolean;
            metadata?: {
                email?: string;
                emailSent?: boolean;
                qrCodeUrl?: string;
                qrCodeValidSeconds?: number;
            };
        }>;
        relation: 'AND' | 'OR';
        mfa?: {
            verified: {
                GOOGLE?: boolean;
                EMAIL?: boolean;
                FACE?: boolean;
                SMS?: boolean;
            };
        };
    };
    }
        | {
        type: "WITHDRAWAL_DRY_RUN_COMPLETE";
        result: {
            bizNo?: string;
            steps?: Array<{
                type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
                status: 'pending' | 'success' | 'failed';
                required: boolean;
                metadata?: {
                    email?: string;
                    emailSent?: boolean;
                    qrCodeUrl?: string;
                    qrCodeValidSeconds?: number;
                };
            }>;
            relation?: 'AND' | 'OR';
            mfa?: {
                verified: {
                    GOOGLE?: boolean;
                    EMAIL?: boolean;
                    FACE?: boolean;
                    SMS?: boolean;
                };
            };
        };
    }
    | { type: "CONFIRM_WITHDRAWAL" }
    | {
    type: "SUBMIT_2FA_MULTI_STEP";
    stepType: 'GOOGLE' | 'EMAIL' | 'SMS';
    code: string;
}
    | { type: "POLL_FACE_VERIFICATION" }
    | {
    type: "WITHDRAWAL_2FA_INCOMPLETE";
    result: {
        bizNo: string;
        steps: Array<{
            type: 'GOOGLE' | 'EMAIL' | 'FACE' | 'SMS';
            status: 'pending' | 'success' | 'failed';
            required: boolean;
            metadata?: {
                email?: string;
                emailSent?: boolean;
                qrCodeUrl?: string;
                qrCodeValidSeconds?: number;
            };
        }>;
        relation: 'AND' | 'OR';
        mfa?: {
            verified: {
                GOOGLE?: boolean;
                EMAIL?: boolean;
                FACE?: boolean;
                SMS?: boolean;
            };
        };
    };
};
