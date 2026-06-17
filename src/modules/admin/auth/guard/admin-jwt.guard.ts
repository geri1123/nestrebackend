import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdminAuthContextService } from "../services/admin-auth-context.service";
import { RequestAdmin } from "../types/request-admin.interface";

@Injectable()
export class AdminJwtGuard implements CanActivate {

  constructor(
    private readonly adminContextService: AdminAuthContextService,
    
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestAdmin>(); // ← ()

    const token = this.adminContextService.extractToken(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const adminAuthContext = await this.adminContextService.authenticate(token);
      req.admin     = adminAuthContext.admin;      
      req.adminId   = adminAuthContext.adminId;
      req.adminRole = adminAuthContext.adminRole;  
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Admin JWT Auth Error:', error);
      throw new UnauthorizedException();
    }
  }
}