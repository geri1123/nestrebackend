import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { WALLET_REPOSITORY_TOKENS } from "../../domain/repositories/wallet.repository.token";
import {type IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import {t,  SupportedLang } from "../../../../locales";

@Injectable()
export class CreateWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,
  ) {}

  async execute(userId: number, language: SupportedLang) {
    const existing = await this.walletRepo.getWalletByUser(userId);
    if (existing)
      throw new BadRequestException(t("walletAlreadyExists", language));

    return this.walletRepo.createWallet(userId, "EUR");
  }
}