// import { Module, Global } from '@nestjs/common';
// import { AppConfigModule } from '../config/config.module';
// import { AppConfigService } from '../config/config.service';
// import Keyv from 'keyv';
// import KeyvRedis from '@keyv/redis';
// import { CacheService } from './cache.service';

// import { CACHE_KEYV } from './cache.constants';

// @Module({
//   providers: [
//     {
//       provide: CACHE_KEYV,
//       inject: [AppConfigService],
//       useFactory: async (config: AppConfigService) => {
//         const keyv = new Keyv({
//           store: new KeyvRedis({ url: config.redisUrl }) as any,
//           // ttl: config.redisTTL,
//         });

//         keyv.on('error', err => console.error('Keyv Redis Error', err));

//         await keyv.set('ping', 'pong');
//         const pong = await keyv.get('ping');
//         console.log('Redis test:', pong);

//         return keyv;
//       },
//     },
//     CacheService,
//   ],
//   exports: [CacheService],
// })
// export class AppCacheModule {}
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
          store: new KeyvRedis(config.redisUrl) as any, // Just the URL, no extra config
        });

        keyv.on('error', err => {
          console.error(' Redis Error:', err.message);
        });

        try {
          await keyv.set('ping', 'pong');
          const result = await keyv.get('ping');
          console.log(' Redis connected successfully:', result);
        } catch (error) {
          console.error(' Redis connection failed:', error.message);
        }

        return keyv;
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class AppCacheModule {}