

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Equals, IsNotEmpty, MinLength, Matches, IsString, ValidateIf, IsDefined } from 'class-validator';
import { Match } from '../../../common/decorators/match-password.decorator';

export class BaseRegistrationDto {
  @ApiProperty({
    example: 'user123',
    description: 'Unique username without spaces, at least 4 characters long.',
  })
 @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
@IsDefined({ message: "usernameRequired" })
@IsNotEmpty({ message: "usernameRequired" })
@IsString({ message: "usernameMustBeString" })
@MinLength(4, { message: "usernameLength" })
@Matches(/^\S+(?:\S+)*$/, { message: "usernameNoSpaces" })
username!: string;

  @ApiProperty({ example: 'user@example.com' })
@IsNotEmpty({ message: 'emailRequired' })
  // @Transform(({ value }) => value?.trim())
  
  @IsEmail({}, { message: 'emailInvalid' })
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
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'firstNameRequired' })
  first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'lastNameRequired' })
  last_name!: string;

  @ApiProperty({ example: true })
  @Equals(true, { message: 'termsRequired' })
  terms_accepted!: boolean;
}