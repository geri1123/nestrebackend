
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../types/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

import { t, SupportedLang } from '../../locales';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { GetUserProfileUseCase } from '../../modules/users/application/use-cases/get-user-profile.use-case';
import { USERS_REPOSITORY_TOKENS } from '../../modules/users/domain/repositories/user.repository.tokens';
import { type IUserDomainRepository } from '../../modules/users/domain/repositories/user.repository.interface';
import { GetAgencyByOwnerUseCase } from '../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { FindAgentInAgencyUseCase } from '../../modules/agent/application/use-cases/find-agent-in-agency.use-case';
import { GetAgencyIdForAgentUseCase } from '../../modules/agent/application/use-cases/get-agency-id-for-agent.use-case';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
      private readonly getUserProfile: GetUserProfileUseCase,
      @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserDomainRepository,
     private readonly FindAgentInAgency:FindAgentInAgencyUseCase,
     private readonly getagencyIdForagent: GetAgencyIdForAgentUseCase,
  private readonly findbyOwner: GetAgencyByOwnerUseCase,
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
      
      const user = await this.getUserProfile.execute(decoded.userId);
      if (!user) throw new UnauthorizedException(t('userNotFound', lang));

      
      req.user = user;
      req.userId = user.id;

      
      req.agencyId = undefined;
      req.agencyAgentId = undefined;
      req.agentPermissions = undefined;
      req.agentStatus = undefined;

      if (user.role === 'agent') {
        // Fetch agent record
        const agentRecord = await this.FindAgentInAgency.execute(
          await this.getagencyIdForagent.execute(user.id) as number,
          user.id,
          lang,
        );
        if (!agentRecord) {
          throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
        }

       req.agencyId = agentRecord.agent.agencyId;
req.agencyAgentId = agentRecord.agent.id;
req.agentPermissions = agentRecord.permission;
req.agentStatus = agentRecord.agent.status;
      }

      if (user.role === 'agency_owner') {
       
        const agency = await this.findbyOwner.execute(user.id, lang);
        req.agencyId = agency.id;
        req.agencyAgentId = undefined; 
      }

     
 await this.userRepository.updateFields(user.id, {
        last_active: new Date(),
      });
      return true;
    } catch (error) {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }
  }
}
// const decoded = this.jwtService.verify(token, {
      //   secret: this.config.get<string>('JWT_SECRET'),
      // });