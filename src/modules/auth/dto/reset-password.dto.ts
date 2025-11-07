import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportedLang, t } from '../../../locales';




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