import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WalletRepository } from "../../repositories/walllet/wallet.repository";
import { SupportedLang, t } from "../../locales";
import { WalletTransactionRepository } from "../../repositories/walllet/wallet_transaction.repository";
import { wallet_transaction_type } from "@prisma/client";
@Injectable()
export class WalletService{
 constructor(
    private readonly walletRepo:WalletRepository,
    private readonly walletTransactionRepo:WalletTransactionRepository
){}  
 async changeWalletBalance(
  userId: number,
  type: wallet_transaction_type,
  amount: number,
  language:SupportedLang,
) {
  const wallet = await this.walletRepo.getWalletByUser(userId);
  if (!wallet) throw new NotFoundException("Wallet not found");

  if (amount <= 0) throw new BadRequestException("Amount must be positive");

  let newBalance = wallet.balance;

  if (type ===wallet_transaction_type.topup) {
    newBalance += amount;
  } else if (type === wallet_transaction_type.withdraw || type === wallet_transaction_type.purchase) {
    if (wallet.balance < amount) {
      throw new BadRequestException(t("insufficientBalance", language));
    }
    newBalance -= amount;
  } else {
    throw new BadRequestException(t("invalidTransactionType", language));
  }

  
  await this.walletRepo.updateWalletBalance(wallet.id, newBalance);
const sign = type === wallet_transaction_type.topup ? '+' : '-';
  // Create transaction
  await this.walletTransactionRepo.createTransaction(
    wallet.id,
    type,
    amount,
    newBalance,
    `${type} ${sign}${amount} EUR`
  );

  return { balance: newBalance };
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

  const transactions = await this.walletTransactionRepo.getTransactions(
    wallet.id,
    page,
    limit
  );

  return {
    wallet,
    transactions,
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

}