
import { IsEmail, Equals, IsNotEmpty, MinLength, IsBoolean, IsEnum, ValidateIf } from 'class-validator';
import { t, SupportedLang } from '../../locales';

export type Role = 'user' | 'agency_owner' | 'agent';

export function BaseRegistrationDtoFactory(lang: SupportedLang = 'al') {
  class BaseRegistrationDto {
    @MinLength(4, { message: t('usernameMin', lang) })
    username: string;
    @IsNotEmpty({ message: t('emailRequired', lang) })
    @IsEmail({}, { message: t('emailInvalid', lang) })
    email: string;

    @MinLength(8, { message: t('passwordMin', lang) })
    password: string;

    @ValidateIf(o => o.password !== undefined)
    @IsNotEmpty({ message: t('passwordsMismatch', lang) })
    repeatPassword: string;

    @IsNotEmpty({ message: t('firstNameRequired', lang) })
    first_name: string;

    @IsNotEmpty({ message: t('lastNameRequired', lang) })
    last_name: string;

    @Equals(true, { message: t('termsRequired', lang) })
    terms_accepted: boolean;

    @IsEnum(['user', 'agency_owner', 'agent'], { message: t('invalidRole', lang) })
    role: Role;
  }

  return BaseRegistrationDto;
}
export class RegisterFailedResponseDto {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>; 
}