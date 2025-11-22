// // src/auth/guards/custom-throttler.guard.ts

// import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
// import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
// import { t } from '../../../locales'; 

// @Injectable()
// export class CustomThrottlerGuard extends ThrottlerGuard {
//   protected async throwThrottlingException(
//     context: ExecutionContext,
//     throttlerLimitDetail: ThrottlerLimitDetail,
//   ): Promise<void> {
//     const request = context.switchToHttp().getRequest();
//     const lang = request.language || 'al';
//     const ttlSeconds = Math.ceil(throttlerLimitDetail.ttl / 1000);
//     const minutes = Math.ceil(ttlSeconds / 60);
    
//     throw new HttpException(
//       { 
//         success: false,
//         message: t('tooManyLoginAttempts', lang) || 
//                  `Too many login attempts. Please try again in ${minutes} minutes.`
//       },
//       HttpStatus.TOO_MANY_REQUESTS,
//     );
//   }
// }