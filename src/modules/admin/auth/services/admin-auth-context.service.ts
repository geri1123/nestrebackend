import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { AdminTokenService } from './admin-auth-token.service'; // ← AdminTokenService
import { CacheService } from '../../../../infrastructure/redis/cache.service';
import { AuthAdmin } from '../types/auth-admin.interface';
import { ADMIN_REPOSITORY_TOKENS } from '../domain/repositories/admin.repository.tokens';
import { IAdminRepository } from '../domain/repositories/admin.repository.interface';

export interface AdminAuthContext {
  admin: AuthAdmin;
  adminId: number;
  adminRole: AuthAdmin['role'];
}

const ADMIN_AUTH_CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AdminAuthContextService {
  constructor(
    @Inject(ADMIN_REPOSITORY_TOKENS.ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    private readonly adminTokenService: AdminTokenService, 
    private readonly cacheService: CacheService,
  ) {}

  extractToken(req: any): string | null {
    if (req.cookies?.admin_token) return req.cookies.admin_token;
    const authHeader: string | undefined = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return null;
  }

  async buildAuthContext(adminId: number): Promise<AdminAuthContext> {
    const cacheKey = `admin_ctx:${adminId}`;

    const cached = await this.cacheService.get<AdminAuthContext>(cacheKey);
    if (cached) return cached;

    const admin = await this.adminRepository.findAdminById(adminId);
    if (!admin) throw new UnauthorizedException('Admin not found');

    const authAdmin: AuthAdmin = {
      id:        admin.id,
      email:     admin.email,
      name:      admin.name,
      role:      admin.role,
      createdAt: admin.createdAt,
    };

    const context: AdminAuthContext = {
      adminId:   admin.id,
      adminRole: admin.role,
      admin:     authAdmin,
    };

    await this.cacheService.set(cacheKey, context, ADMIN_AUTH_CONTEXT_CACHE_TTL_MS);
    return context;
  }

  async invalidateContext(adminId: number): Promise<void> {
    await this.cacheService.delete(`admin_ctx:${adminId}`);
  }

  async authenticate(token: string): Promise<AdminAuthContext> {
    const decoded = this.adminTokenService.verifyAdminToken(token); 
    return this.buildAuthContext(decoded.adminId); 
  }
}