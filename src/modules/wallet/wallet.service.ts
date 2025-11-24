import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WalletRepository } from "../../repositories/walllet/wallet.repository";
import { SupportedLang, t } from "../../locales";
import { WalletTransactionRepository } from "../../repositories/walllet/wallet_transaction.repository";
import { Prisma, wallet_transaction_type } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
@Injectable()
export class WalletService{
 constructor(
    private readonly walletRepo:WalletRepository,
    private readonly walletTransactionRepo:WalletTransactionRepository,
    private readonly prisma: PrismaService
){}
async changeWalletBalance(
  userId: number,
  type: wallet_transaction_type,
  amount: number,
  language: SupportedLang,
  tx?: Prisma.TransactionClient
): Promise<{ balance: number; transactionId: string }> {  
  const wallet = tx 
    ? await this.walletRepo.getWalletForTx(tx, userId) 
    : await this.walletRepo.getWalletByUser(userId);

  if (!wallet) throw new NotFoundException(t("walletNotFound", language));
  if (amount <= 0) throw new BadRequestException("Amount must be positive");

  let newBalance = wallet.balance;

  if (type === wallet_transaction_type.topup) newBalance += amount;
  else if (type === wallet_transaction_type.withdraw || type === wallet_transaction_type.purchase) {
    if (wallet.balance < amount) throw new BadRequestException(t("insufficientBalance", language));
    newBalance -= amount;
  } else {
    throw new BadRequestException(t("invalidTransactionType", language));
  }

  const sign = type === wallet_transaction_type.topup ? "+" : "-";

  let transaction;
  if (tx) {
    transaction = await this.walletTransactionRepo.createTransactionTx(
      tx,
      wallet.id,
      type,
      amount,
      newBalance,
      `${type} ${sign}${amount} EUR`
    );
    await this.walletRepo.updateWalletBalanceTx(tx, wallet.id, newBalance);
  } else {
    await this.prisma.$transaction(async t => {
      transaction = await this.walletTransactionRepo.createTransactionTx(
        t,
        wallet.id,
        type,
        amount,
        newBalance,
        `${type} ${sign}${amount} EUR`
      );
      await this.walletRepo.updateWalletBalanceTx(t, wallet.id, newBalance);
    });
  }

  return { balance: newBalance, transactionId: transaction.id }; 
}
// async changeWalletBalance(
//   userId: number,
//   type: wallet_transaction_type,
//   amount: number,
//   language: SupportedLang,
// ) {
//   const wallet = await this.walletRepo.getWalletByUser(userId);
//   if (!wallet) throw new NotFoundException("Wallet not found");
//   if (amount <= 0) throw new BadRequestException("Amount must be positive");

//   let newBalance = wallet.balance;

//   if (type === wallet_transaction_type.topup) {
//     newBalance += amount;
//   } else if (type === wallet_transaction_type.withdraw || type === wallet_transaction_type.purchase) {
//     if (wallet.balance < amount) throw new BadRequestException(t("insufficientBalance", language));
//     newBalance -= amount;
//   } else {
//     throw new BadRequestException(t("invalidTransactionType", language));
//   }

//   const sign = type === wallet_transaction_type.topup ? "+" : "-";

//   // Prisma transaction
//   await this.prisma.$transaction(async (tx) => {
//   await this.walletRepo.updateWalletBalanceTx(tx, wallet.id, newBalance);
//   await this.walletTransactionRepo.createTransactionTx(
//     tx,
//     wallet.id,
//     type,
//     amount,
//     newBalance,
//     `${type} ${sign}${amount} EUR`
//   );
// });


//   return { balance: newBalance };
// }

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
      const wallet = await this.walletRepo.createWallet(userId);
      return wallet;
    } catch (error) {
      throw new Error(t("faildCreateWallet", language));
    }
  }
async transferMoney(senderId: number, receiverId: number, amount: number , language:SupportedLang) {
  const senderWallet = await this.walletRepo.getWalletByUser(senderId);
  const receiverWallet = await this.walletRepo.getWalletByUser(receiverId);

  if (!senderWallet || !receiverWallet) throw new Error(t("walletNotFound"  , language));
  if (senderWallet.balance < amount) throw new Error(t("insufficientBalance",language));

  await this.prisma.$transaction(async (tx) => {
    await this.walletRepo.updateWalletBalanceTx(tx, senderWallet.id, senderWallet.balance - amount);
    await this.walletRepo.updateWalletBalanceTx(tx, receiverWallet.id, receiverWallet.balance + amount);

    await this.walletTransactionRepo.createTransactionTx(tx, senderWallet.id, "withdraw", amount, senderWallet.balance - amount, `Transfer to user ${receiverId}`);
    await this.walletTransactionRepo.createTransactionTx(tx, receiverWallet.id, "topup", amount, receiverWallet.balance + amount, `Transfer from user ${senderId}`);
  });
}
}