import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupportedLang } from '../../../../locales';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { CustomJwtPayload } from './login.use-case';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  private generateJwt(user: any, expiresInDays = 1): string {
    const payload: CustomJwtPayload = {
      userId: Number(user.id),
      username: String(user.username),
      email: String(user.email),
      role: String(user.role),
    };

    // convert days -> seconds
    const expiresInSeconds = expiresInDays * 24 * 60 * 60;

    return this.jwtService.sign(payload, {
      expiresIn: expiresInSeconds,
    });
  }

  async execute(userId: number, lang: SupportedLang) {
    const user = await this.findUserByIdUseCase.execute(userId, lang);

    // always 1-day expiration on refresh
    const token = this.generateJwt(user, 1);

    return { user, token };
  }
}