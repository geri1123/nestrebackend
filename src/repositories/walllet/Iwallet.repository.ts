import { Prisma } from "@prisma/client";
import { WalletDomainEntity } from "../../modules/wallet/domain/wallet.entity";

export interface IWalletRepository {
createWallet(userId: number, currency:string ): Promise<WalletDomainEntity>
  updateWalletBalanceTx(
    tx: Prisma.TransactionClient, 
    walletId: string,
    newBalance: number
  ): Promise<void>; // we don’t return Wallet anymore because domain entity handles logic

  getWalletByUser(userId: number): Promise<WalletDomainEntity | null>;

  getWalletForTx?(tx: Prisma.TransactionClient, userId: number): Promise<WalletDomainEntity | null>;
}