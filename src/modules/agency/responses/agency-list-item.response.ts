import { ApiProperty } from '@nestjs/swagger';

export class AgencyListItemResponse {
  @ApiProperty({ example: 31, description: 'Agency ID' })
  id: number;

  @ApiProperty({ example: 'DreamHomes Agency', description: 'Agency name' })
  name: string;

  @ApiProperty({ 
    example: 'https://bucket.s3.amazonaws.com/logo.jpg', 
    description: 'Agency logo URL',
    nullable: true 
  })
  logo: string | null;

  @ApiProperty({ example: 'Rruga e Kavajës 120, Tirana', description: 'Agency address' })
  address: string;

  @ApiProperty({ example: '10/12/2025', description: 'Creation date (formatted)' })
  created_at: string;
}