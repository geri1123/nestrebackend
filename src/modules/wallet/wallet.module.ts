import { Module } from "@nestjs/common";
import { WalletRepository } from "./infrastructure/persistence/wallet.repository";

import { WalletController } from "./wallet.controller";
import { WalletTransactionRepository } from "./infrastructure/persistence/wallet-transaction.repository";
import { ChangeWalletBalanceUseCase } from "./application/use-cases/change-wallet-balance.use-case";
import { TransferMoneyUseCase } from "./application/use-cases/transfer-money.use-case";
import { WALLET_REPOSITORY_TOKENS } from "./domain/repositories/wallet.repository.token";
import { CreateWalletUseCase } from "./application/use-cases/crreate-wallet.use-case";
import { GetWalletUseCase } from "./application/use-cases/get-wallet.use-case";
@Module({
  controllers:[WalletController],
  providers:[
     {  provide: WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY, 
      useClass: WalletRepository },
     {
      provide: WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY,
      useClass: WalletTransactionRepository,
    },
     ChangeWalletBalanceUseCase, TransferMoneyUseCase , CreateWalletUseCase , GetWalletUseCase],
  exports:[ChangeWalletBalanceUseCase, TransferMoneyUseCase , GetWalletUseCase]
})
export class WalletModule {}