import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletTransactionType } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import { ChangeWalletBalanceUseCase } from "./change-wallet-balance.use-case";

@Injectable()
export class TransferMoneyUseCase {
  constructor(
    private readonly changeBalance: ChangeWalletBalanceUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    senderUserId: number,
    receiverWalletId: string,
    amount: number,
    language: SupportedLang,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // gjej wallet-in e receiver
      const receiverWallet = await tx.wallet.findUnique({
        where: {
          id: receiverWalletId,
        },
      });

      if (!receiverWallet) {
        throw new NotFoundException(
          t("walletNotFound", language),
        );
      }

      // mos lejo transfer te vetja
      if (receiverWallet.userId === senderUserId) {
        throw new BadRequestException(
          t("cannotTransferToSelf", language),
        );
      }

      // debit sender
      await this.changeBalance.execute(
        {
          userId: senderUserId,
          type: WalletTransactionType.withdraw,
          amount,
          language,
          description: `Transfer to wallet ${receiverWalletId}`,
        },
        tx,
      );

      // credit receiver
      await this.changeBalance.execute(
        {
          userId: receiverWallet.userId,
          type: WalletTransactionType.topup,
          amount,
          language,
          description: `Transfer from user ${senderUserId}`,
        },
        tx,
      );
    });
  }
}