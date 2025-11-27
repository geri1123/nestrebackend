import { Module } from "@nestjs/common";
import { WalletRepository } from "../../repositories/walllet/wallet.repository";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { WalletTransactionRepository } from "../../repositories/walllet/wallet_transaction.repository";
import { ChangeWalletBalanceUseCase } from "./use-cases/change-wallet-balance.use-case";
import { TransferMoneyUseCase } from "./use-cases/transfer-money.use-case";

@Module({
  controllers:[WalletController],
  providers:[
     { provide: "IWalletRepository", useClass: WalletRepository },
      { provide: "IWalletTransactionRepository", useClass: WalletTransactionRepository },
    WalletService , ChangeWalletBalanceUseCase, TransferMoneyUseCase],
  exports:[WalletService]
})
export class WalletModule {}