import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminUserModule } from './users/admin-user.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { AgenciesAdminModule } from './agencies/agencies-admin.module';
import { EarningModule } from './earning/earning.module';
import { AdminWalletModule } from './wallet/wallet.module';
import { ProductsAdminModule } from './products/product-admin.module';
import { AccountModule } from './account/account.module';
import { AdminCoreModule } from './admin-core/admin-core.module';
import { OutreachModule } from './outreach/outreach.module';

@Module({
  
  imports: [
    AdminCoreModule,
    OutreachModule,
    QueueModule,
    AdminAuthModule,
    AdminUserModule,
    AgenciesAdminModule,
    EarningModule , 
    AdminWalletModule,
    ProductsAdminModule,
    AccountModule
  ],
  
})
export class AdminModule {}