import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { LanguageMiddleware } from './middlewares/language.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { FiltersModule } from './modules/filters/filters.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt-auth.guard';
import { RolesGuard } from './common/guard/role-guard';
import { ProductModule } from './modules/product/product.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AgencyModule } from './modules/agency/agency.module';
import { UserModule } from './modules/users/users.module';
import { AgencyRequestsModule } from './modules/agency-requests/agency-requests.module';
import { AgentModule } from './modules/agent/agent.module';
import { PermissionsGuard } from './common/guard/permision.guard';
// import { UserStatusGuard } from './common/guard/user-status.guard';
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    UserModule,
    AgencyRequestsModule,
     
    FirebaseModule,
    AgencyModule,
AuthModule,
FiltersModule,
ProductModule,
NotificationModule,
ThrottlerModule.forRoot([
      {
        ttl: 15 * 60, 
        limit: 5,     
      },
    ]),
    AgentModule, 
  ],
  controllers: [AppController],
  providers: [
    AppService,
  
      {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, 
  },
  // {
  //   provide: APP_GUARD,
  //   useClass: UserStatusGuard,
  // },
  {
    provide: APP_GUARD,
    useClass: RolesGuard, 
  },
  {
    provide: APP_GUARD,
    useClass: PermissionsGuard,
  }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LanguageMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); 
  }
}
