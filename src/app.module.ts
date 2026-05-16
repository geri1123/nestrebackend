// app.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure Modules
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CloudinaryModule } from './infrastructure/cloudinary/cloudinary.module';

// Auth Infrastructure
import { SharedAuthModule } from './infrastructure/auth/modules/shared-auth.module';
import { AuthContextModule } from './infrastructure/auth/modules/auth-context.module';
import { GuardsModule } from './infrastructure/auth/modules/guards.module';

// Middleware
import { LanguageMiddleware } from './middlewares/language.middleware';

// Global Guards
import { CustomThrottlerGuard } from './common/guard/Throttler.guard';
import { JwtAuthGuard } from './infrastructure/auth/guard/jwt-auth.guard';

// Business Domain Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AgencyModule } from './modules/agency/agency.module';
import { AgentModule } from './modules/agent/agent.module';
import { AgencyRequestsModule } from './modules/agency-requests/agency-requests.module';

// Product Modules
import { ProductModule } from './modules/product/product.module';
import { ProductImageModule } from './modules/product-image/product-image.module';
import { ProductAttributeValueModule } from './modules/product-attribute/product-attribute.module';
import { ProductClicksModule } from './modules/product-clicks/product-clicks.module';
import { SaveProductModule } from './modules/saved-product/save-product.module';
import { AdvertiseProductModule } from './modules/advertise-product/advertise-product.module';
import { AdvertisementPricingModule } from './modules/advertisement-pricing/advertisement-prising.module';

// Feature Modules
import { NotificationModule } from './modules/notification/notification.module';
import { FiltersModule } from './modules/filters/filters.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ContactModule } from './modules/contact/contact.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';


import { AgencyContextGuard } from './infrastructure/auth/guard/agency-context.guard';
import { AgencyContextModule } from './infrastructure/auth/modules/agency-context.module';
import { QueueModule } from './infrastructure/queue/queue.module';


import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebSocketModule } from './infrastructure/websocket/socket.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Module({
  imports: [
    // ========================================
    // CORE CONFIGURATION
    // ========================================
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: 60 }],
    }),
    EventEmitterModule.forRoot({
      global: true, 
    }),
    ScheduleModule.forRoot(),
    AppConfigModule,
   
    // INFRASTRUCTURE
    
    PrismaModule,
    DatabaseModule,
    CloudinaryModule,

 
    SharedAuthModule,  
    
    AuthContextModule,  
    AgencyContextModule,
       
    GuardsModule,         

    // BUSINESS DOMAIN MODULES
    
    // User & Auth
    AuthModule,
    UsersModule,
    RegistrationModule,
    EmailVerificationModule,

    // Agency & Agents
    AgencyModule,
    AgentModule,
    AgencyRequestsModule,
//Websocket
WebSocketModule,
    // Products
    ProductModule,
    ProductImageModule,
    ProductAttributeValueModule,
    ProductClicksModule,
    SaveProductModule,
    AdvertiseProductModule,
    AdvertisementPricingModule,
    //Dashboard
    DashboardModule,
    // FEATURE MODULES
    NotificationModule,
    FiltersModule,
    WalletModule,
    ContactModule,
    QueueModule,
    CleanupModule,

    // BACKGROUND JOBS
    
  RedisModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    
    // GLOBAL GUARDS (Order matters!)
  
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
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
