import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../../modules/users/application/use-cases/get-user-profile.use-case';
import { USER_REPO, type IUserDomainRepository } from '../../../modules/users/domain/repositories/user.repository.interface';
import { AuthTokenService } from './auth-token.service';
import { t, SupportedLang } from '../../../locales';
import { AuthUser } from '../types/auth-user.interface';
import { CacheService } from '../../cache/cache.service'; 

export interface AuthContext {
  user: AuthUser;
  userId: number;
}

const AUTH_CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthContextService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly getUserProfile: GetUserProfileUseCase,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,

     // Inject Redis 
    private readonly cacheService: CacheService, 
  ) {}

  extractToken(req: any): string | null {
    if (req.cookies?.token) return req.cookies.token;
    const authHeader: string | undefined = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return null;
  }

  async buildAuthContext(userId: number, lang: SupportedLang): Promise<AuthContext> {
    const cacheKey = `ctx:${userId}`;

    // Try fetching from Redis first
    const cached = await this.cacheService.get<AuthContext>(cacheKey);
    if (cached) {
    console.log('[Cache HIT] Key:', cacheKey, 'Value:', cached); 
    return cached;
  }


    // Fetch from database
    const user = await this.getUserProfile.execute(userId);
    if (!user) {
      throw new UnauthorizedException(t('userNotFound', lang));
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    };

    const context: AuthContext = {
      userId: user.id,
      user: authUser,
    };

    // Store in Redis with TTL
    await  this.cacheService.set(cacheKey, context, AUTH_CONTEXT_CACHE_TTL_MS);
 console.log('[Cache SET] Key:', cacheKey, 'Value:', context);
    return context;
  }

  async invalidateContext(userId: number): Promise<void> {
    const cacheKey = `ctx:${userId}`;
    await this.cacheService.delete(cacheKey);
  }

  async updateLastActive(userId: number): Promise<void> {
    this.userRepository
      .updateFields(userId, { last_active: new Date() })
      .catch((err) => console.error('updateLastActive failed:', err));
  }

  async authenticate(token: string, lang: SupportedLang): Promise<AuthContext> {
    const decoded = this.authTokenService.verifyAccessToken(token);
    const context = await this.buildAuthContext(decoded.userId, lang);
    this.updateLastActive(context.userId); // non-blocking
    return context;
  }
}
