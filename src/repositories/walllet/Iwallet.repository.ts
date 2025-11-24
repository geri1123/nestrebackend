import { Wallet, Prisma } from "@prisma/client";

export interface IWalletRepository {
  
  updateWalletBalanceTx(
    tx: Prisma.TransactionClient, 
    walletId: string,
    newBalance: number
  ): Promise<Wallet>;

  
  getWalletByUser(userId: number): Promise<Wallet | null>;


  getWalletForTx?(tx: Prisma.TransactionClient, userId: number): Promise<Wallet | null>;
}