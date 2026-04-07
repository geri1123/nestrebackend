import { Injectable } from '@nestjs/common';
import { RedisPubSubService } from '../../../../infrastructure/cache/redis/redis-pubsub.service';
import { CHANNELS } from '../../../../infrastructure/cache/redis/redis-pubsub.channels';

@Injectable()
export class UserEventPublisher {
  constructor(private readonly pubSub: RedisPubSubService) {}

  async userUpdated(userId: number) {
    await this.pubSub.publish(CHANNELS.USER_UPDATED, {
      userId,
    });
  }
}