import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { agencyagent_role_in_agency } from '@prisma/client';

export class UpdateRequestStatusDto {
  @IsEnum(['approve', 'reject'], { message: 'action must be either approve or reject' })
  action: 'approve' | 'reject';

  @ValidateIf(o => o.action === 'approve')
  @IsEnum(agencyagent_role_in_agency, { message: 'roleInAgencyRequired' })
  roleInAgency?: agencyagent_role_in_agency;

  @ValidateIf(o => o.action === 'approve')
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  commissionRate?: number;

  @IsOptional()
  @IsString({ message: 'reviewNotesMustBeString' })
  reviewNotes?: string;
}