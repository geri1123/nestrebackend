import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { t, SupportedLang } from '../../../locales';
import { AuthContextService } from '../services/auth-context.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authContextService: AuthContextService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    // Extract and validate token
    const token = this.authContextService.extractToken(req);
    if (!token) {
      throw new UnauthorizedException(t('noTokenProvided', lang));
    }

    try {
      // Authenticate and attach user to request
      const authContext = await this.authContextService.authenticate(token, lang);
      req.user = authContext.user;
      req.userId = authContext.userId;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('JWT Auth Error:', error);
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../../../common/types/request-with-user.interface';
// import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
// import { t, SupportedLang } from '../../../locales';
// import { AuthContextService } from '../services/auth-context.service';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly authContextService: AuthContextService,
//     private readonly reflector: Reflector,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) return true;

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     const token = this.authContextService.extractToken(req);
//     if (!token) {
//       throw new UnauthorizedException(t('noTokenProvided', lang));
//     }

//     try {
//       const authContext = await this.authContextService.authenticate(token, lang);

//       req.user = authContext.user;
//       req.userId = authContext.userId;
//       return true;
//     } catch (error) {
//       if (error instanceof UnauthorizedException) {
//         throw error;
//       }
//       console.error(error);
//       throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
//     }
//   }
// }
