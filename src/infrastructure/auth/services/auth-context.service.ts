import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../../modules/users/application/use-cases/get-user-profile.use-case';
import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { USER_REPO, type IUserDomainRepository } from '../../../modules/users/domain/repositories/user.repository.interface';
import { AuthTokenService, CustomJwtPayload } from './auth-token.service';
import { t, SupportedLang } from '../../../locales';
import { agencyagent_status } from '@prisma/client';

export interface AuthContext {
  user: any;
  userId: number;
  agencyId?: number;
  agencyAgentId?: number;
  agentPermissions?: any;
  agentStatus?: agencyagent_status; 
}

@Injectable()
export class AuthContextService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly getUserProfile: GetUserProfileUseCase,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
    private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
    private readonly findByOwner: GetAgencyByOwnerUseCase,
  ) {}

  extractToken(req: any): string | null {
    const authHeader = req.headers.authorization;
    return (
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
    );
  }

  verifyToken(token: string): CustomJwtPayload {
    return this.authTokenService.verify(token);
  }

  async buildAuthContext(
    userId: number,
    lang: SupportedLang,
  ): Promise<AuthContext> {
    const user = await this.getUserProfile.execute(userId);
    
    if (!user) {
      throw new UnauthorizedException(t('userNotFound', lang));
    }

    const context: AuthContext = {
      user,
      userId: user.id,
      agencyId: undefined,
      agencyAgentId: undefined,
      agentPermissions: undefined,
      agentStatus: undefined,
    };

    if (user.role === 'agent') {
      const agentContext = await this.getAgentAuthContext.execute(user.id);
      if (!agentContext) {
        throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
      }
      
      context.agencyId = agentContext.agencyId;
      context.agencyAgentId = agentContext.agencyAgentId;
      context.agentPermissions = agentContext.permissions;
      context.agentStatus = agentContext.status; 
    }

    if (user.role === 'agency_owner') {
      const agency = await this.findByOwner.execute(user.id, lang);
      context.agencyId = agency.id;
      context.agencyAgentId = undefined;
    }

    return context;
  }

  async updateLastActive(userId: number): Promise<void> {
    await this.userRepository.updateFields(userId, {
      last_active: new Date(),
    });
  }

  async authenticate(
    token: string,
    lang: SupportedLang,
  ): Promise<AuthContext> {
    const decoded = this.verifyToken(token);
    const context = await this.buildAuthContext(decoded.userId, lang);
    await this.updateLastActive(context.userId);
    return context;
  }
}