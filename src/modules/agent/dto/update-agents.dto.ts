import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAgentsDto {
  @ApiPropertyOptional({
    enum: AgencyAgentRoleInAgency,
    example: 'agent',
    description: 'Role of the agent in the agency',
  })
  @IsOptional()
  @IsEnum(AgencyAgentRoleInAgency, { message: 'roleInAgencyRequired' })
  role_in_agency?: AgencyAgentRoleInAgency;

  @ApiPropertyOptional({
    example: 10,
    description: 'Commission rate (must be >= 0)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  @Type(() => Number)
  commission_rate?: number;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Agent end date (ISO string)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDateInvalid' })
  end_date?: string;

  @ApiPropertyOptional({
    enum: AgencyAgentStatus,
    example: 'active',
    description: 'Agent status',
  })
  @IsOptional()
  @IsEnum(AgencyAgentStatus, { message: 'statusInvalid' })
  status?: AgencyAgentStatus;

  @ApiPropertyOptional({
    example: {
     can_edit_own_post: true,
    can_edit_others_post: true,
    can_approve_requests: true,
    can_view_all_posts: true,
    can_delete_posts: true,
    can_manage_agents: true,
    },
    description: 'Agent permissions',
  })
  permissions?: {
    can_edit_own_post?: boolean;
    can_edit_others_post?: boolean;
    can_approve_requests?: boolean;
    can_view_all_posts?: boolean;
    can_delete_posts?: boolean;
    can_manage_agents?: boolean;
  };
}