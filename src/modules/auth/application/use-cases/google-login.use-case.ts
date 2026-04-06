
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { GoogleAuthService } from '../../infrastructure/services/google-auth.service';
import { generateUsername } from '../../../../common/utils/generate-username';
import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';
import { AuthCookieService } from '../../infrastructure/services/auth-cookie.service';
import { Response } from 'express';
import { UserRole, UserStatus } from '@prisma/client';
import { UpdateLastLoginUseCase } from '../../../users/application/use-cases/update-last-login.use-case';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly googleAuth: GoogleAuthService,
    @Inject(USER_REPO)
    private readonly users: IUserDomainRepository,
    private readonly authToken: AuthTokenService,
    private readonly cookie: AuthCookieService,
    private readonly updateLastLoginUseCase: UpdateLastLoginUseCase,
  ) {}

  async execute(idToken: string, res: Response) {
    const googleUser = await this.googleAuth.verify(idToken);
    const existing = await this.users.findByEmail(googleUser.email);

    let userId: number;

    if (existing) {
      if (existing.isSuspended()) {
        throw new ForbiddenException('Account is suspended');
      }

      
      userId = existing.id;

    } else {
      let username = googleUser.email.split('@')[0];

      if (await this.users.usernameExists(username)) {
        username = generateUsername(username);
      }

      userId = await this.users.create({
        email:         googleUser.email,
        username,
        password:      null,          
        firstName:     googleUser.firstName,
        lastName:      googleUser.lastName,
        role:          UserRole.user,
        status:        UserStatus.active,  
        emailVerified: true,
        google_user:   true,
        google_id:     googleUser.id,
      });
    }

    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const accessToken  = this.authToken.generateAccessToken(user, true);
    const refreshToken = this.authToken.generateRefreshToken(user.id);

    this.cookie.setAccessCookie(res, accessToken, true);
    this.cookie.setRefreshCookie(res, refreshToken);

    await this.updateLastLoginUseCase.execute(userId);

    return { success: true, user };
  }
}