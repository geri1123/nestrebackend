import { Module } from "@nestjs/common";
import { WalletModule } from "../../wallet/wallet.module";

import { AdminAuthModule } from "../auth/admin-auth.module";
import { AdminWalletController } from "./admin-wallet.controller";
import { GetAllWalletsUseCase } from "./application/get-all-wallets.use-case";
import { GetAllTransactionsUseCase } from "./application/get-wallet-transaction.use-case";
import { GetUserTransactionsUseCase } from "./application/get-user-transactions.use-case";

@Module({
    imports:[WalletModule  , AdminAuthModule],
    controllers:[AdminWalletController],
    providers:[GetAllTransactionsUseCase , GetAllWalletsUseCase ,GetUserTransactionsUseCase],

})

export class AdminWalletModule{};