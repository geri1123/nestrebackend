import { Injectable } from '@nestjs/common';
import { RegisterAgentDto } from '../../dto/register-agent.dto';
import { CreateAgentRequestUseCase } from '../../../registration-request/application/use-cases/create-agent-request.use-case';
import { SupportedLang, t } from '../../../../locales';
import { RegisterUserUseCase } from './register-user.use-case';
import { ValidateAgentRegistrationDataUseCase } from './validate-agent-registration-data.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class RegisterAgentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validateAgentData: ValidateAgentRegistrationDataUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly createRequestUseCase: CreateAgentRequestUseCase,
  ) {}

  async execute(dto: RegisterAgentDto, lang: SupportedLang) {
    const agency = await this.validateAgentData.execute(dto, lang);

    const result = await this.prisma.$transaction(async (tx) => {
      
      const { userId } = await this.registerUserUseCase.execute(
        {
          username: dto.username,
          email: dto.email,
          password: dto.password,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
        lang,
        "agent",
        tx
      );

      await this.createRequestUseCase.execute(
        userId,
        dto,
        agency,
        lang,
        tx
      );

      return { userId };
    });

    return {
      userId: result.userId,
      message: t("registrationSuccess", lang)
    };
  }
}