import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminUserModule } from './users/admin-user.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { AgenciesAdminModule } from './agencies/agencies-admin.module';
import { EarningModule } from './earning/earning.module';
import { AdminWalletModule } from './wallet/wallet.module';

@Module({
  
  imports: [
    QueueModule,
    AdminAuthModule,
    AdminUserModule,
    AgenciesAdminModule,
    EarningModule , 
    AdminWalletModule
  ],
  
})
export class AdminModule {}