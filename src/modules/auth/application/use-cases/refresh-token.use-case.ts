
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

 
  async execute(refreshToken: string, lang: SupportedLang) {
    let decoded: { userId: number; jti: string };

    try {
      decoded = this.authTokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException(t('invalidOrExpiredToken', lang));
    }

    const user = await this.findUserByIdUseCase.execute(decoded.userId, lang);

    const accessToken = this.authTokenService.generateAccessToken(user, false);

    return { user, accessToken };
  }
}