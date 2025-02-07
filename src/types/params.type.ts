import { TransactionLog } from 'src/entities/transaction-log.entity';
import { PaymentTypeEnum } from 'src/enums/payment-type.enum';

export type CreatePaymentChargeParams = {
  txId: string;
  source: string;
};

export type CreateTransactionStatusParams = CreatePaymentChargeParams & {
  paymentType: string;
  provider: string;
  providerRefId: string;
  status: string;
  transactionLogs: TransactionLog[];
  createdAt: Date;
};

export type CreatePaymentProviderDetailsParams = {
  provider: string;
  providerRefId: string;
};

export type SqsMessageParams = {
  userRef: string;
  tokenSymbol: string;
  coinValue: string;
  attribute: {
    transactionId: string;
    transactionType: string;
    serviceType: string;
    referenceId: string;
    note: string;
    couponCode: string;
    metadata: Record<string, string>;
    transferType: string;
  };
};

export type transactionMetadataParams = {
  tokenName: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenBonus: number;
  currency: string;
  price: number;
  qr_code?: any;
  card?: any;
};
