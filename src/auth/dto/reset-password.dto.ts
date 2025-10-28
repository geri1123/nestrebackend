import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportedLang, t } from '../../locales';

export class ResetPasswordSwaggerDto {
  @ApiProperty({ example: 'abc123xyz', description: 'Token received via email' })
  token: string;

  @ApiProperty({ example: 'MyPass123', minLength: 8, description: 'New password' })
  newPassword: string;

  @ApiProperty({ example: 'MyPass123', description: 'Repeat new password' })
  repeatPassword: string;
}
export class  ResetFailedResponseDto {
  @ApiProperty({ example: false, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Token has expired...', description: 'Error message' })
  message: string;
}
export class ResetSuccessResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Password Succesfully reset', description: 'Message describing the result' })
  message: string;
}



export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsNotEmpty({ message: 'tokenRequired' })
  token: string;

  @ApiProperty({ example: 'newStrongPassword123' })
  @IsString({ message: 'passwordMustBeString' })
  @MinLength(8, { message: 'newPasswordMinLength' })
  @IsNotEmpty({ message: 'passwordRequired' })
  newPassword: string;

  @ApiProperty({ example: 'newStrongPassword123' })
  @IsString({ message: 'passwordMustBeString' })
  @IsNotEmpty({ message: 'confirmPasswordRequired' })
  repeatPassword: string;
}


// export type ResetPasswordDto = {
//   token: string;
//   newPassword: string;
//   repeatPassword: string;
// };