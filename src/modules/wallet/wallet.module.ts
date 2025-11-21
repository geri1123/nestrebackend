import { Module } from "@nestjs/common";
import { WalletRepository } from "../../repositories/walllet/wallet.repository";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { WalletTransactionRepository } from "../../repositories/walllet/wallet_transaction.repository";

@Module({
  controllers:[WalletController],
  providers:[WalletService,WalletRepository,WalletTransactionRepository],
  exports:[WalletService,WalletRepository]
})
export class WalletModule {}