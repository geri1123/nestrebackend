import { ApiProperty } from '@nestjs/swagger';
import { AgencyListItemResponse } from './agency-list-item.response';

export class PaginatedAgenciesResponse {
  @ApiProperty({ example: 7, description: 'Total number of agencies' })
  total!: number;
@ApiProperty({example:2 , description:"total pages "})
totalPages!:number;
  @ApiProperty({ example: 1, description: 'Current page number' })
  page!: number;

  @ApiProperty({ example: 12, description: 'Items per page' })
  limit!: number;
 
  @ApiProperty({ 
    type: [AgencyListItemResponse],
    description: 'List of agencies' 
  })
  agencies!: AgencyListItemResponse[];
}