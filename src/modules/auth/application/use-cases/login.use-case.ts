import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

    const authUser = await this.findUserForAuthUseCase.execute(identifier);
    if (!authUser) {
      throw new UnauthorizedException({ 
        message: t('invalidCredentials', lang) 
      });
    }

    const isMatch = await comparePassword(password, authUser.password);
    if (!isMatch) {
      throw new UnauthorizedException({ 
        message: t('invalidCredentials', lang) 
      });
    }

    // Check if email is verified first
    if (!authUser.email_verified) {
      throw new UnauthorizedException({ 
        message: t('emailNotVerified', lang),
        code: 'EMAIL_NOT_VERIFIED' 
      });
    }

    // Then check if account is active
    if (authUser.status !== 'active') {
      throw new UnauthorizedException({ 
        message: t('accountNotActive', lang),
        code: 'ACCOUNT_NOT_ACTIVE'
      });
    }

    const user = await this.findUserByIdUseCase.execute(authUser.id, lang);
    await this.updateLastLoginUseCase.execute(authUser.id);

    const token = this.authTokenService.generate(user, rememberMe ? 30 : 1);
    return { user, token };
  }
}

