// import { ApiBody, ApiProperty } from '@nestjs/swagger';
// import { Transform } from 'class-transformer';
// import { IsEmail, Equals, IsNotEmpty, MinLength, ValidateIf, Matches } from 'class-validator';
// import { Match } from '../../../common/decorators/match-password.decorator';

// export class BaseRegistrationDto {
//   @ApiProperty({
//     example: 'user123',
//     description: 'Unique username without spaces, at least 4 characters long.',
//   })
  
//   @MinLength(4, { message: 'usernameLength' })
//     @Matches(/^\S+$/, { message: 'usernameNoSpaces' }) 
//   username: string;
//  @ApiProperty({
//     example: 'user@example.com',
//     description: 'Valid email address for registration.',
//   })
//   @IsNotEmpty({ message: 'emailRequired' })
//   @IsEmail({}, { message: 'emailInvalid' })
//   email: string;
//   @ApiProperty({
//     example: 'P@ssword123',
//     description: 'Password must be at least 8 characters long and contain no spaces.',
//   })
//   @MinLength(8, { message: 'passwordMin' })
//    @Matches(/^\S+$/, { message: 'passwordNoSpaces' }) 
//   password: string;
//  @ApiProperty({ example: 'P@ssword123' })
//   @IsNotEmpty({ message: 'repeatPasswordRequired' })
//   @Match('password', { message: 'passwordsMismatch' })
//   repeatPassword: string;
//  @ApiProperty({
//     example: 'John',
//     description: 'First name of the user.',
//   })
//   @IsNotEmpty({ message: 'firstNameRequired' })
//     @Transform(({ value }) => value?.trim())
//   first_name: string;
//  @ApiProperty({
//     example: 'Doe',
//     description: 'Last name of the user.',
//   })
//   @IsNotEmpty({ message: 'lastNameRequired' })
//     @Transform(({ value }) => value?.trim())
//   last_name: string;
//  @ApiProperty({
//     example: true,
//     description: 'Must be true to accept the terms and conditions.',
//   })
//   @Equals(true, { message: 'termsRequired' })
//   terms_accepted: boolean;
// }

// export class RegisterFailedResponseDto {
//   success: boolean;
//   message: string;
//   errors?: Record<string, string[]>; 
// }

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
username: string;
//  @Transform(({ value }) => {
//   if (value === null || value === undefined) return value;
//   return typeof value === 'string' ? value.trim() : value;
// })
// @IsNotEmpty({ message: 'usernameRequired' })
// @IsString({ message: 'usernameMustBeString' })
// @MinLength(4, { message: 'usernameLength' })
// @Matches(/^\S+$/, { message: 'usernameNoSpaces' })
//   username: string;

  @ApiProperty({ example: 'user@example.com' })
@IsNotEmpty({ message: 'emailRequired' })
  // @Transform(({ value }) => value?.trim())
  
  @IsEmail({}, { message: 'emailInvalid' })
  email: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'passwordRequired' })   
  @MinLength(8, { message: 'passwordMin' })
  @Matches(/^\S+$/, { message: 'passwordNoSpaces' })
  password: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'repeatPasswordRequired' })
  @Match('password', { message: 'passwordsMismatch' })
  repeatPassword: string;

  @ApiProperty({ example: 'John' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'firstNameRequired' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'lastNameRequired' })
  last_name: string;

  @ApiProperty({ example: true })
  @Equals(true, { message: 'termsRequired' })
  terms_accepted: boolean;
}