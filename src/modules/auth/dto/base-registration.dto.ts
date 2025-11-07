import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Equals, IsNotEmpty, MinLength, ValidateIf, Matches } from 'class-validator';

export class BaseRegistrationDto {
  @ApiProperty({
    example: 'user123',
    description: 'Unique username without spaces, at least 4 characters long.',
  })
  
  @MinLength(4, { message: 'usernameLength' })
    @Matches(/^\S+$/, { message: 'usernameNoSpaces' }) 
  username: string;
 @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address for registration.',
  })
  @IsNotEmpty({ message: 'emailRequired' })
  @IsEmail({}, { message: 'emailInvalid' })
  email: string;
  @ApiProperty({
    example: 'P@ssword123',
    description: 'Password must be at least 8 characters long and contain no spaces.',
  })
  @MinLength(8, { message: 'passwordMin' })
   @Matches(/^\S+$/, { message: 'passwordNoSpaces' }) 
  password: string;
@ApiProperty({
    example: 'P@ssword123',
    description: 'Must match the password field.',
  })
  @ValidateIf(o => o.password !== undefined)
  @IsNotEmpty({ message: 'passwordsMismatch' })
  repeatPassword: string;
 @ApiProperty({
    example: 'John',
    description: 'First name of the user.',
  })
  @IsNotEmpty({ message: 'firstNameRequired' })
    @Transform(({ value }) => value?.trim())
  first_name: string;
 @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user.',
  })
  @IsNotEmpty({ message: 'lastNameRequired' })
    @Transform(({ value }) => value?.trim())
  last_name: string;
 @ApiProperty({
    example: true,
    description: 'Must be true to accept the terms and conditions.',
  })
  @Equals(true, { message: 'termsRequired' })
  terms_accepted: boolean;
}

export class RegisterFailedResponseDto {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>; 
}