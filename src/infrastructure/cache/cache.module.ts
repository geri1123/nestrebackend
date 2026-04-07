
import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheService } from './cache.service';
import { CACHE_KEYV } from './cache.constants';

import { ClearCache } from './cache.controller';
import { UserCacheInvalidationListener } from './user-cache-invalidation.listener';
@Module({
  controllers:[ClearCache],
  providers: [
    {
      provide: CACHE_KEYV,
      inject: [AppConfigService],
     useFactory: async (config: AppConfigService) => {
  const redisStore = new KeyvRedis(config.redisUrl);

  redisStore.on('error', (err: any) => {
    console.error(' Redis Store Error:', err.message);
  });

  const keyv = new Keyv({
    store: redisStore as any,
  });

  // fallback error listener
  keyv.on('error', (err) => {
    console.error(' Keyv Error:', err.message);
  });

  try {
    await keyv.set('healthcheck', 'ok', 2000);
    const result = await keyv.get('healthcheck');

    console.log('Redis connected:', result);
  } catch (err: any) {
    console.error(' Redis connection failed → switching to memory:', err.message);

    return new Keyv(); 
  }

  return keyv;
}
    },
    CacheService,
    UserCacheInvalidationListener
  ],
  exports: [CacheService],
})
export class AppCacheModule {}