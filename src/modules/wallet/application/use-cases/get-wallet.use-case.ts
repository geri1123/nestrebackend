import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { WALLET_REPOSITORY_TOKENS } from "../../domain/repositories/wallet.repository.token";
import {type IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import {type IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.interface.repository";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,

    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY)
    private readonly txRepo: IWalletTransactionRepository,
  ) {}

  async execute(userId: number, page: number, limit: number, lang: SupportedLang) {
    const wallet = await this.walletRepo.getWalletByUser(userId);
    if (!wallet) throw new NotFoundException(t("walletNotFound", lang));

    const [transactions, count] = await Promise.all([
      this.txRepo.getTransactions(wallet.id, page, limit),
      this.txRepo.countTransaction(wallet.id),
    ]);

    return {
      wallet,
      transactions,
      page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
    };
  }
}