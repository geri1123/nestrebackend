
// import { Injectable } from '@nestjs/common';
// import { SupportedLang } from '../../../../locales';
// import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
// import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';

// @Injectable()
// export class RefreshTokenUseCase {
//   constructor(
//     private readonly authTokenService: AuthTokenService,
//     private readonly findUserByIdUseCase: FindUserByIdUseCase,
//   ) {}

//   async execute(userId: number, lang: SupportedLang) {
//     const user = await this.findUserByIdUseCase.execute(userId, lang);

    
//     const token = this.authTokenService.generate(user, 1);

//     return { user, token };
//   }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupportedLang, t } from '../../../../locales';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  /**
   * Validates the refresh token and issues a fresh access token.
   * The refresh token itself is NOT rotated here — if you want full
   * rotation (new refresh token on every use + old one invalidated),
   * add a token-revocation table and swap the refresh cookie in the controller.
   */
  async execute(refreshToken: string, lang: SupportedLang) {
    let decoded: { userId: number; jti: string };

    try {
      decoded = this.authTokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }

    const user = await this.findUserByIdUseCase.execute(decoded.userId, lang);

    // Issue a new short-lived access token (rememberMe = false → 1 h)
    const accessToken = this.authTokenService.generateAccessToken(user, false);

    return { user, accessToken };
  }
}