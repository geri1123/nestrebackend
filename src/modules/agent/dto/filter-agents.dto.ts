import { ApiPropertyOptional } from '@nestjs/swagger';
import { agencyagent_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export const AgentSortValues = [
  'name_asc',
  'name_desc',
  'created_at_desc',
  'created_at_asc',
] as const;

export type AgentSort = (typeof AgentSortValues)[number];

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
    enum: AgentSortValues,
  })
  @IsOptional()
  @IsEnum(AgentSortValues, { message: 'invalidSortOption' })
  sort?: AgentSort;

  @ApiPropertyOptional({
    description: 'Filter agents by their current status',
    example: 'active',
    enum: agencyagent_status,
  })
  @IsOptional()
  @IsEnum(agencyagent_status, { message: 'statusInvalid' })
  status?: agencyagent_status;
}