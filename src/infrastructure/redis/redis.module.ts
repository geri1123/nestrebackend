import { Global, Module, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service';
import { REDIS_CLIENT } from './redis.constants';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { UserCacheInvalidationListener } from './user-cache-invalidation.listener';
import { RedisPubSubService } from './redis-pubsub.service';
import { UserEventPublisher } from './publishers/user-event.publisher';

// Re-export so existing consumers can still do
//   import { REDIS_CLIENT } from '.../redis.module'
// Though the canonical import is now from './redis.constants'.
export { REDIS_CLIENT };

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        const logger = new Logger('RedisClient');
        const client = new Redis(config.redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          lazyConnect: false,
        });
        client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
        client.on('ready', () => logger.log('Redis ready'));
        return client;
      },
    },
    RedisPubSubService,
    CacheService,
    UserCacheInvalidationListener,
    UserEventPublisher
  ],
  controllers: [CacheController],
  exports: [REDIS_CLIENT, CacheService, RedisPubSubService , UserEventPublisher],
})
export class RedisModule {}