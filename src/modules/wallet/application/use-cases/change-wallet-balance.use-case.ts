import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import {  WalletRepository } from "../../infrastructure/persistence/wallet.repository";
import { WalletTransactionRepository } from "../../infrastructure/persistence/wallet-transaction.repository";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";
import { wallet_transaction_type, WalletTransaction } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import {type IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import { type IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.interface.repository";

interface ChangeBalanceInput {
  userId: number;
  type: wallet_transaction_type;
  amount: number;
  language: SupportedLang;
}

@Injectable()
export class ChangeWalletBalanceUseCase {
  constructor(
   @Inject("IWalletRepository") private readonly walletRepo: IWalletRepository,
    @Inject("IWalletTransactionRepository") private readonly walletTransactionRepo: IWalletTransactionRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(
  input: ChangeBalanceInput,
  tx?: any
): Promise<{ balance: number; transactionId: string }> {
  const { userId, type, amount, language } = input;

  const walletData = tx
    ? await tx.wallet.findUnique({ where: { userId } })
    : await this.walletRepo.getWalletByUser(userId);

  if (!walletData) throw new NotFoundException(t("walletNotFound", language));

  const wallet = WalletDomainEntity.fromPrisma(walletData);
  let newBalance: number;

  switch (type) {
    case wallet_transaction_type.topup:
      newBalance = wallet.topup(amount);
      break;
    case wallet_transaction_type.withdraw:
      newBalance = wallet.withdraw(amount);
      break;
  case wallet_transaction_type.purchase:
    try {
      newBalance = wallet.purchase(amount);
    } catch (err) {
      throw new BadRequestException(t("insufficientBalance", language));
    }
    break;
    default:
      throw new BadRequestException(t("invalidTransactionType", language));
  }

let transaction:any;
if (tx) {
  transaction = await this.walletTransactionRepo.createTransactionTx(
    tx,
    walletData.id,
    type,
    amount,
    newBalance,
    `${type} ${amount} EUR`
  );
  await this.walletRepo.updateWalletBalanceTx(tx, walletData.id, newBalance);
} else {
  transaction = await this.prisma.$transaction(async (tx) => {
    const tnx = await this.walletTransactionRepo.createTransactionTx(
      tx,
      walletData.id,
      type,
      amount,
      newBalance,
      `${type} ${amount} EUR`
    );
    await this.walletRepo.updateWalletBalanceTx(tx, walletData.id, newBalance);
    return tnx;
  });
}

  return { balance: newBalance, transactionId: transaction.id };
}
}