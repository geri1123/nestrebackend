import { ApiProperty } from '@nestjs/swagger';
import { BaseRegistrationDtoFactory } from './base-registration.dto';
import { IsNotEmpty } from 'class-validator';
import { t, SupportedLang } from '../../locales';

export function RegisterAgencyOwnerDtoFactory(lang: SupportedLang = 'al') {
  const BaseRegistrationDto = BaseRegistrationDtoFactory(lang);

  class RegisterAgencyOwnerDto extends BaseRegistrationDto {
   
    @IsNotEmpty({ message: t('agencyNameRequired', lang) })
    agency_name: string;

    
    @IsNotEmpty({ message: t('licenseRequired', lang) })
    license_number: string;

   
    @IsNotEmpty({ message: t('addressRequired', lang) })
    address: string;
  }

  return RegisterAgencyOwnerDto;
}
