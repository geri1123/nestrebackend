import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { AppConfigService } from '../config/config.service';
import { AppConfigModule } from '../config/config.module';
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [AppConfigModule], 
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        store: redisStore,
        host: config.redisHost,
        port: config.redisPort,
        username: config.redisUsername,
        password: config.redisPassword,
        ttl: config.redisTTL,
      }),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}