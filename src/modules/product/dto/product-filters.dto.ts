import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchFiltersDto {
  /* ================= SLUGS ================= */

  @ApiPropertyOptional({ description: 'Category slug', example: 'commercial' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategory slug', example: 'office' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Listing type slug', example: 'for-sale' })
  @IsOptional()
  @IsString()
  listingtype?: string;

  /* ================= IDS ================= */

  @ApiPropertyOptional({ description: 'Category ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Subcategory ID', example: 2 })
  @IsOptional()
  @Type(() => Number)
  subcategoryId?: number;

  @ApiPropertyOptional({ description: 'Listing type ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  listingTypeId?: number;

  /* ================= PRICE / AREA ================= */

  @ApiPropertyOptional({ description: 'Minimum price', example: 50000 })
  @IsOptional()
  @Type(() => Number)
  pricelow?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 200000 })
  @IsOptional()
  @Type(() => Number)
  pricehigh?: number;

  @ApiPropertyOptional({ description: 'Minimum area', example: 50 })
  @IsOptional()
  @Type(() => Number)
  areaLow?: number;

  @ApiPropertyOptional({ description: 'Maximum area', example: 150 })
  @IsOptional()
  @Type(() => Number)
  areaHigh?: number;

  /* ================= LOCATION ================= */

  @ApiPropertyOptional({ description: 'Cities', example: ['Tirana', 'Durres'], type: [String] })
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({ description: 'Country', example: 'Albania' })
  @IsOptional()
  @IsString()
  country?: string;

  /* ================= ATTRIBUTES ================= */

  @ApiPropertyOptional({
    description: 'Attribute codes → value codes',
    example: { bedrooms: '2-bedrooms,3-bedrooms', parking: 'yes' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  attributeCodes?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Resolved attribute IDs → value IDs',
    example: { 1: [4, 5], 2: [10] },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  @IsOptional()
  attributes?: Record<number, number[]>;

  /* ================= BUILD YEAR ================= */

  @ApiPropertyOptional({ description: 'Minimum build year', example: 2010 })
  @IsOptional()
  @Type(() => Number)
  buildYearMin?: number;

  @ApiPropertyOptional({ description: 'Maximum build year', example: 2020 })
  @IsOptional()
  @Type(() => Number)
  buildYearMax?: number;

  /* ================= META ================= */

  @ApiPropertyOptional({ description: 'Status', example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: ['price_asc', 'price_desc', 'date_asc', 'date_desc', 'most_clicks'],
  })
  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'date_asc', 'date_desc', 'most_clicks'])
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'most_clicks';

  @ApiPropertyOptional({ description: 'Limit', example: 12 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset', example: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ description: 'User ID', example: 5 })
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({ description: 'Agency ID', example: 3 })
  @IsOptional()
  @Type(() => Number)
  agencyId?: number;
}