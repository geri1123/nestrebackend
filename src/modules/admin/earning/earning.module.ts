import { Module } from "@nestjs/common";
import { WalletModule } from "../../wallet/wallet.module";
import { AdminEarningsController } from "./earning.controller";
import { GetEarningsStatsUseCase } from "./application/get-earnings-stats.use-case";
import { AdminAuthModule } from "../auth/admin-auth.module";

@Module({
    imports:[WalletModule , AdminAuthModule],
    controllers:[AdminEarningsController],
    providers:[GetEarningsStatsUseCase],
    
})

export class EarningModule{}