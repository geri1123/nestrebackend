import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  ValidateNested,
  IsInt,
} from 'class-validator';

export class ProductAttributeValueDto {
  @Type(() => Number)
  @IsInt({ message: 'attributeId' })
  @Min(1, { message: 'attributeId' })
  attributeId!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'attributeValueId' })
  @Min(1, { message: 'attributeValueId' })
  attributeValueId?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'title' })
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'price' })
  @Min(1, { message: 'pricePositive' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'cityId' })
  @Min(1, { message: 'cityId' })
  cityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'subcategoryId' })
  @Min(1, { message: 'subcategoryId' })
  subcategoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'listingTypeId' })
  @Min(1, { message: 'listingTypeId' })
  listingTypeId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'area' })
  @Min(1, { message: 'area' })
  area?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'buildYearInt' })
  @Min(1900, { message: 'buildYearMin' })
  @Max(new Date().getFullYear(), { message: 'buildYearMax' })
  buildYear?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'sold', 'pending', 'draft'], {
    message: 'Invalid status',
  })
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft';

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueDto)
  attributes?: ProductAttributeValueDto[];
  @IsOptional()
@IsString({ each: true })
existingImageUrls?: string[];
}