import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFiltersDto {
  @ApiPropertyOptional({ description: 'Category ID to filter products', example: 1, type: Number })
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Subcategory ID to filter products', example: 2, type: Number })
  @IsOptional()
  subcategoryId?: number;

  @ApiPropertyOptional({ description: 'Listing type ID (e.g., for sale, for rent)', example: 1, type: Number })
  @IsOptional()
  listingTypeId?: number;

  @ApiPropertyOptional({ description: 'Minimum price', example: 50000, type: Number })
  @IsOptional()
  pricelow?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 200000, type: Number })
  @IsOptional()
  pricehigh?: number;

  @ApiPropertyOptional({ description: 'Minimum area in square meters', example: 50, type: Number })
  @IsOptional()
  areaLow?: number;

  @ApiPropertyOptional({ description: 'Maximum area in square meters', example: 150, type: Number })
  @IsOptional()
  areaHigh?: number;

  @ApiPropertyOptional({ description: 'Array of city names to filter', example: ['tirana', 'durres'], type: [String] })
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({ description: 'Country name to filter', example: 'albania', type: String })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Attribute filters as key-value pairs. Key is attribute ID, value is array of attribute value IDs',
    example: { 1: [4, 5], 2: [10] },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  @IsOptional()
  attributes?: Record<number, number[]>;

  @ApiPropertyOptional({ description: 'Product status', example: 'active', type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort order for results',
    enum: ['price_asc', 'price_desc', 'date_asc', 'date_desc'],
    example: 'price_asc',
  })
  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'date_asc', 'date_desc'])
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';

  @ApiPropertyOptional({ description: 'Number of items per page', example: 12, type: Number })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', example: 0, type: Number })
  @IsOptional()
  offset?: number;
}
