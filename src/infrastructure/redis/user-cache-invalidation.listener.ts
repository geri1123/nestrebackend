import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisPubSubService } from './redis-pubsub.service';
import { CHANNELS } from './redis-pubsub.channels';
 
@Injectable()
export class UserCacheInvalidationListener implements OnModuleInit {
  constructor(
    private readonly cache: CacheService,
    private readonly pubSub: RedisPubSubService,
  ) {}
 
  async onModuleInit() {
    await this.pubSub.subscribe(CHANNELS.USER_UPDATED, (payload) =>
      this.handle(payload),
    );
  }
 
  private async handle(payload: { userId: number }) {
    const key = `ctx:${payload.userId}`;
    await this.cache.delete(key);
  }
}
 