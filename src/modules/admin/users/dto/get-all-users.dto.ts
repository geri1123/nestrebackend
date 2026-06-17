import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetAllUsersDto {
  @IsOptional()
  @IsIn(['active', 'deleted', 'all'])
  status?: 'active' | 'deleted' | 'all' = 'active';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'lastLogin'])
  sortBy?: 'createdAt' | 'lastLogin' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}