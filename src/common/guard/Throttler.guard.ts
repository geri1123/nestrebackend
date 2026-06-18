import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { t } from '../../locales';
import { RequestWithUser } from '../types/request-with-user.interface';

@Injectable()
export class CustomThrottlerGuard {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser & { language?: string }>();
    const handler = context.getHandler();
    const classRef = context.getClass();

    const meta = this.reflector.getAllAndOverride<{ limit: number; ttl: number }>(
      'custom_throttle',
      [handler, classRef],
    );

    if (!meta) return true;

    const { limit, ttl } = meta;
    const tracker = req.userId ? `user-${req.userId}` : await this.getIp(req);
    const key = `${tracker}:${req.path}`;
    const now = Date.now();
    const windowMs = ttl * 1000;

    const timestamps = (this.hits.get(key) ?? []).filter(
      (ts) => now - ts < windowMs,
    );

    if (timestamps.length >= limit) {
      const lang = req.language || 'al';
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: t('tooManyRequests', lang),
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return true;
  }

  private async getIp(req: any): Promise<string> {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }
}