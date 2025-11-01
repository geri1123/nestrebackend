import { IsIn, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf, IsNotEmpty } from 'class-validator';
import { agencyagent_role_in_agency } from '@prisma/client';

export class UpdateRequestStatusDto {
  @IsNotEmpty({ message: 'action is required' })  // ✅ Add this
  @IsIn(['approved', 'rejected'], { message: 'action must be either approved or rejected' })
  action: 'approved' | 'rejected';

  @ValidateIf(o => o.action === 'approved')
  @IsEnum(agencyagent_role_in_agency, { message: 'roleInAgencyRequired' })
  roleInAgency?: agencyagent_role_in_agency;

  @ValidateIf(o => o.action === 'approved')
  @IsNumber({}, { message: 'invalidCommissionRate' })
  @Min(0, { message: 'invalidCommissionRate' })
  commissionRate?: number;

  @IsOptional()
  @IsString({ message: 'reviewNotesMustBeString' })
  reviewNotes?: string;
}