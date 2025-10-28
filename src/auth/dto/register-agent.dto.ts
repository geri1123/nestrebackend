import { IsNotEmpty, IsEnum } from 'class-validator';
import { BaseRegistrationDto } from './base-registration.dto'; // static DTO


export class RegisterAgentDto extends BaseRegistrationDto {
  @IsNotEmpty({ message: 'publicCodeRequired' })
  public_code: string;

  @IsNotEmpty({ message: 'idCardRequired' })
  id_card_number: string;

  @IsEnum(['agent', 'senior_agent', 'team_lead'], {
    message: 'agencyRoleRequired',
  })
  requested_role: 'agent' | 'senior_agent' | 'team_lead';
}