import { Module } from "@nestjs/common";
import { WalletRepository } from "../../repositories/walllet/wallet.repository";
import { WalletService } from "./application/services/wallet.service";
import { WalletController } from "./wallet.controller";
import { WalletTransactionRepository } from "../../repositories/walllet/wallet-transaction.repository";
import { ChangeWalletBalanceUseCase } from "./application/use-cases/change-wallet-balance.use-case";
import { TransferMoneyUseCase } from "./application/use-cases/transfer-money.use-case";

@Module({
  controllers:[WalletController],
  providers:[
     { provide: "IWalletRepository", useClass: WalletRepository },
      { provide: "IWalletTransactionRepository", useClass: WalletTransactionRepository },
    WalletService , ChangeWalletBalanceUseCase, TransferMoneyUseCase],
  exports:[WalletService]
})
export class WalletModule {}