
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AgencyStatus } from '@prisma/client';

export class GetAllAgenciesAdminDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AgencyStatus)
  status?: AgencyStatus;

  @IsOptional()
  @IsIn(['createdAt', 'agencyName'])
  sortBy?: 'createdAt' | 'agencyName' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}