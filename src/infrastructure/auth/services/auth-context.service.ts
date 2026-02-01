// import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
// import { GetUserProfileUseCase } from '../../../modules/users/application/use-cases/get-user-profile.use-case';
// import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
// import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
// import { USER_REPO, type IUserDomainRepository } from '../../../modules/users/domain/repositories/user.repository.interface';
// import { AuthTokenService, CustomJwtPayload } from './auth-token.service';
// import { t, SupportedLang } from '../../../locales';
// import { agencyagent_status } from '@prisma/client';

// export interface AuthContext {
//   user: any;
//   userId: number;
//   agencyId?: number;
//   agencyAgentId?: number;
//   agentPermissions?: any;
//   agentStatus?: agencyagent_status; 
// }

// @Injectable()
// export class AuthContextService {
//   constructor(
//     private readonly authTokenService: AuthTokenService,
//     private readonly getUserProfile: GetUserProfileUseCase,
//     @Inject(USER_REPO)
//     private readonly userRepository: IUserDomainRepository,
//     private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
//     private readonly findByOwner: GetAgencyByOwnerUseCase,
//   ) {}

//   extractToken(req: any): string | null {
//     const authHeader = req.headers.authorization;
//     return (
//       req.cookies?.token ||
//       (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
//     );
//   }

//   verifyToken(token: string): CustomJwtPayload {
//     return this.authTokenService.verify(token);
//   }

//   async buildAuthContext(
//     userId: number,
//     lang: SupportedLang,
//   ): Promise<AuthContext> {
//     const user = await this.getUserProfile.execute(userId);
    
//     if (!user) {
//       throw new UnauthorizedException(t('userNotFound', lang));
//     }

//     const context: AuthContext = {
//       user,
//       userId: user.id,
//       agencyId: undefined,
//       agencyAgentId: undefined,
//       agentPermissions: undefined,
//       agentStatus: undefined,
//     };

//     if (user.role === 'agent') {
//       const agentContext = await this.getAgentAuthContext.execute(user.id);
//       if (!agentContext) {
//         throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
//       }
      
//       context.agencyId = agentContext.agencyId;
//       context.agencyAgentId = agentContext.agencyAgentId;
//       context.agentPermissions = agentContext.permissions;
//       context.agentStatus = agentContext.status; 
//     }

//     if (user.role === 'agency_owner') {
//       const agency = await this.findByOwner.execute(user.id, lang);
//       context.agencyId = agency.id;
//       context.agencyAgentId = undefined;
//     }

//     return context;
//   }

//   async updateLastActive(userId: number): Promise<void> {
//     await this.userRepository.updateFields(userId, {
//       last_active: new Date(),
//     });
//   }

//   async authenticate(
//     token: string,
//     lang: SupportedLang,
//   ): Promise<AuthContext> {
//     const decoded = this.verifyToken(token);
//     const context = await this.buildAuthContext(decoded.userId, lang);
//     await this.updateLastActive(context.userId);
//     return context;
//   }
// }

import { Injectable, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../../modules/users/application/use-cases/get-user-profile.use-case';
import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { USER_REPO, type IUserDomainRepository } from '../../../modules/users/domain/repositories/user.repository.interface';
import { AuthTokenService } from './auth-token.service';
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

// in-memory TTL cache
interface CacheEntry<T> {
  value: T;
  expiresAt: number; 
}

class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  // Purge expired 
  purge(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// Cache auth context for 5 minutes
const AUTH_CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AuthContextService implements OnModuleInit {
  private readonly contextCache = new TtlCache<AuthContext>(AUTH_CONTEXT_CACHE_TTL_MS);
  private purgeInterval: ReturnType<typeof setInterval>;

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly getUserProfile: GetUserProfileUseCase,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
    private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
    private readonly findByOwner: GetAgencyByOwnerUseCase,
  ) {}

  
  onModuleInit(): void {
    this.purgeInterval = setInterval(() => this.contextCache.purge(), 10 * 60 * 1000);
    this.purgeInterval.unref(); 
  }

  // Token extraction 
  extractToken(req: any): string | null {
    
    if (req.cookies?.token) return req.cookies.token;

   
    const authHeader: string | undefined = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

    return null;
  }

  
  async buildAuthContext(userId: number, lang: SupportedLang): Promise<AuthContext> {
    const cacheKey = `ctx:${userId}`;
    const cached = this.contextCache.get(cacheKey);
    if (cached) return cached;

    // Cache miss  hit DB
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
      context.agencyId       = agentContext.agencyId;
      context.agencyAgentId  = agentContext.agencyAgentId;
      context.agentPermissions = agentContext.permissions;
      context.agentStatus    = agentContext.status;
    }

    if (user.role === 'agency_owner') {
      const agency = await this.findByOwner.execute(user.id, lang);
      context.agencyId = agency.id;
    }

    this.contextCache.set(cacheKey, context);
    return context;
  }

  
  invalidateContext(userId: number): void {
    this.contextCache.delete(`ctx:${userId}`);
  }


  async updateLastActive(userId: number): Promise<void> {
    
    this.userRepository
      .updateFields(userId, { last_active: new Date() })
      .catch((err) => console.error('updateLastActive failed:', err));
  }

  async authenticate(token: string, lang: SupportedLang): Promise<AuthContext> {
    const decoded = this.authTokenService.verifyAccessToken(token);
    const context = await this.buildAuthContext(decoded.userId, lang);
    this.updateLastActive(context.userId); 
    return context;
  }
}