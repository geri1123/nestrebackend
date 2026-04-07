// infrastructure/redis/redis-pubsub.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../config/config.service';

type Handler = (payload: any) => Promise<void> | void;

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, Handler[]>();
  private logger = new Logger(RedisPubSubService.name);

  constructor(private config: AppConfigService) {
    this.publisher = new Redis(config.redisUrl);
    this.subscriber = new Redis(config.redisUrl);
  }

  onModuleInit() {
    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (!handlers) return;

      let payload: any;
      try {
        payload = JSON.parse(message);
      } catch {
        this.logger.error(`Invalid JSON: ${message}`);
        return;
      }

      handlers.forEach((h) =>
        Promise.resolve(h(payload)).catch((err) =>
          this.logger.error(`Handler error`, err),
        ),
      );
    });
  }

  async publish(channel: string, payload: any) {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  async subscribe(channel: string, handler: Handler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.push(handler);
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}