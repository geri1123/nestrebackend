import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RegisterAgentDto } from '../../../auth/dto/register-agent.dto';
import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { CreateAgentRequestUseCase } from '../../../registration-request/application/use-cases/create-agent-request.use-case';
import { SupportedLang, t } from '../../../../locales';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { generateToken } from '../../../../common/utils/hash';
import { RegisterUserUseCase } from './register-user.use-case';

@Injectable()
export class RegisterAgentUseCase {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly createRequestUseCase: CreateAgentRequestUseCase,
  ) {}

  async execute(dto: RegisterAgentDto, lang: SupportedLang) {

    // 1) create the user
    const { userId, token } = await this.registerUserUseCase.execute(
      {
        username: dto.username,
        email: dto.email,
        password: dto.password,
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
      
      lang,
      'agent',
    );

    // 2) create agent request
    await this.createRequestUseCase.execute(userId, dto, lang);

    return {
      userId,
      message: t('registrationSuccess', lang)
    };
  }
}