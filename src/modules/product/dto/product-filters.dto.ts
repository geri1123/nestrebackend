import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFiltersDto {
  // Slug fields (from URL path)
  @ApiPropertyOptional({ description: 'Category slug', example: 'commercial', type: String })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategory slug', example: 'office', type: String })
  @IsOptional()
  @IsString()
  subcategory?: string;

  // ID fields (resolved from slugs)
  @ApiPropertyOptional({ description: 'Category ID', example: 1, type: Number })
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Subcategory ID', example: 2, type: Number })
  @IsOptional()
  subcategoryId?: number;

  // Listing type (can be slug or ID)
  @ApiPropertyOptional({ description: 'Listing type slug', example: 'for-sale', type: String })
  @IsOptional()
  @IsString()
  listingtype?: string;

  @ApiPropertyOptional({ description: 'Listing type ID', example: 1, type: Number })
  @IsOptional()
  listingTypeId?: number;

  @ApiPropertyOptional({ description: 'Minimum price', example: 50000, type: Number })
  @IsOptional()
  pricelow?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 200000, type: Number })
  @IsOptional()
  pricehigh?: number;

  @ApiPropertyOptional({ description: 'Minimum area', example: 50, type: Number })
  @IsOptional()
  areaLow?: number;

  @ApiPropertyOptional({ description: 'Maximum area', example: 150, type: Number })
  @IsOptional()
  areaHigh?: number;

  @ApiPropertyOptional({ description: 'Cities', example: ['Tirana', 'Durres'], type: [String] })
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({ description: 'Country', example: 'Albania', type: String })
  @IsOptional()
  @IsString()
  country?: string;

 
  @ApiPropertyOptional({
  description: 'Attribute codes with comma-separated value codes',
  example: { bedrooms: '2-bedrooms,3-bedrooms', parking: 'yes' },
  type: 'object',
  additionalProperties: { type: 'string' },
})
@IsOptional()
  attributeCodes?: Record<string, string>;

  // Resolved: ID-based attributes (for DB queries)
 @ApiPropertyOptional({
  description: 'Attribute IDs (resolved from codes)',
  example: { 1: [4, 5], 2: [10] },
  type: 'object',
  additionalProperties: {
    type: 'array',
    items: { type: 'number' },
  },
})
@IsOptional()
  @IsOptional()
  attributes?: Record<number, number[]>;

  @ApiPropertyOptional({ description: 'Status', example: 'active', type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: ['price_asc', 'price_desc', 'date_asc', 'date_desc', 'most_clicks'],
    example: 'price_asc',
  })
  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'date_asc', 'date_desc', 'most_clicks'])
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'most_clicks';

  @ApiPropertyOptional({ description: 'Limit', example: 12, type: Number })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset', example: 0, type: Number })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ description: 'User ID', example: 5, type: Number })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ description: 'Agency ID', example: 3, type: Number })
  @IsOptional()
  @IsNumber()
  agencyId?: number;
}
// import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
// import { ApiPropertyOptional } from '@nestjs/swagger';

// export class SearchFiltersDto {
//   @ApiPropertyOptional({ description: 'Category ID to filter products', example: 1, type: Number })
//   @IsOptional()
//   categoryId?: number;

//   @ApiPropertyOptional({ description: 'Subcategory ID to filter products', example: 2, type: Number })
//   @IsOptional()
//   subcategoryId?: number;

//   @ApiPropertyOptional({ description: 'Listing type ID (e.g., for sale, for rent)', example: 1, type: Number })
//   @IsOptional()
//   listingTypeId?: number;

//   @ApiPropertyOptional({ description: 'Minimum price', example: 50000, type: Number })
//   @IsOptional()
//   pricelow?: number;

//   @ApiPropertyOptional({ description: 'Maximum price', example: 200000, type: Number })
//   @IsOptional()
//   pricehigh?: number;

//   @ApiPropertyOptional({ description: 'Minimum area in square meters', example: 50, type: Number })
//   @IsOptional()
//   areaLow?: number;

//   @ApiPropertyOptional({ description: 'Maximum area in square meters', example: 150, type: Number })
//   @IsOptional()
//   areaHigh?: number;

//   @ApiPropertyOptional({ description: 'Array of city names to filter', example: ['tirana', 'durres'], type: [String] })
//   @IsOptional()
//   cities?: string[];

//   @ApiPropertyOptional({ description: 'Country name to filter', example: 'albania', type: String })
//   @IsOptional()
//   @IsString()
//   country?: string;

//   @ApiPropertyOptional({
//     description: 'Attribute filters as key-value pairs. Key is attribute ID, value is array of attribute value IDs',
//     example: { 1: [4, 5], 2: [10] },
//     type: 'object',
//     additionalProperties: {
//       type: 'array',
//       items: { type: 'number' },
//     },
//   })
//   @IsOptional()
//   attributes?: Record<number, number[]>;

//   @ApiPropertyOptional({ description: 'Product status', example: 'active', type: String })
//   @IsOptional()
//   @IsString()
//   status?: string;

//   @ApiPropertyOptional({
//     description: 'Sort order for results',
//     enum: ['price_asc', 'price_desc', 'date_asc', 'date_desc'],
//     example: 'price_asc',
//   })
//   @IsOptional()
//   @IsEnum(['price_asc', 'price_desc', 'date_asc', 'date_desc'])
//   sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'most_clicks';

//   @ApiPropertyOptional({ description: 'Number of items per page', example: 12, type: Number })
//   @IsOptional()
//   limit?: number;

//   @ApiPropertyOptional({ description: 'Offset for pagination', example: 0, type: Number })
//   @IsOptional()
//   offset?: number;

//    @ApiPropertyOptional({ description: 'Filter by user ID (for dashboard/agents)', example: 5, type: Number })
//   @IsOptional()
//   @IsNumber()
//   userId?: number;

//   @ApiPropertyOptional({ description: 'Filter by agency ID (for dashboard/owners)', example: 3, type: Number })
//   @IsOptional()
//   @IsNumber()
//   agencyId?: number;
// }
