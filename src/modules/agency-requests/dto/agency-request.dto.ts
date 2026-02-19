import {
  IsIn,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgencyAgentRoleInAgency } from '@prisma/client';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: ['approved', 'rejected'],
    example: 'approved',
    description: 'Action to perform on the request',
  })
  @IsNotEmpty({ message: 'action is required' })
  @IsIn(['approved', 'rejected'], {
    message: 'action must be either approved or rejected',
  })
  action!: 'approved' | 'rejected';

  @ApiPropertyOptional({
    enum: AgencyAgentRoleInAgency,
    example: AgencyAgentRoleInAgency.agent,
    description: 'Role assigned when request is approved',
  })
  @ValidateIf(o => o.action === 'approved')
  @IsEnum(AgencyAgentRoleInAgency, {
    message: 'roleInAgencyRequired',
  })
  roleInAgency?: AgencyAgentRoleInAgency;

  @ApiPropertyOptional({
    example: 10,
    description: 'Commission rate (>= 0), required when approving',
  })
  @ValidateIf(o => o.action === 'approved')
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  commissionRate?: number;

  @ApiPropertyOptional({
    example: 'Documents verified',
    description: 'Optional review notes',
  })
  @IsOptional()
  @IsString({ message: 'reviewNotesMustBeString' })
  reviewNotes?: string;

  @ApiPropertyOptional({
    example: {
      canEditOwnPost: true,
      canViewAllPosts: true,
      canApproveRequests: false,
      canEditOthersPost: true,
      canDeletePosts: true,
      canManageAgents: true
    },
    description: 'Agent permissions (only required when approving)',
  })
  @ValidateIf(o => o.action === 'approved')
  permissions?: {
    canEditOwnPost?: boolean;
    canEditOthersPost?: boolean;
    canApproveRequests?: boolean;
    canViewAllPosts?: boolean;
    canDeletePosts?: boolean;
    canManageAgents?: boolean;
  };
}