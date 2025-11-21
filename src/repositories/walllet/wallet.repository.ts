import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { Wallet, wallet_transaction_type, WalletTransaction } from "@prisma/client";
import { IwalletRepositoy } from "./Iwallet.repository";
@Injectable()
export class WalletRepository implements IwalletRepositoy{
  constructor(private prisma: PrismaService) {}

  // Create a wallet for a user
  async createWallet(userId: number, currency = "EUR"):Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency,
      },
    });
  }
 async updateWalletBalance(walletId: string, newBalance: number) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });
  }
  //Get wallet by user
  async getWalletByUser(userId: number) {
    return this.prisma.wallet.findUnique({
      where: { userId },
    
    });
  }

  

 
}