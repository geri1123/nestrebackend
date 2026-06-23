import { Module } from '@nestjs/common';
import { WalletRepository } from './infrastructure/persistence/wallet.repository';
import { WalletController } from './wallet.controller';
import { WalletWebhookController } from './wallet-webhook.controller';
import { WalletTransactionRepository } from './infrastructure/persistence/wallet-transaction.repository';
import { ChangeWalletBalanceUseCase } from './application/use-cases/change-wallet-balance.use-case';
import { TransferMoneyUseCase } from './application/use-cases/transfer-money.use-case';
import { WALLET_REPOSITORY_TOKENS } from './domain/repositories/wallet.repository.token';
import { CreateWalletUseCase } from './application/use-cases/crreate-wallet.use-case';
import { GetWalletUseCase } from './application/use-cases/get-wallet.use-case';


// Paysera
import { CreatePayseraTopupUseCase } from './application/use-cases/create-paysera-topup.use-case';
import { ProcessPayseraPaymentUseCase } from './application/use-cases/process-paysera-payment.use-case';
import { EARNINGS_REPOSITORY } from './domain/repositories/earning.interface.repository';
import { EarningsRepository } from './infrastructure/persistence/earning.repository';

@Module({
  controllers: [WalletController, WalletWebhookController],
  providers: [
    {
      provide: WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY,
      useClass: WalletRepository,
    },
    {
      provide: WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY,
      useClass: WalletTransactionRepository,
    },
    {
      provide:EARNINGS_REPOSITORY,
      useClass:EarningsRepository,
    },
    ChangeWalletBalanceUseCase,
    TransferMoneyUseCase,
    CreateWalletUseCase,
    GetWalletUseCase,
 
    // Paysera
    CreatePayseraTopupUseCase,
    ProcessPayseraPaymentUseCase,
  ],
  exports: [ChangeWalletBalanceUseCase, TransferMoneyUseCase, GetWalletUseCase , WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY , WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY , EARNINGS_REPOSITORY],
})
export class WalletModule {}