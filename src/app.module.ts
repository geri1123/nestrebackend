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
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    FirebaseModule,
AuthModule,
FiltersModule,
ThrottlerModule.forRoot([
      {
        ttl: 15 * 60, 
        limit: 5,     
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LanguageMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); 
  }
}
