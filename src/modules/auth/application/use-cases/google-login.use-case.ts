
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { GoogleAuthService } from '../../infrastructure/services/google-auth.service';
import { generateUsername } from '../../../../common/utils/generate-username';
import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';
import { AuthCookieService } from '../../infrastructure/services/auth-cookie.service';
import { Response } from 'express';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly googleAuth: GoogleAuthService,
    @Inject(USER_REPO)
    private readonly users: IUserDomainRepository,
    private readonly authToken: AuthTokenService,
    private readonly cookie: AuthCookieService,
  ) {}

  async execute(idToken: string, res: Response) {
    const googleUser = await this.googleAuth.verify(idToken);

    
    const existing = await this.users.findByEmail(googleUser.email);
    let userId: number;

    if (existing) {
      userId = existing.id;
    } else {
    
      let username = googleUser.email.split('@')[0];

      if (await this.users.usernameExists(username)) {
        username = generateUsername(username);
      }

     
      userId = await this.users.create({
        email: googleUser.email,
        username,
        password: '', 
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
        role: UserRole.user, 
        status: UserStatus.active,
           email_verified: true,       
      google_user: true,            
      google_id: googleUser.id, 
      
      });
    }

    const user = await this.users.findById(userId);
 if (!user) {
      throw new NotFoundException('User not found after creation');
    }

    const accessToken  = this.authToken.generateAccessToken(user, true);
    const refreshToken = this.authToken.generateRefreshToken(user.id);

    this.cookie.setAccessCookie(res, accessToken, true);
    this.cookie.setRefreshCookie(res, refreshToken);

    return { success: true, user };
  }
}