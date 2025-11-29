import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ChangeWalletBalanceUseCase } from "../use-cases/change-wallet-balance.use-case";
import { TransferMoneyUseCase } from "../use-cases/transfer-money.use-case";
import { wallet_transaction_type } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import { WalletRepository } from "../../../../repositories/walllet/wallet.repository";
import { WalletTransactionRepository } from "../../../../repositories/walllet/wallet-transaction.repository";
import { type IWalletRepository } from "../../domain/repositories/Iwallet.repository";
import {type  IWalletTransactionRepository } from "../../../../repositories/walllet/Iwallet-transaction.repository";

@Injectable()
export class WalletService {
  constructor(
    private readonly changeBalanceUseCase: ChangeWalletBalanceUseCase,
    private readonly transferMoneyUseCase: TransferMoneyUseCase,
  @Inject("IWalletRepository") private readonly walletRepo: IWalletRepository,
     @Inject("IWalletTransactionRepository") private readonly walletTransactionRepo: IWalletTransactionRepository,
  ) {}

  async changeWalletBalance(userId: number, type: wallet_transaction_type, amount: number, language: SupportedLang) {
    return this.changeBalanceUseCase.execute({ userId, type, amount, language });
  }

  async transferMoney(senderId: number, receiverId: number, amount: number, language: SupportedLang) {
    return this.transferMoneyUseCase.execute(senderId, receiverId, amount, language);
  }
async purchaseWithTransaction(
    userId: number,
    amount: number,
    language: SupportedLang,
    tx: any // Prisma transaction
  ) {
    return this.changeBalanceUseCase.execute(
      { userId, type: wallet_transaction_type.purchase, amount, language },
      tx
    );
  }
  async getWallet(
  userId: number,
  language: SupportedLang,
  page = 1,
  limit = 10
) {
  const wallet = await this.walletRepo.getWalletByUser(userId);
  if (!wallet) {
    throw new NotFoundException(t('walletNotFound', language));
  }
const [transactions, count] = await Promise.all([
  this.walletTransactionRepo.getTransactions(wallet.id, page, limit),
  this.walletTransactionRepo.countTransaction(wallet.id),
]);

 const totalPages = Math.ceil(count / limit);
 const itemsOnCurrentPage = Math.min(limit, count - (page - 1) * limit);
  return {
    wallet,
    transactions,
    totalCount:count,
   page,
   totalPages,
  itemsOnCurrentPage
  };
}
///create wallet
     async createWallet(userId: number, language: SupportedLang) {
   
    const existingWallet = await this.walletRepo.getWalletByUser(userId);
    if (existingWallet) {
     
      throw new BadRequestException(t("walletAlreadyExists", language));
    }

    
    try {
      const wallet = await this.walletRepo.createWallet(userId , "EUR");
      return wallet;
    } catch (error) {
      throw new Error(t("faildCreateWallet", language));
    }
  }
}