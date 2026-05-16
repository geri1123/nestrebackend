import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { GetUserStatsUseCase } from './application/use-cases/get-user-stats.use-case';

// Import modules that export the repos we depend on
import { ProductModule } from '../product/product.module';
import { SaveProductModule } from '../saved-product/save-product.module';
import { ProductClicksModule } from '../product-clicks/product-clicks.module';
import { AgencyModule } from '../agency/agency.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProductModule, SaveProductModule, ProductClicksModule ,UsersModule, AgencyModule],
  controllers: [DashboardController],
  providers: [GetUserStatsUseCase],
})
export class DashboardModule {}