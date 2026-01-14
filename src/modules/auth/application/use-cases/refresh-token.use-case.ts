
import { Injectable } from '@nestjs/common';
import { SupportedLang } from '../../../../locales';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { AuthTokenService } from '../../../../infrastructure/auth/services/auth-token.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(userId: number, lang: SupportedLang) {
    const user = await this.findUserByIdUseCase.execute(userId, lang);

    
    const token = this.authTokenService.generate(user, 1);

    return { user, token };
  }
}