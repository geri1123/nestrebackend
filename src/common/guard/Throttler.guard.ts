
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
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const handler = context.getHandler();
    const classRef = context.getClass();

    const ttl = this.reflector.getAllAndOverride<number>(
      'THROTTLER:TTLdefault',
      [handler, classRef],
    );
    const limit = this.reflector.getAllAndOverride<number>(
      'THROTTLER:LIMITdefault',
      [handler, classRef],
    );

   
    if (ttl == null || limit == null) return true;

    const tracker = await this.getTracker(req);
    const key = `${tracker}:${req.url}`;
    const now = Date.now();
    const windowMs = ttl * 1000;

    const timestamps = (this.hits.get(key) ?? []).filter((ts) => now - ts < windowMs);

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

  protected async getTracker(req: any): Promise<string> {
    return req.userId ? `user-${req.userId}` : req.ip;
  }
}
