import { agencyagent_role_in_agency, agencyagent_status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateAgentsDto {
  @IsOptional()
  @IsEnum(agencyagent_role_in_agency, { message: 'roleInAgencyRequired' })
  role_in_agency?: agencyagent_role_in_agency;

  @IsOptional()
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  @Type(() => Number)
  commission_rate?: number;

  @IsOptional()
  @IsDateString({}, { message: 'endDateInvalid' })
  end_date?: string;

  @IsOptional()
  @IsEnum(agencyagent_status, { message: 'statusInvalid' })
  status?: agencyagent_status;

  permissions?: {
    can_edit_own_post?: boolean;
    can_edit_others_post?: boolean;
    can_approve_requests?: boolean;
    can_view_all_posts?: boolean;
    can_delete_posts?: boolean;
    can_manage_agents?: boolean;
  };
}