import { Module, Global } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
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
          store: new KeyvRedis({ url: config.redisUrl }) as any,
          // ttl: config.redisTTL,
        });

        keyv.on('error', err => console.error('Keyv Redis Error', err));

        await keyv.set('ping', 'pong');
        const pong = await keyv.get('ping');
        console.log('Redis test:', pong);

        return keyv;
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class AppCacheModule {}