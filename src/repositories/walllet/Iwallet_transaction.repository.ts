import { wallet_transaction_type, WalletTransaction } from "@prisma/client";

export interface IwalletTransaction{
    createTransactionTx(
  tx: any,
  walletId: string,
  type: wallet_transaction_type,
  amount: number,
  balanceAfter: number,
  description?: string) :Promise<WalletTransaction>;
      getTransactions(
  walletId: string,
  page:number ,      
  limit:number       
): Promise<WalletTransaction[]> 
}