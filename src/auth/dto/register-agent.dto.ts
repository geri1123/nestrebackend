import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { BaseRegistrationDto } from './base-registration.dto';

export class RegisterAgentDto extends BaseRegistrationDto {
  @ApiProperty({
    example: 'PUB-AGT-00987',
    description: 'Public code assigned by the agency to identify the agent.',
  })
  @IsNotEmpty({ message: 'publicCodeRequired' })
  public_code: string;

  @ApiProperty({
    example: 'ID-AL-12345678',
    description: 'Official ID card number of the agent.',
  })
  @IsNotEmpty({ message: 'idCardRequired' })
  id_card_number: string;

  @ApiProperty({
    example: 'agent',
    enum: ['agent', 'senior_agent', 'team_lead'],
    description:
      'Requested role within the agency. Must be one of: "agent", "senior_agent", or "team_lead".',
  })
  @IsEnum(['agent', 'senior_agent', 'team_lead'], {
    message: 'agencyRoleRequired',
  })
  requested_role: 'agent' | 'senior_agent' | 'team_lead';
}