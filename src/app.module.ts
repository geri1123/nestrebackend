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

// Jobs
import { CronJobsModule } from './cron/cron.module';
import { AgencyContextGuard } from './infrastructure/auth/guard/agency-context.guard';
import { AgencyContextModule } from './infrastructure/auth/modules/agency-context.module';

@Module({
  imports: [
    // ========================================
    // CORE CONFIGURATION
    // ========================================
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: 60 }],
    }),
    ScheduleModule.forRoot(),
    AppConfigModule,

    // ========================================
    // INFRASTRUCTURE
    // ========================================
    PrismaModule,
    DatabaseModule,
    CloudinaryModule,

    // ========================================
    // AUTH INFRASTRUCTURE (Order matters!)
    // ========================================
    SharedAuthModule,  
    
    AuthContextModule,  // 2. Auth context (user authentication)
    AgencyContextModule,
       
    GuardsModule,          // 3. Guards (depends on context modules)

    // ========================================
    // BUSINESS DOMAIN MODULES
    // ========================================
    
    // User & Auth
    AuthModule,
    UsersModule,
    RegistrationModule,
    EmailVerificationModule,

    // Agency & Agents
    AgencyModule,
    AgentModule,
    AgencyRequestsModule,

    // Products
    ProductModule,
    ProductImageModule,
    ProductAttributeValueModule,
    ProductClicksModule,
    SaveProductModule,
    AdvertiseProductModule,
    AdvertisementPricingModule,

    // ========================================
    // FEATURE MODULES
    // ========================================
    NotificationModule,
    FiltersModule,
    WalletModule,
    ContactModule,
    CleanupModule,

    // ========================================
    // BACKGROUND JOBS
    // ========================================
    CronJobsModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    
    // ========================================
    // GLOBAL GUARDS (Order matters!)
    // ========================================
    // 1. Rate limiting (first line of defense)
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    
    // 2. Authentication (verify JWT token)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    
    // Note: Role and Permission guards are applied via decorators,
    // not globally, for better control over route-level authorization
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply language detection middleware to all routes
    consumer
      .apply(LanguageMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

// import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { PrismaModule } from './infrastructure/prisma/prisma.module';

// import { AppConfigModule } from './infrastructure/config/config.module';
// import { LanguageMiddleware } from './middlewares/language.middleware';
// import { AuthModule } from './modules/auth/auth.module';
// import { FiltersModule } from './modules/filters/filters.module';
// import { APP_GUARD } from '@nestjs/core';
// import { JwtAuthGuard } from './infrastructure/auth/guard/jwt-auth.guard';
// import { RolesGuard } from './infrastructure/auth/guard/role-guard';
// import { ProductModule } from './modules/product/product.module';
// import { NotificationModule } from './modules/notification/notification.module';
// import { AgencyModule } from './modules/agency/agency.module';
// import { UsersModule } from './modules/users/users.module';
// import { AgencyRequestsModule } from './modules/agency-requests/agency-requests.module';
// import { AgentModule } from './modules/agent/agent.module';
// import { PermissionsGuard } from './infrastructure/auth/guard/permissions.guard';
// import { SaveProductModule } from './modules/saved-product/save-product.module';

// import { DatabaseModule } from './infrastructure/database/database.module';
// import { ProductClicksModule } from './modules/product-clicks/product-clicks.module';

// import { WalletModule } from './modules/wallet/wallet.module';
// import { ScheduleModule } from '@nestjs/schedule';
// import { CronJobsModule } from './cron/cron.module';
// import { CustomThrottlerGuard } from './common/guard/Throttler.guard';
// import { AdvertiseProductModule } from './modules/advertise-product/advertise-product.module';
// import { CleanupModule } from './modules/cleanup/cleanup.module';
// import { RegistrationModule } from './modules/registration/registration.module';
// import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
// import { ProductImageModule } from './modules/product-image/product-image.module';
// import { ProductAttributeValueModule } from './modules/product-attribute/product-attribute.module';
// import { AdvertisementPricingModule } from './modules/advertisement-pricing/advertisement-prising.module';
// import { CloudinaryModule } from './infrastructure/cloudinary/cloudinary.module';
// import { SharedAuthModule } from './infrastructure/auth/modules/shared-auth.module';
// import { AuthContextService } from './infrastructure/auth/services/auth-context.service';
// import { AuthContextModule } from './infrastructure/auth/modules/auth-context.module';
// import { ContactModule } from './modules/contact/contact.module';
// import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
// import { GuardsModule } from './infrastructure/auth/modules/guards.module';
// import { AgencyContextGuard } from './infrastructure/auth/guard/agency-context.guard';
// @Module({
//   imports: [
//  ThrottlerModule.forRoot({
//       throttlers: [{ limit: 100, ttl: 60 }], 
//     }),
//         SharedAuthModule, 
 
//  ScheduleModule.forRoot(),  
//  CronJobsModule,
//     WalletModule,
//     RegistrationModule,
//     ProductClicksModule,
// DatabaseModule,
//     AppConfigModule,
//     PrismaModule,
//     UsersModule,
//     CleanupModule,
//     AgencyRequestsModule,
//      SaveProductModule,
    
//     CloudinaryModule,
//     AgencyModule,
// AuthModule,
// AuthContextModule,
// FiltersModule,
// ProductModule,
// ProductImageModule,
// ProductAttributeValueModule,
// AdvertiseProductModule,
// NotificationModule,
// EmailVerificationModule,
// SharedAuthModule,
//     AgentModule, 
//     AdvertisementPricingModule,
//     ContactModule,
//     GuardsModule,
//   ],
//   controllers: [AppController],
//   providers: [
   
//     AppService,
//   { provide: APP_GUARD, useClass: CustomThrottlerGuard },
//       {
//     provide: APP_GUARD,
//     useClass: JwtAuthGuard, 
//   },
//   // { provide: APP_GUARD, useClass: AgencyContextGuard },
 

//   ],
// })
// export class AppModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(LanguageMiddleware)
//       .forRoutes({ path: '*', method: RequestMethod.ALL }); 
//   }
// }
//  // {
//   //   provide: APP_GUARD,
//   //   useClass: RolesGuard, 
//   // },
//   // {
//   //   provide: APP_GUARD,
//   //   useClass: PermissionsGuard,
//   // },