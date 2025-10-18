import { ApiProperty } from '@nestjs/swagger';
import { BaseRegistrationDtoFactory } from './base-registration.dto';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { t, SupportedLang } from '../../locales';

export function RegisterAgentDtoFactory(lang: SupportedLang = 'al') {
  const BaseRegistrationDto = BaseRegistrationDtoFactory(lang);

  class RegisterAgentDto extends BaseRegistrationDto {
  
    @IsNotEmpty({ message: t('publicCodeRequired', lang) })
    public_code: string;

  
    @IsNotEmpty({ message: t('idCardRequired', lang) })
    id_card_number: string;

   
    @IsEnum(['agent', 'senior_agent', 'team_lead'], {
      message: t('agencyRoleRequired', lang),
    })
    requested_role: 'agent' | 'senior_agent' | 'team_lead';
  }

  return RegisterAgentDto;
}
