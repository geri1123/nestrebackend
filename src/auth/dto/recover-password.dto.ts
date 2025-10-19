import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportedLang, t } from '../../locales';
export class RecoveryPasswordSwaggerDto {
  @ApiProperty({ example: 'example@yahoo.com', description: 'Email for reset pass' })
  email: string;
}

// Response DTO for success
export class ForgotPasswordSuccessResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Password reset link sent to your email', description: 'Message describing the result' })
  message: string;
}

// Response DTO for failure
export class ForgotPasswordFailedResponseDto {
  @ApiProperty({ example: false, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Email not found or invalid', description: 'Error message' })
  message: string;
}
export function RecoverPasswordDtoFactory(lang: SupportedLang) {
  class RecoverPasswordDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsString({ message: t('emailMustBeString', lang) })
    @IsEmail({}, { message: t('emailInvalid', lang) })
    @IsNotEmpty({ message: t('emailRequired', lang) })
    email: string;
  }

  return RecoverPasswordDto;
}

// Type for the DTO instance
export type RecoverPasswordDto = {
  email: string;
};
