import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export type StatusType = 'active' | 'inactive' | 'sold' | 'pending' | 'draft';

export class SearchFiltersDto {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricelow?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricehigh?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  areaLow?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  areaHigh?: number;

  @IsOptional()
  @IsString()
  listingtype?: string;

  @IsOptional()
  attributes?: Record<string, string | string[]>;

  @IsOptional()
  @IsEnum(['price_asc','price_desc','date_asc','date_desc'])
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(['active','inactive','sold','pending','draft'])
  status?: StatusType;
}