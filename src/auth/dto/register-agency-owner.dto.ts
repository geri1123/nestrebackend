import { IsNotEmpty, MinLength } from 'class-validator';
import { BaseRegistrationDto } from './base-registration.dto'; // static DTO now
import { t, SupportedLang } from '../../locales';

export class RegisterAgencyOwnerDto extends BaseRegistrationDto {
  @IsNotEmpty({ message: 'agencyNameRequired' })
  agency_name: string;

  @IsNotEmpty({ message: 'licenseRequired' })
  license_number: string;

  @IsNotEmpty({ message: 'addressRequired' })
  address: string;
}
