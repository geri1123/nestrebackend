// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';
import { SupportedLang, t } from '../../locales';

// DTO Factory for validation with translations
export function LoginDtoFactory(lang: SupportedLang= 'al') {
  class LoginDto {
    
    @IsString({ message: t('identifierRequired', lang) })
    @IsNotEmpty({ message: t('identifierRequired', lang) })
    identifier: string;

    @IsString({ message: t('passwordRequired', lang) })
    @IsNotEmpty({ message: t('passwordRequired', lang) })
    password: string;

    @IsOptional()
    rememberMe?: boolean;
  }

  return LoginDto;
}


export type LoginDto = InstanceType<ReturnType<typeof LoginDtoFactory>>;


export class LoginSwaggerDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username or email for login',
  })
  identifier: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Password for login',
  })
  password: string;

  @ApiProperty({
    example: false,
    description: 'Remember login for 30 days',
    required: false,
  })
  rememberMe?: boolean;
}

// Success Response DTO
export class LoginSuccessResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Successfully logged in',
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
    },
    description: 'User information',
  })
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Failure Response DTO
export class LoginFailedResponseDto {
  @ApiProperty({
    example: false,
    description: 'Indicates if the request failed',
  })
  success: boolean;

  @ApiProperty({
    example: 'Invalid credentials',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 'EMAIL_NOT_VERIFIED',
    description: 'Error code for specific errors',
    required: false,
  })
  errorCode?: string;
}