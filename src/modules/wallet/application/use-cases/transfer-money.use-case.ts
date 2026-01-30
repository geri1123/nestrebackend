import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletRepository } from "../../infrastructure/persistence/wallet.repository";
import { WalletTransactionRepository } from "../../infrastructure/persistence/wallet-transaction.repository";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";
import { SupportedLang, t } from "../../../../locales";
import {type IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import {type IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.interface.repository";
import { WALLET_REPOSITORY_TOKENS } from "../../domain/repositories/wallet.repository.token";
@Injectable()
export class TransferMoneyUseCase {
  constructor(
   @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,
    
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY)
    private readonly walletTransactionRepo: IWalletTransactionRepository,
     
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