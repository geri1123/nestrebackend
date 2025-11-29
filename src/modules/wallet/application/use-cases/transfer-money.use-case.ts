import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletRepository } from "../../../../repositories/walllet/wallet.repository";
import { WalletTransactionRepository } from "../../../../repositories/walllet/wallet-transaction.repository";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";
import { SupportedLang, t } from "../../../../locales";
import {type IWalletRepository } from "../../domain/repositories/Iwallet.repository";
import {type IWalletTransactionRepository } from "../../../../repositories/walllet/Iwallet-transaction.repository";
@Injectable()
export class TransferMoneyUseCase {
  constructor(
   @Inject("IWalletRepository") private readonly walletRepo: IWalletRepository,
     @Inject("IWalletTransactionRepository") private readonly walletTransactionRepo: IWalletTransactionRepository
     ,
    private readonly prisma: PrismaService
  ) {}

  async execute(
    senderId: number,
    receiverId: number,
    amount: number,
    language: SupportedLang
  ) {
  
    const [senderWallet, receiverWallet] = await Promise.all([
      this.walletRepo.getWalletByUser(senderId),
      this.walletRepo.getWalletByUser(receiverId),
    ]);

    if (!senderWallet || !receiverWallet) {
      throw new NotFoundException(t("walletNotFound", language));
    }

    
    try {
      senderWallet.withdraw(amount);
      receiverWallet.topup(amount);

      // 3️⃣ Transactional update
      await this.prisma.$transaction(async (tx) => {
        // Update balances
        await this.walletRepo.updateWalletBalanceTx(tx, senderWallet.id, senderWallet.getBalance());
        await this.walletRepo.updateWalletBalanceTx(tx, receiverWallet.id, receiverWallet.getBalance());

        // Create wallet transactions
        await this.walletTransactionRepo.createTransactionTx(
          tx,
          senderWallet.id,
          "withdraw",
          amount,
          senderWallet.getBalance(),
          `Transfer to user ${receiverId}`
        );

        await this.walletTransactionRepo.createTransactionTx(
          tx,
          receiverWallet.id,
          "topup",
          amount,
          receiverWallet.getBalance(),
          `Transfer from user ${senderId}`
        );
      });
    } catch (error: any) {
      if (error.message === "Insufficient balance") {
        throw new BadRequestException(t("insufficientBalance", language));
      }
      throw error;
    }
  }
}