
// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   Inject,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// import { JwtService } from '@nestjs/jwt';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// import { t, SupportedLang } from '../../locales';
// import { GetUserProfileUseCase } from '../../modules/users/application/use-cases/get-user-profile.use-case';
// import { USER_REPO, type IUserDomainRepository } from '../../modules/users/domain/repositories/user.repository.interface';
// import { GetAgencyByOwnerUseCase } from '../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
// import { GetAgentAuthContextUseCase } from '../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
// import { CustomJwtPayload } from '../../modules/auth/infrastructure/services/auth-token.service';
// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//       private readonly getUserProfile: GetUserProfileUseCase,
//       @Inject(USER_REPO)
//     private readonly userRepository: IUserDomainRepository,
//     private readonly getAgentAuthContext:GetAgentAuthContextUseCase,
//   private readonly findByOwner: GetAgencyByOwnerUseCase,
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
     
// const decoded = this.jwtService.verify<CustomJwtPayload>(token);
 
      
//       const user = await this.getUserProfile.execute(decoded.userId);
//       if (!user) throw new UnauthorizedException(t('userNotFound', lang));

      
//       req.user = user;
//       req.userId = user.id;

      
//       req.agencyId = undefined;
//       req.agencyAgentId = undefined;
//       req.agentPermissions = undefined;
//       req.agentStatus = undefined;

//       if (user.role === 'agent') {
        
     
// const agentContext = await this.getAgentAuthContext.execute(user.id);
// if (!agentContext) {
//   throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
// }
//   req.agencyId = agentContext.agencyId;
// req.agencyAgentId = agentContext.agencyAgentId;
// req.agentPermissions = agentContext.permissions;
// req.agentStatus = agentContext.status;

//       }

//       if (user.role === 'agency_owner') {
       
//         const agency = await this.findByOwner.execute(user.id, lang);
//         req.agencyId = agency.id;
//         req.agencyAgentId = undefined; 
//       }

     
//  await this.userRepository.updateFields(user.id, {
//         last_active: new Date(),
//       });
//       return true;
//     } catch (error) {
//   if (error instanceof UnauthorizedException) {
//     throw error;
//   }
//   console.error(error);
//   throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
// }
//   }
// }
//  //  const decoded = this.jwtService.verify(token, {
//   //       secret: this.config.jwtSecret, 
//   //     });
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { t, SupportedLang } from '../../locales';
import { AuthContextService } from '../../infrastructure/auth/services/auth-context.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authContextService: AuthContextService,
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

    const token = this.authContextService.extractToken(req);
    if (!token) {
      throw new UnauthorizedException(t('noTokenProvided', lang));
    }

    try {
      const authContext = await this.authContextService.authenticate(token, lang);

      // Attach to request exactly as your original code did
      req.user = authContext.user;
      req.userId = authContext.userId;
      req.agencyId = authContext.agencyId;
      req.agencyAgentId = authContext.agencyAgentId;
      req.agentPermissions = authContext.agentPermissions;
      req.agentStatus = authContext.agentStatus;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(error);
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}