
import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheService } from './cache.service';
import { CACHE_KEYV } from './cache.constants';

@Module({
  providers: [
    {
      provide: CACHE_KEYV,
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => {
        const keyv = new Keyv({
          store: new KeyvRedis(config.redisUrl) as any, 
        });

        keyv.on('error', err => {
          console.error(' Redis Error:', err.message);
        });

        try {
          await keyv.set('ping', 'pong');
          const result = await keyv.get('ping');
          console.log(' Redis connected successfully:', result);
        } catch (err:any) {
          console.error(' Redis connection failed:', err.message);
        }

        return keyv;
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class AppCacheModule {}