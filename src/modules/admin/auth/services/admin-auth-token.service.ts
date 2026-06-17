import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { AppConfigService } from '../../../../infrastructure/config/config.service';

export interface AdminJwtPayload {
  adminId: number;
  jti: string;
}

const ADMIN_TOKEN_EXPIRY = 6 * 60 * 60; // 6h

@Injectable()
export class AdminTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
) {}

  generateAdminToken(adminId: number): string {
    const payload: AdminJwtPayload = {
      adminId,
      jti: this.generateJti(),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.adminJwtSecret,
      expiresIn: ADMIN_TOKEN_EXPIRY,
    });
  }

  verifyAdminToken(token: string): AdminJwtPayload {
    return this.jwtService.verify<AdminJwtPayload>(token, {
      secret: this.configService.adminJwtSecret,
    });
  }

  private generateJti(): string {
    return randomBytes(16).toString('hex');
  }
}