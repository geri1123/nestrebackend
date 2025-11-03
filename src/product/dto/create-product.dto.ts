import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  Max, 
  IsEnum, 
  ValidateNested, 
  ArrayMinSize 
} from 'class-validator';

export class ProductAttributeValueDto {
  @IsNumber({}, { message: 'Attribute ID must be a number' })
  attributeId: number;

  @IsNumber({}, { message: 'Attribute Value ID must be a number' })
  attributeValueId: number;
}

export class CreateProductDto {
  @IsString({ message: 'Title is required' })
  title: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be greater than 0' })
  price: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'City ID must be a number' })
  @Min(1, { message: 'City ID must be greater than 0' })
  cityId: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Subcategory ID must be a number' })
  subcategoryId: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Listing Type ID must be a number' })
  listingTypeId: number;

  @IsOptional()
  @IsString()
  description?: string = '';

  @IsOptional()
  @IsString()
  address?: string = '';

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Area must be a number' })
  area?: number = 0;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Build year must be a number' })
  @Min(1900, { message: 'Build year must be >= 1900' })
  @Max(new Date().getFullYear(), { message: `Build year cannot exceed ${new Date().getFullYear()}` })
  buildYear?: number | null = null;

@IsOptional()
@ValidateNested({ each: true })
@Type(() => ProductAttributeValueDto)
attributes?: ProductAttributeValueDto[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'sold', 'pending', 'draft'], { message: 'Invalid status' })
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft' = 'draft';
}