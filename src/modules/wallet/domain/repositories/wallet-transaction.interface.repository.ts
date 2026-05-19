import { Prisma, WalletTransactionType, WalletTransaction } from "@prisma/client";

export interface CreateTransactionData {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  externalPaymentId?: string;
  externalProvider?: string;
}

export interface IWalletTransactionRepository {
  createTransactionTx(
    tx: Prisma.TransactionClient,
    data: CreateTransactionData,
  ): Promise<WalletTransaction>;

  findByExternalPaymentIdTx(
    tx: Prisma.TransactionClient,
    externalPaymentId: string,
  ): Promise<WalletTransaction | null>;

  getTransactions(walletId: string, page?: number, limit?: number): Promise<WalletTransaction[]>;
  countTransaction(walletId: string): Promise<number>;
}