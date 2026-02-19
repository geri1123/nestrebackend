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
  roleInAgency?: AgencyAgentRoleInAgency;  

  @ApiPropertyOptional({
    example: 10,
    description: 'Commission rate (must be >= 0)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  @Type(() => Number)
  commissionRate?: number;  

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Agent end date (ISO string)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDateInvalid' })
  endDate?: string;

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
      canEditOwnPost: true,
      canEditOthersPost: true,
      canApproveRequests: true,
      canViewAllPosts: true,
      canDeletePosts: true,
      canManageAgents: true,
    },
    description: 'Agent permissions',
  })
  permissions?: {
    canEditOwnPost?: boolean;
    canEditOthersPost?: boolean;
    canApproveRequests?: boolean;
    canViewAllPosts?: boolean;
    canDeletePosts?: boolean;
    canManageAgents?: boolean;
  };
}