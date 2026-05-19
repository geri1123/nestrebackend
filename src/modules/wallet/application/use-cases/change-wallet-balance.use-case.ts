import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletTransactionType, Prisma } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import { type IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import { type IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.interface.repository";

interface ChangeBalanceInput {
  userId: number;
  type: WalletTransactionType;
  amount: number;
  language: SupportedLang;
  externalPaymentId?: string;
  externalProvider?: string;
  description?: string;
}

@Injectable()
export class ChangeWalletBalanceUseCase {
  constructor(
    @Inject("IWalletRepository") private readonly walletRepo: IWalletRepository,
    @Inject("IWalletTransactionRepository")
    private readonly walletTransactionRepo: IWalletTransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: ChangeBalanceInput,
    tx?: Prisma.TransactionClient,
  ): Promise<{ balance: number; transactionId: string; alreadyProcessed?: boolean }> {
    const {
      userId, type, amount, language,
      externalPaymentId, externalProvider, description,
    } = input;

    if (amount <= 0) {
      throw new BadRequestException(t("invalidTransactionType", language));
    }

    const run = async (db: Prisma.TransactionClient) => {
      // 1. Pre-check idempotency
      if (externalPaymentId) {
        const existing = await this.walletTransactionRepo.findByExternalPaymentIdTx(
          db, externalPaymentId,
        );
        if (existing) {
          const w = await this.walletRepo.findByUserIdTx(db, userId);
          if (!w) throw new NotFoundException(t("walletNotFound", language));
          return {
            balance: w.getBalance(),
            transactionId: existing.id,
            alreadyProcessed: true,
          };
        }
      }

      // 2. Gjej wallet
      const wallet = await this.walletRepo.findByUserIdTx(db, userId);
      if (!wallet) {
        throw new NotFoundException(t("walletNotFound", language));
      }

      // 3. Përditëso balancën përmes repo-s (atomik)
      let newBalance: number;

      if (type === WalletTransactionType.topup) {
        newBalance = await this.walletRepo.incrementBalanceTx(db, wallet.id, amount);
      } else if (
        type === WalletTransactionType.withdraw ||
        type === WalletTransactionType.purchase
      ) {
        const result = await this.walletRepo.decrementBalanceIfSufficientTx(
          db, wallet.id, amount,
        );
        if (result === null) {
          throw new BadRequestException(t("insufficientBalance", language));
        }
        newBalance = result;
      } else {
        throw new BadRequestException(t("invalidTransactionType", language));
      }

      // 4. Krijo regjistrin e transaksionit
      try {
        const transaction = await this.walletTransactionRepo.createTransactionTx(db, {
          walletId: wallet.id,
          type,
          amount,
          balanceAfter: newBalance,
          description: description ?? `${type} ${amount} EUR`,
          externalPaymentId,
          externalProvider,
        });

        return { balance: newBalance, transactionId: transaction.id };
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          externalPaymentId
        ) {
          throw new BadRequestException("Payment already being processed");
        }
        throw err;
      }
    };

    return tx
      ? run(tx)
      : this.prisma.$transaction(run, { timeout: 15000, maxWait: 10000 });
  }
}