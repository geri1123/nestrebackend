import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AppConfigModule } from './config/config.module';
import { LanguageMiddleware } from './middlewares/language.middleware';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { FiltersModule } from './filters/filters.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role-guard';
import { ProductModule } from './product/product.module';
import { NotificationModule } from './notification/notification.module';
import { AgencyModule } from './agency/agency.module';
import { UserModule } from './users/users.module';
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    UserModule,
     AgencyModule,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
  
      {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, 
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, 
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
