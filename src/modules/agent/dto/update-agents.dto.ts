import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsDateString, IsNotEmpty, Min } from "class-validator";

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
 @IsEnum(agencyagent_status, { message: "statusInvalid" })
  status?: agencyagent_status;
}