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
    // Step 1: Validate business rules BEFORE the transaction
    const agency = await this.validateAgentData.execute(dto, lang);

    // Step 2 + 3 inside transaction: create user + create registration request
    const result = await this.prisma.$transaction(async (tx) => {
      
      // Create user inside tx
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

      // Create registration request inside tx
      await this.createRequestUseCase.execute(
        userId,
        dto,
        agency,
        lang,
        tx
      );

      return { userId };
    });

    // Transaction committed successfully
    return {
      userId: result.userId,
      message: t("registrationSuccess", lang)
    };
  }
}