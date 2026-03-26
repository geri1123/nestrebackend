
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

    const { result, userData } = await this.prisma.$transaction(async (tx) => {
      const userData = await this.registerUserUseCase.execute(
        {
          username: dto.username,
          email: dto.email,
          password: dto.password,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
        lang,
        "agent",
        tx,
        true // Skip email
      );

      await this.createRequestUseCase.execute(
        userData.userId,
        dto,
        agency,
        lang,
        tx
      );

      return { 
        result: { userId: userData.userId },
        userData 
      };
    });

    await this.registerUserUseCase.sendVerificationEmail(
      userData.userId,
      userData.token,
      userData.email,
      userData.firstName,
      userData.role,
      lang
    );

    return {
      userId: result.userId,
      message: t("registrationSuccess", lang)
    };
  }
}