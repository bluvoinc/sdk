// THIS FILE IS ALSO COPY-PASTED IN @bluvo/sdk-ts PACKAGE

export enum WorkflowTypes {
	WithdrawFunds = 'withdraw',
	OAuth2Flow = 'oauth2',
	ConnectExchange = 'connect',
	QRCodeAuth = 'qr_code_auth',
}

export interface BaseWorkflowMessageBody {
	type: WorkflowTypes;
	success: boolean | undefined;
	error?: any;
}

export interface WithdrawFundsWorkflowMessageBody {
	type: WorkflowTypes.WithdrawFunds;
	walletId: string;
	transactionId?: string;
	quoteId?: string;

	step: string; // stepName
	stepIndex: number;
	totalSteps: number;
}

export interface OAuth2WorkflowMessageBody {
	type: WorkflowTypes.OAuth2Flow;
	walletId: string;
	exchange: string;
}

export interface ConnectExchangeWorkflowMessageBody {
	type: WorkflowTypes.ConnectExchange;
	walletId: string;

	step: string; // stepName
	stepIndex: number;
	totalSteps: number;
}

export interface QRCodeAuthWorkflowMessageBody {
	type: WorkflowTypes.QRCodeAuth;
	walletId: string;
	exchange: string;
	qrCodeUrl?: string;
	expiresAt?: number;
}

export type WorkflowMessageBody = BaseWorkflowMessageBody & (
	| WithdrawFundsWorkflowMessageBody
	| OAuth2WorkflowMessageBody
	| ConnectExchangeWorkflowMessageBody
	| QRCodeAuthWorkflowMessageBody
	);
