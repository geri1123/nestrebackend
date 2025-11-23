import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { t } from '../../locales';
import { RequestWithUser } from '../types/request-with-user.interface';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  
  protected async getTracker(req: any): Promise<string> {
    if (req.userId) return `user-${req.userId}`;
    return req.ip;
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    return {
      req: http.getRequest<RequestWithUser>(),
      res: http.getResponse(),
    };
  }


  protected async handleRequest(
    requestProps: ThrottlerRequest
  ): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    
   
    const { req } = this.getRequestResponse(context);
    const tracker = await this.getTracker(req);
    
    // Get storage record
    const { totalHits } = await this.storageService.increment(
      tracker,
      ttl,
      limit,
      blockDuration,
      throttler.name || 'default'
    );

    // Check if limit exceeded
    if (totalHits > limit) {
      await this.throwThrottlingException(context);
    }

    return true;
  }

 
  protected async throwThrottlingException(
    context: ExecutionContext
  ): Promise<void> {
    const { req } = this.getRequestResponse(context);
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
}
