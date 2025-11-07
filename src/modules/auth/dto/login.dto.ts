// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';
import { SupportedLang, t } from '../../../locales';

// DTO Factory for validation with translations

export class LoginDto {
   @ApiProperty({
    example: 'john_doe',
    description: 'Username or email for login',
  })
  @IsString({ message: 'identifierRequired' })
  @IsNotEmpty({ message: 'identifierRequired' })
  identifier: string;
@ApiProperty({
    example: 'StrongPass123!',
    description: 'Password for login',
  })
  @IsString({ message: 'passwordRequired' })
  @IsNotEmpty({ message: 'passwordRequired' })
  password: string;
 @ApiProperty({
    example: false,
    description: 'Remember login for 30 days',
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}

