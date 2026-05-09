import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service';

type Handler = (payload: any) => Promise<void> | void;

/**
 * Owns two dedicated Redis connections:
 *   • subscriber — locked in subscribe mode, can only receive messages
 *   • publisher  — issues PUBLISH commands
 *
 * Cannot share REDIS_CLIENT: once a connection enters subscribe mode it
 * can no longer issue regular commands (Redis protocol rule).
 */
@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, Handler[]>();

  constructor(private readonly config: AppConfigService) {
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
        this.logger.error(`Invalid JSON on ${channel}: ${message}`);
        return;
      }

      handlers.forEach((h) =>
        Promise.resolve(h(payload)).catch((err) =>
          this.logger.error(`Handler error on ${channel}`, err),
        ),
      );
    });
  }

  async publish(channel: string, payload: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  async subscribe(channel: string, handler: Handler): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.push(handler);
  }

  async onModuleDestroy() {
    await this.publisher.quit().catch(() => {});
    await this.subscriber.quit().catch(() => {});
  }
}