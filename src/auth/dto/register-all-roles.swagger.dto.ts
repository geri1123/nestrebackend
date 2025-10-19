// dto/register-all-roles.swagger.dto.ts
import { ApiProperty } from '@nestjs/swagger';

// ===========================
// RESPONSE DTOs
// ===========================

export class RegisterSuccessResponseDto {
  @ApiProperty({ 
    example: true, 
    description: 'Indicates if the request was successful' 
  })
  success: boolean;

  @ApiProperty({ 
    example: 'Registration successful', 
    description: 'Success message' 
  })
  message: string;

  @ApiProperty({ 
    example: { userId: '123e4567-e89b-12d3-a456-426614174000' },
    description: 'Registration data'
  })
  data: {
    userId: string;
  };
}

export class RegisterFailedResponseDto {
  @ApiProperty({ 
    example: false, 
    description: 'Indicates if the request failed' 
  })
  success: boolean;

  @ApiProperty({ 
    example: 'Registration failed', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({
    example: {
      email: ['Email already exists'],
      username: ['Username already exists']
    },
    description: 'Validation errors by field',
    required: false
  })
  errors?: Record<string, string[]>;
}

// ===========================
// REQUEST DTOs (for Swagger documentation only)
// ===========================

export class RegisterUserSwaggerDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'Unique username'
  })
  username: string;

  @ApiProperty({ 
    example: 'john@example.com',
    description: 'User email address'
  })
  email: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'User password (min 8 characters)'
  })
  password: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'Password confirmation (must match password)'
  })
  repeatPassword: string;

  @ApiProperty({ 
    example: 'John',
    description: 'User first name'
  })
  first_name: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'User last name'
  })
  last_name: string;

  @ApiProperty({ 
    example: true,
    description: 'User must accept terms and conditions'
  })
  terms_accepted: boolean;
}

export class RegisterAgencyOwnerSwaggerDto {
  @ApiProperty({ 
    example: 'agency_owner',
    description: 'Unique username'
  })
  username: string;

  @ApiProperty({ 
    example: 'owner@bluesky.com',
    description: 'Owner email address'
  })
  email: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'Password (min 8 characters)'
  })
  password: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'Password confirmation'
  })
  repeatPassword: string;

  @ApiProperty({ 
    example: 'John',
    description: 'Owner first name'
  })
  first_name: string;

  @ApiProperty({ 
    example: 'Smith',
    description: 'Owner last name'
  })
  last_name: string;

  @ApiProperty({ 
    example: true,
    description: 'Must accept terms and conditions'
  })
  terms_accepted: boolean;

  @ApiProperty({ 
    example: 'BlueSky Real Estate',
    description: 'Agency name'
  })
  agency_name: string;

  @ApiProperty({ 
    example: 'LIC-2025-00123',
    description: 'Agency license number'
  })
  license_number: string;

  @ApiProperty({ 
    example: 'Rruga e Dibrës 22, Tirana, Albania',
    description: 'Agency address'
  })
  address: string;
}

export class RegisterAgentSwaggerDto {
  @ApiProperty({ 
    example: 'agent_doe',
    description: 'Unique username'
  })
  username: string;

  @ApiProperty({ 
    example: 'agent@bluesky.com',
    description: 'Agent email address'
  })
  email: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'Password (min 8 characters)'
  })
  password: string;

  @ApiProperty({ 
    example: 'StrongPass123!',
    description: 'Password confirmation'
  })
  repeatPassword: string;

  @ApiProperty({ 
    example: 'Jane',
    description: 'Agent first name'
  })
  first_name: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'Agent last name'
  })
  last_name: string;

  @ApiProperty({ 
    example: true,
    description: 'Must accept terms and conditions'
  })
  terms_accepted: boolean;

  @ApiProperty({ 
    example: 'PUB-123456',
    description: 'Agency public code for joining'
  })
  public_code: string;

  @ApiProperty({ 
    example: 'IDK12345678',
    description: 'Government-issued ID card number'
  })
  id_card_number: string;

  @ApiProperty({ 
    example: 'agent',
    enum: ['agent', 'senior_agent', 'team_lead'],
    description: 'Requested role within the agency'
  })
  requested_role: 'agent' | 'senior_agent' | 'team_lead';
}