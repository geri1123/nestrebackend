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
import { agencyagent_role_in_agency } from '@prisma/client';

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
    enum: agencyagent_role_in_agency,
    example: agencyagent_role_in_agency.agent,
    description: 'Role assigned when request is approved',
  })
  @ValidateIf(o => o.action === 'approved')
  @IsEnum(agencyagent_role_in_agency, {
    message: 'roleInAgencyRequired',
  })
  roleInAgency?: agencyagent_role_in_agency;

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
      can_edit_own_post: true,
      can_view_all_posts: true,
      can_approve_requests: false,
    can_edit_others_post:true,
    
    can_delete_posts: true,
    can_manage_agents: true
    },
    description:
      'Agent permissions (only required when approving)',
  })
  @ValidateIf(o => o.action === 'approved')
  permissions?: {
    can_edit_own_post?: boolean;
    can_edit_others_post?: boolean;
    can_approve_requests?: boolean;
    can_view_all_posts?: boolean;
    can_delete_posts?: boolean;
    can_manage_agents?: boolean;
  };
}