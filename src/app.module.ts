import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { LanguageMiddleware } from './middlewares/language.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { FiltersModule } from './modules/filters/filters.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt-auth.guard';
import { RolesGuard } from './common/guard/role-guard';
import { ProductModule } from './modules/product/product.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AgencyModule } from './modules/agency/agency.module';
import { UsersModule } from './modules/users/users.module';
import { AgencyRequestsModule } from './modules/agency-requests/agency-requests.module';
import { AgentModule } from './modules/agent/agent.module';
import { PermissionsGuard } from './common/guard/permision.guard';
import { SaveProductModule } from './modules/saved-product/save-product.module';

import { DatabaseModule } from './infrastructure/database/database.module';
import { ProductClicksModule } from './modules/product-clicks/product-clicks.module';

import { WalletModule } from './modules/wallet/wallet.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobsModule } from './cron/cron.module';
import { CustomThrottlerGuard } from './common/guard/Throttler.guard';
import { AdvertiseProductModule } from './modules/advertise-product/advertise-product.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';

@Module({
  imports: [
  ThrottlerModule.forRoot({
  throttlers: [
    {
         limit: 10, ttl: 1 
    },
  ],
}),
 ScheduleModule.forRoot(),  
 CronJobsModule,
    WalletModule,
    RegistrationModule,
    ProductClicksModule,
DatabaseModule,
    AppConfigModule,
    PrismaModule,
    UsersModule,
    CleanupModule,
    AgencyRequestsModule,
     SaveProductModule,
    FirebaseModule,
    AgencyModule,
AuthModule,
FiltersModule,
ProductModule,
AdvertiseProductModule,
NotificationModule,
EmailVerificationModule,

    AgentModule, 
  ],
  controllers: [AppController],
  providers: [
    AppService,
  {
    provide:APP_GUARD,
    useClass:CustomThrottlerGuard
  }
  
    ,
      {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, 
  },

  {
    provide: APP_GUARD,
    useClass: RolesGuard, 
  },
  {
    provide: APP_GUARD,
    useClass: PermissionsGuard,
  },

  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LanguageMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); 
  }
}
