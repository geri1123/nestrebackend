import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserSwaggerDto {
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiProperty({ example: 'strongPassword123' })
  repeatPassword: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: true })
  terms_accepted: boolean;

  @ApiProperty({ example: 'user', enum: ['user'] })
  role: 'user';
}


export class RegisterAgencyOwnerSwaggerDto {
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiProperty({ example: 'strongPassword123' })
  repeatPassword: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: true })
  terms_accepted: boolean;

  @ApiProperty({ example: 'agency_owner', enum: ['agency_owner'] })
  role: 'agency_owner';

  @ApiProperty({ example: 'BlueSky Real Estate' })
  agency_name: string;

  @ApiProperty({ example: 'LIC-2025-00123' })
  license_number: string;

  @ApiProperty({ example: 'Rruga e Dibrës 22, Tirana, Albania' })
  address: string;
}


export class RegisterAgentSwaggerDto {
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiProperty({ example: 'strongPassword123' })
  repeatPassword: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: true })
  terms_accepted: boolean;

  @ApiProperty({ example: 'agent', enum: ['agent'] })
  role: 'agent';

  @ApiProperty({ example: 'PUB-123456' })
  public_code: string;

  @ApiProperty({ example: 'IDK12345678' })
  id_card_number: string;

  @ApiProperty({ example: 'agent', enum: ['agent', 'senior_agent', 'team_lead'] })
  requested_role: 'agent' | 'senior_agent' | 'team_lead';
}