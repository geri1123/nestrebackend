
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma, Wallet, wallet_transaction_type } from "@prisma/client";
import { IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(private prisma: PrismaService) {}

  // Create a wallet for a user
  async createWallet(userId: number, currency = "EUR"): Promise<WalletDomainEntity> {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency,
      },
    });
    return WalletDomainEntity.fromPrisma(wallet);
  }

  // Get wallet for transaction (domain entity)
  async getWalletForTx(tx: Prisma.TransactionClient, userId: number): Promise<WalletDomainEntity | null> {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    return wallet ? WalletDomainEntity.fromPrisma(wallet) : null;
  }

  // Update balance in transaction
  async updateWalletBalanceTx(tx: Prisma.TransactionClient, walletId: string, newBalance: number): Promise<void> {
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });
  }

  
  async getWalletByUser(userId: number): Promise<WalletDomainEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet ? WalletDomainEntity.fromPrisma(wallet) : null;
  }
 

}