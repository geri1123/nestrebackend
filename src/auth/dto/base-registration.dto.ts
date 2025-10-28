import { Transform } from 'class-transformer';
import { IsEmail, Equals, IsNotEmpty, MinLength, ValidateIf, Matches } from 'class-validator';

export class BaseRegistrationDto {
  @MinLength(4, { message: 'usernameLength' })
    @Matches(/^\S+$/, { message: 'usernameNoSpaces' }) 
  username: string;

  @IsNotEmpty({ message: 'emailRequired' })
  @IsEmail({}, { message: 'emailInvalid' })
  email: string;

  @MinLength(8, { message: 'passwordMin' })
   @Matches(/^\S+$/, { message: 'passwordNoSpaces' }) 
  password: string;

  @ValidateIf(o => o.password !== undefined)
  @IsNotEmpty({ message: 'passwordsMismatch' })
  repeatPassword: string;

  @IsNotEmpty({ message: 'firstNameRequired' })
    @Transform(({ value }) => value?.trim())
  first_name: string;

  @IsNotEmpty({ message: 'lastNameRequired' })
    @Transform(({ value }) => value?.trim())
  last_name: string;

  @Equals(true, { message: 'termsRequired' })
  terms_accepted: boolean;
}

export class RegisterFailedResponseDto {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>; 
}