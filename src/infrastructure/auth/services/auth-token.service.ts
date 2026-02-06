
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';

export interface CustomJwtPayload {
  userId: number;
 
  jti: string; 
}


const TOKEN_EXPIRY = {
  ACCESS_SHORT: 6 * 60 * 60,            // 6 h
  ACCESS_REMEMBER: 3 * 24 * 60 * 60,  // 3 d
  REFRESH: 30 * 24 * 60 * 60,   
} as const;

const MAX_ACCESS_EXPIRY_SECONDS = 3 * 24 * 60 * 60; // 3 d

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  //  Access token 
  generateAccessToken(user: { id: number }, rememberMe = false): string {
    const expiresIn = rememberMe ? TOKEN_EXPIRY.ACCESS_REMEMBER : TOKEN_EXPIRY.ACCESS_SHORT;

    const safeExpiry = Math.min(expiresIn, MAX_ACCESS_EXPIRY_SECONDS);

    const payload: CustomJwtPayload = {
      userId: Number(user.id),
   
      jti:      this.generateJti(),
    };

    return this.jwtService.sign(payload, {
      secret:    this.configService.jwtAccessSecret,
      expiresIn: safeExpiry,
    });
  }

  // ── Refresh token
  generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { userId, jti: this.generateJti() },
      {
        secret:    this.configService.jwtRefreshSecret,
        expiresIn: TOKEN_EXPIRY.REFRESH,
      },
    );
  }

  // ── Verification
  verifyAccessToken(token: string): CustomJwtPayload {
    return this.jwtService.verify<CustomJwtPayload>(token, {
      secret: this.configService.jwtAccessSecret,
    });
  }

  verifyRefreshToken(token: string): { userId: number; jti: string } {
    return this.jwtService.verify<{ userId: number; jti: string }>(token, {
      secret: this.configService.jwtRefreshSecret,
    });
  }

  // ── Helpers 
  private generateJti(): string {
   
    return require('crypto').randomBytes(16).toString('hex');
  }
}