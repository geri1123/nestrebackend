import { Injectable } from '@nestjs/common';
import { RegisterAgentDto } from '../../dto/register-agent.dto';
import { CreateAgentRequestUseCase } from '../../../registration-request/application/use-cases/create-agent-request.use-case';
import { SupportedLang, t } from '../../../../locales';
import { RegisterUserUseCase } from './register-user.use-case';
import { ValidateAgentRegistrationDataUseCase } from './validate-agent-registration-data.use-case';

@Injectable()
export class RegisterAgentUseCase {
  constructor(
    private readonly validateAgentData: ValidateAgentRegistrationDataUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly createRequestUseCase: CreateAgentRequestUseCase,
  ) {}

  async execute(dto: RegisterAgentDto, lang: SupportedLang) {
    // STEP 1: Validate all business rules first
    const agency = await this.validateAgentData.execute(dto, lang);

    // STEP 2: Create user
    const { userId } = await this.registerUserUseCase.execute(
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

    // STEP 3: Create registration request
    await this.createRequestUseCase.execute(userId, dto, agency, lang);

    return {
      userId,
      message: t('registrationSuccess', lang)
    };
  }
}
