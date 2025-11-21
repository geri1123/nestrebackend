import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { Prisma, PrismaClient, Wallet, wallet_transaction_type, WalletTransaction } from "@prisma/client";
import { IwalletRepositoy } from "./Iwallet.repository";
@Injectable()
export class WalletRepository implements IwalletRepositoy{
  constructor(private prisma: PrismaService) {}

  // Create a wallet for a user
  createWallet(userId: number, currency = "EUR"):Promise<Wallet> {
    return  this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency,
      },
    });
  }
//  async updateWalletBalance(walletId: string, newBalance: number) {
//     return this.prisma.wallet.update({
//       where: { id: walletId },
//       data: { balance: newBalance },
//     });
//   }
 updateWalletBalanceTx(tx: Prisma.TransactionClient, walletId: string, newBalance: number) {
  return tx.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance },
  });
}
  //Get wallet by user
   getWalletByUser(userId: number) {
    return this.prisma.wallet.findUnique({
      where: { userId },
    
    });
  }

  

 
}