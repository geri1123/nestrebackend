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
type TransactionWithUser = Prisma.WalletTransactionGetPayload<{
  include: {
    wallet: {
      include: {
        user: {
          select: {
            id: true;
            username: true;
            email: true;
          };
        };
      };
    };
  };
}>;
export interface IWalletTransactionRepository {
  createTransactionTx(tx: Prisma.TransactionClient, data: CreateTransactionData): Promise<WalletTransaction>;
  findByExternalPaymentIdTx(tx: Prisma.TransactionClient, externalPaymentId: string): Promise<WalletTransaction | null>;
  getTransactions(walletId: string, page?: number, limit?: number): Promise<WalletTransaction[]>;
  countTransaction(walletId: string): Promise<number>;

  getAllTransactions(page: number, sortBy: "date" | "amount", order: "asc" | "desc" ,  type?: WalletTransactionType): Promise<TransactionWithUser[]>;
  countAllTransactions(type?: WalletTransactionType): Promise<number>;

  getUserTransactions(userId: number, page: number, sortBy: "date" | "amount", order: "asc" | "desc"): Promise<TransactionWithUser[]>;
  countUserTransactions(userId: number): Promise<number>;
}