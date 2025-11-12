import { ApiPropertyOptional } from "@nestjs/swagger";
import { agencyagent_status } from "@prisma/client";
import { IsOptional, IsString, IsEnum } from "class-validator";

export type sort = 'name_asc'|'name_desc'|"created_at_desc"|"created_at_asc";

export class FilterAgentsDto {
  @ApiPropertyOptional({
    description: 'Search term to filter agents by name, email, etc.',
    example: 'john',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort order for the agents list',
    example: 'name_asc',
    enum: ['name_asc', 'name_desc', 'created_at_desc', 'created_at_asc'],
  })
  @IsOptional()
  @IsEnum(['name_asc', 'name_desc', 'created_at_desc', 'created_at_asc'])
  sort?: sort;

  @ApiPropertyOptional({
    description: 'Filter agents by their current status',
    example: 'active',
    enum: agencyagent_status,
  })
  @IsOptional()
  @IsEnum(agencyagent_status)
  status?: agencyagent_status;
}