// jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../types/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRepository } from '../../repositories/user/user.repository';
import { AgentService } from '../../modules/agent/agent.service';
import { t, SupportedLang } from '../../locales';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly agentService: AgentService,
    private readonly config: ConfigService,
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
      // Decode JWT to get minimal info (userId)
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      // Fetch full user once
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) throw new UnauthorizedException(t('userNotFound', lang));

      // Check if user is suspended or inactive
      if (user.status === 'suspended') {
        throw new UnauthorizedException(t('accountSuspended', lang));
      }

      // Attach full user to request
      req.user = user;
      req.userId = user.id;

      // Attach agencyId from token if exists
      req.agencyId = decoded.agencyId || null;

      // Populate agent-specific info if role is 'agent'
      if (user.role === 'agent') {
        const agentRecord = await this.agentService.findByAgencyAndAgent(
          req.agencyId!,
          user.id,
          lang,
        );
        if (!agentRecord) {
          throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
        }
        req.agencyAgentId = agentRecord.id;
        req.agentPermissions = agentRecord.permission;
      }

      // Owners don’t need agencyAgentId
      if (user.role === 'agency_owner') {
        req.agencyAgentId = null;
      }

      // Update last active timestamp
      await this.userRepo.updateFieldsById(user.id, { last_active: new Date() });

      return true;
    } catch (error) {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}

// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { RequestWithLang } from '../../middlewares/language.middleware';
// import { UserRepository } from '../../repositories/user/user.repository';
// import { AgencyRepository } from '../../repositories/agency/agency.repository';
// import { t } from '../../locales';
// import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { AgentService } from '../../modules/agent/agent.service';
// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly userRepo: UserRepository,
//     private readonly agentService:AgentService,
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
//     const lang = req.language;

//     const authHeader = req.headers.authorization;
//     const token =
//       req.cookies?.token ||
//       (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

//     if (!token) {
//       throw new UnauthorizedException(
      
//         t('noTokenProvided', lang),
//         );
//     }
// try {
//   const decoded = this.jwtService.verify(token, {
//     secret: this.config.get<string>('JWT_SECRET'),
//   });

//   req['user'] = decoded;
//   req['userId'] = decoded.userId;

//   const agencyId = decoded.agencyId;
//   req['agencyId'] = agencyId;

//   // Populate agencyAgentId only for agents (not owners)
//   if (decoded.role === 'agent') {
//     const agentRecord = await this.agentService.findByAgencyAndAgent(agencyId, decoded.userId , lang);
//     if (!agentRecord) {
//       throw new UnauthorizedException(
       
//       t('userNotAssociatedWithAgency', req.language),
      
//       );
//     }
//     req['agencyAgentId'] = agentRecord.id; 
//   }

//   // Owners don't need agencyAgentId
//   if (decoded.role === 'agency_owner') {
//     req['agencyAgentId'] = null;
//   }

//   await this.userRepo.updateFieldsById(decoded.userId, { last_active: new Date() });

//   return true;
// } catch (error) {
//   throw new UnauthorizedException(
   
//    t('invalidOrExpiredToken', req.language),
//   );
// }
  
//   }
// }