import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      },
      password: configService.get<string>('REDIS_PASSWORD'),
      username: configService.get<string>('REDIS_USERNAME') || 'default',
    });

    return {
      store: () => store,
      ttl: 3600000, 
    };
  },
  inject: [ConfigService],
};
