import { Prisma } from "@prisma/client";
import { WalletDomainEntity } from "../entities/wallet.entity";

export interface IWalletRepository {
  createWallet(userId: number, currency: string): Promise<WalletDomainEntity>;
  getWalletByUser(userId: number): Promise<WalletDomainEntity | null>;

  /** Gjej wallet brenda një transaksioni */
  findByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: number,
  ): Promise<WalletDomainEntity | null>;

  /** Inkrementon balancën atomikisht. Kthen balancën e re. */
  incrementBalanceTx(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
  ): Promise<number>;
getAllWallets(params?: {
  userId?: number;
  username?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: {
    id: string;
    userId: number;
    username?: string;
    balance: number;
    currency: string;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  totalPages: number;
}>;
  /**
   * Dekrementon balancën VETËM nëse balanca >= amount (atomik, në një SQL).
   * Kthen balancën e re, ose `null` nëse balanca është e pamjaftueshme.
   */
  decrementBalanceIfSufficientTx(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
  ): Promise<number | null>;
}