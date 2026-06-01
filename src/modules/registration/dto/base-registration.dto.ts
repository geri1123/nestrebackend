import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Equals, IsNotEmpty, MinLength, Matches, IsString, IsDefined, ValidateIf } from 'class-validator';
import { Match } from '../../../common/decorators/match-password.decorator';

export class BaseRegistrationDto {

  @ApiProperty({ example: 'user123' })
  @Matches(/^\S+$/, { message: 'usernameNoSpaces', each: false })
  @MinLength(4, { message: 'usernameLength' })
  @IsString({ message: 'usernameMustBeString' })
  @IsNotEmpty({ message: 'usernameRequired' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  username!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'emailInvalid' })
  @IsNotEmpty({ message: 'emailRequired' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email!: string;

  @ApiProperty({ example: 'P@ssword123' })
  @Matches(/^\S+$/, { message: 'passwordNoSpaces' })
  @MinLength(8, { message: 'passwordMin' })
  @IsNotEmpty({ message: 'passwordRequired' })
  password!: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'repeatPasswordRequired' })
  @Match('password', { message: 'passwordsMismatch' })
  repeatPassword!: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: 'firstNameRequired' })
  @IsString({ message: 'firstNameMustBeString' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'lastNameRequired' })
  @IsString({ message: 'lastNameMustBeString' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName!: string;

  @ApiProperty({ example: true })
  @Equals(true, { message: 'termsRequired' })
  termsAccepted!: boolean;
}