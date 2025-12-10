import { Inject, Injectable } from '@nestjs/common';
import {type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { GoogleAuthService } from '../../infrastructure/services/google-auth.service';
import { generateUsername } from '../../../../common/utils/generate-username';
import { AuthTokenService } from '../../infrastructure/services/auth-token.service';
import { AuthCookieService } from '../../infrastructure/services/auth-cookie.service';
import { Response } from 'express';
import { user_role, user_status } from '@prisma/client';
import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly googleAuth: GoogleAuthService,
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly users: IUserDomainRepository,
    private readonly authToken: AuthTokenService,
    private readonly cookie: AuthCookieService,
  ) {}

  async execute(idToken: string, res: Response) {
    const googleUser = await this.googleAuth.verify(idToken);

    // 1. Check if existing user
    const existing = await this.users.findByEmail(googleUser.email);
    let userId: number;

    if (existing) {
      userId = existing.id;
    } else {
      // 2. Create new username
      let username = googleUser.email.split('@')[0];

      if (await this.users.usernameExists(username)) {
        username = generateUsername(username);
      }

      // 3. Create user without password
      userId = await this.users.create({
        email: googleUser.email,
        username,
        password: '', 
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
        role: user_role.user, 
        status: user_status.active,
      });
    }

    const user = await this.users.findById(userId);

    const token = this.authToken.generate(user, 30); // 30 days
    this.cookie.setAuthCookie(res, token, true);

    return { success: true, user };
  }
}