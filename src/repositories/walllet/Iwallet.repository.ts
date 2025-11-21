import { Wallet, WalletTransaction } from "@prisma/client";

export interface IwalletRepositoy{
   createWallet(userId: number, currency: string): Promise<Wallet>;
    getWalletByUser(userId: number): Promise<Wallet | null>;
   
}