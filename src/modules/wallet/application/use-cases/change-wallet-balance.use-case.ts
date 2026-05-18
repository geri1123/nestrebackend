import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";
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
    @Inject("IWalletTransactionRepository") private readonly walletTransactionRepo: IWalletTransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: ChangeBalanceInput,
    tx?: Prisma.TransactionClient,
  ): Promise<{ balance: number; transactionId: string; alreadyProcessed?: boolean }> {
    const { userId, type, amount, language, externalPaymentId, externalProvider, description } = input;

    const run = async (db: Prisma.TransactionClient) => {
      const walletData = await db.wallet.findUnique({ where: { userId } });
      if (!walletData) throw new NotFoundException(t("walletNotFound", language));

      const wallet = WalletDomainEntity.fromPrisma(walletData);
      let newBalance: number;

      switch (type) {
        case WalletTransactionType.topup:
          newBalance = wallet.topup(amount);
          break;
        case WalletTransactionType.withdraw:
          newBalance = wallet.withdraw(amount);
          break;
        case WalletTransactionType.purchase:
          try {
            newBalance = wallet.purchase(amount);
          } catch {
            throw new BadRequestException(t("insufficientBalance", language));
          }
          break;
        default:
          throw new BadRequestException(t("invalidTransactionType", language));
      }

      try {
        const transaction = await db.walletTransaction.create({
          data: {
            walletId: walletData.id,
            type,
            amount,
            balanceAfter: newBalance,
            description: description ?? `${type} ${amount} EUR`,
            externalPaymentId,
            externalProvider,
          },
        });

        await db.wallet.update({
          where: { id: walletData.id },
          data: { balance: newBalance },
        });

        return { balance: newBalance, transactionId: transaction.id };
      } catch (err) {
        // P2002 = Unique constraint failed. Nëse u shkaktua nga externalPaymentId,
        // do të thotë që ky payment është proceseuar tashmë (idempotency te DB).
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          externalPaymentId
        ) {
          const existing = await db.walletTransaction.findUnique({
            where: { externalPaymentId },
          });
          if (existing) {
            return {
              balance: walletData.balance, // balanca aktuale, pa ndryshim
              transactionId: existing.id,
              alreadyProcessed: true,
            };
          }
        }
        throw err;
      }
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }
}