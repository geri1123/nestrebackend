import { Injectable } from '@nestjs/common';
import { RegisterAgentDto } from '../../dto/register-agent.dto';
import { GetAgencyByPublicCodeUseCase } from '../../../agency/application/use-cases/check-public-code.use-case';
import { EnsureIdCardUniqueUseCase } from '../../../agent/application/use-cases/ensure-idcard-unique.use-case';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class ValidateAgentRegistrationDataUseCase {
  constructor(
    private readonly getAgencyByPublicCode: GetAgencyByPublicCodeUseCase,
    // private readonly ensureIdCardUnique: CheckIdCardUniqueForRegistrationUseCase,
  ) {}

  async execute(dto: RegisterAgentDto, lang: SupportedLang) {
    const agency = await this.getAgencyByPublicCode.execute(dto.public_code, lang);
    
    return agency;
  }
}