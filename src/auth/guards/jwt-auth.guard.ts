import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RequestWithLang } from '../../middlewares/language.middleware';
import { UserRepository } from '../../repositories/user/user.repository';
import { AgencyRepository } from '../../repositories/agency/agency.repository';
import { t } from '../../locales';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly agencyRepo: AgencyRepository,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<RequestWithLang>();
    const lang = req.language; 

    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      throw new UnauthorizedException(t('noTokenProvided', lang));
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      req['user'] = decoded;
      req['userId'] = decoded.userId;

      if (decoded.role === 'agency_owner') {
        const agency = await this.agencyRepo.findByOwnerUserId(decoded.userId);
        if (agency) req['agencyId'] = agency.id;
      }

      await this.userRepo.updateFieldsById(decoded.userId, {
        last_active: new Date(),
      });

      return true;
    } catch {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}


// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
// import { UserRepository } from '../../repositories/user/user.repository';
// import { AgencyRepository } from '../../repositories/agency/agency.repository';
// import { SupportedLang, t } from '../../locales';
// import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly userRepo: UserRepository,
//     private readonly agencyRepo: AgencyRepository,
//     private readonly config: ConfigService,
//     private readonly reflector: Reflector, // Add Reflector
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) return true; // skip guard for public routes

//     const req: Request = context.switchToHttp().getRequest();
//     const lang: SupportedLang = (req.query.lang as SupportedLang) || (req.headers['accept-language'] as SupportedLang) || 'al';
    
//     const authHeader = req.headers.authorization;
//     const token =
//       req.cookies?.token ||
//       (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

//     if (!token) {
//       throw new UnauthorizedException(t('noTokenProvided', lang));
//     }

//     try {
//       const decoded = this.jwtService.verify(
//         token,
//         { secret: this.config.get<string>('JWT_SECRET') },
//       );

//       req['user'] = decoded;
//       req['userId'] = decoded.userId;

//       if (decoded.role === 'agency_owner') {
//         const agency = await this.agencyRepo.findByOwnerUserId(decoded.userId);
//         if (agency) req['agencyId'] = agency.id;
//       }

//       await this.userRepo.updateFieldsById(decoded.userId, { last_active: new Date() });

//       return true;
//     } catch {
//       throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
//     }
//   }
// }
