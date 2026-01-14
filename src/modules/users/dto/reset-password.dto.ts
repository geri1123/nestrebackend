import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Match } from '../../../common/decorators/match-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsNotEmpty({ message: 'tokenRequired' })
  token: string;

  @ApiProperty({ example: 'newStrongPassword123' })
 
  @IsNotEmpty({ message: 'passwordRequired' })
   @IsString({ message: 'passwordMustBeString' })
  @MinLength(8, { message: 'newPasswordMinLength' })
  @Matches(/^\S+$/, { message: 'passwordNoSpaces' }) 
  newPassword: string;

  @ApiProperty({ example: 'newStrongPassword123' })
  @IsString({ message: 'passwordMustBeString' })
  @IsNotEmpty({ message: 'confirmPasswordRequired' })
  @Match('newPassword', { message: 'passwordsMismatch' })
  repeatPassword: string;
}

// export type ResetPasswordDto = {
//   token: string;
//   newPassword: string;
//   repeatPassword: string;
// };