// src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

export const CACHE_KEYV = 'CACHE_KEYV';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: CACHE_KEYV,
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => {
        const keyv = new Keyv({
          store: new KeyvRedis({ url: config.redisUrl }) as any, 
          ttl: config.redisTTL,
        });

        keyv.on('error', err => console.error('Keyv Redis Error', err));

        await keyv.set('ping', 'pong'); // test connection
        const pong = await keyv.get('ping');
        console.log('Redis test:', pong); 

        return keyv;
      },
    },
  ],
  exports: [CACHE_KEYV],
})
export class AppCacheModule {}
