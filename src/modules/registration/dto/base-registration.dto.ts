import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Equals, IsNotEmpty, MinLength, Matches, IsString, IsDefined } from 'class-validator';
import { Match } from '../../../common/decorators/match-password.decorator';

export class BaseRegistrationDto {
  @ApiProperty({ example: 'user123' })
  @IsDefined({ message: 'usernameRequired' })
  @IsNotEmpty({ message: 'usernameRequired' })
  @IsString({ message: 'usernameMustBeString' })
  @MinLength(4, { message: 'usernameLength' })
  @Matches(/^\S+$/, { message: 'usernameNoSpaces' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) 
  username!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'emailRequired' })
  @IsEmail({}, { message: 'emailInvalid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) 
  email!: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'passwordRequired' })
  @MinLength(8, { message: 'passwordMin' })
  @Matches(/^\S+$/, { message: 'passwordNoSpaces' })
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