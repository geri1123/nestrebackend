import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../common/decorators/match-password.decorator';

export class ChangePasswordDto {

  @ApiProperty({ example: "oldPassword123" })
  @IsNotEmpty({ message: "currentPasswordRequired" })
  currentPassword!: string;

  @ApiProperty({ example: "newStrongPassword123" })
  @IsNotEmpty({ message: 'passwordRequired' })
  @IsString({ message: 'passwordMustBeString' })
  @MinLength(8, { message: 'newPasswordMinLength' })
  @Matches(/^\S+$/, { message: 'passwordNoSpaces' })
  newPassword!: string;

  @ApiProperty({ example: "newStrongPassword123" })
  @IsString({ message: 'passwordMustBeString' })
  @IsNotEmpty({ message: 'confirmPasswordRequired' })
  @Match('newPassword', { message: 'passwordsMismatch' })
  repeatPassword!: string;
}