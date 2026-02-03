
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../dto/login.dto';
import { SupportedLang, t } from '../../../../locales';
import { comparePassword } from '../../../../common/utils/hash';
import { FindUserForAuthUseCase } from '../../../users/application/use-cases/find-user-for-auth.use-case';
import { UpdateLastLoginUseCase } from '../../../users/application/use-cases/update-last-login.use-case';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly findUserForAuthUseCase: FindUserForAuthUseCase,
    private readonly updateLastLoginUseCase: UpdateLastLoginUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(dto: LoginDto, lang: SupportedLang = 'al') {
    const { identifier, password, rememberMe } = dto;

    // ── Credential lookup 
    const authUser = await this.findUserForAuthUseCase.execute(identifier);
    if (!authUser) {
      throw new UnauthorizedException({ message: t('invalidCredentials', lang) });
    }

    const isMatch = await comparePassword(password, authUser.password);
    if (!isMatch) {
      throw new UnauthorizedException({ message: t('invalidCredentials', lang) });
    }
const user = await this.findUserByIdUseCase.execute(authUser.id, lang);
  if (!user.emailVerified) {
  throw new UnauthorizedException({
    message: t('emailNotVerified', lang),
    code: 'EMAIL_NOT_VERIFIED',
  });
}

if (!user.canLogin()) {
  if (user.isPending()) {
    throw new UnauthorizedException({
      message: t('accountPending', lang),
    
    });
  } else if (user.isInactive()) {
    throw new UnauthorizedException({
      message: t('accountInactive', lang),
     
    });
  } else if (user.isSuspended()) {
    throw new UnauthorizedException({
      message: t('accountSuspended', lang),
    
    });
  }
}

   
    const accessToken  = this.authTokenService.generateAccessToken(user, rememberMe ?? false);
    const refreshToken = this.authTokenService.generateRefreshToken(user.id);

    await this.updateLastLoginUseCase.execute(authUser.id);

    return { user, accessToken, refreshToken };
  }
}