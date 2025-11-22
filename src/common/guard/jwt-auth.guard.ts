// // jwt-auth.guard.ts
// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import { UserRepository } from '../../repositories/user/user.repository';
// import { AgentService } from '../../modules/agent/agent.service';
// import { t, SupportedLang } from '../../locales';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly userRepo: UserRepository,
//     private readonly agentService: AgentService,
//     private readonly config: ConfigService,
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

//     const authHeader = req.headers.authorization;
//     const token =
//       req.cookies?.token ||
//       (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

//     if (!token) {
//       throw new UnauthorizedException(t('noTokenProvided', lang));
//     }

//     try {
//       // Decode JWT  get  (userId)
//       const decoded = this.jwtService.verify(token, {
//         secret: this.config.get<string>('JWT_SECRET'),
//       });

      
//       const user = await this.userRepo.findById(decoded.userId);
//       if (!user) throw new UnauthorizedException(t('userNotFound', lang));

     

      
//       req.user = user;
//       req.userId = user.id;

      
//       req.agencyId = decoded.agencyId || null;

      
//       if (user.role === 'agent') {
//         const agentRecord = await this.agentService.findByAgencyAndAgent(
//           req.agencyId!,
//           user.id,
//           lang,
//         );
//         if (!agentRecord) {
//           throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
//         }
//         req.agencyAgentId = agentRecord.id;
//         req.agentPermissions = agentRecord.permission;
//           req.agentStatus = agentRecord.status;
//       }

      
//       if (user.role === 'agency_owner') {
//         req.agencyAgentId = null;
//       }

      
//       await this.userRepo.updateFieldsById(user.id, { last_active: new Date() });

//       return true;
//     } catch (error) {
//       throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
//     }
//   }
// }

// jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../types/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRepository } from '../../repositories/user/user.repository';
import { AgentService } from '../../modules/agent/agent.service';
import { AgencyService } from '../../modules/agency/agency.service';
import { t, SupportedLang } from '../../locales';
import { AppConfigService } from '../../infrastructure/config/config.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly agentService: AgentService,
    private readonly agencyService: AgencyService,
    private readonly config: AppConfigService, 
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      throw new UnauthorizedException(t('noTokenProvided', lang));
    }

    try {
     
      
   const decoded = this.jwtService.verify(token, {
        secret: this.config.jwtSecret, 
      });
      
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) throw new UnauthorizedException(t('userNotFound', lang));

      
      req.user = user;
      req.userId = user.id;

      
      req.agencyId = undefined;
      req.agencyAgentId = undefined;
      req.agentPermissions = undefined;
      req.agentStatus = undefined;

      if (user.role === 'agent') {
        // Fetch agent record
        const agentRecord = await this.agentService.findByAgencyAndAgent(
          await this.agentService.getAgencyIdForAgent(user.id) as number,
          user.id,
          lang,
        );
        if (!agentRecord) {
          throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
        }

        req.agencyId = agentRecord.agency_id;
        req.agencyAgentId = agentRecord.id;
        req.agentPermissions = agentRecord.permission;
        req.agentStatus = agentRecord.status;
      }

      if (user.role === 'agency_owner') {
       
        const agency = await this.agencyService.getAgencyByOwnerOrFail(user.id, lang);
        req.agencyId = agency.id;
        req.agencyAgentId = undefined; 
      }

      // Update last_active
      await this.userRepo.updateFieldsById(user.id, { last_active: new Date() });

      return true;
    } catch (error) {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}
// const decoded = this.jwtService.verify(token, {
      //   secret: this.config.get<string>('JWT_SECRET'),
      // });