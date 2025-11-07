import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  Max, 
  IsEnum, 
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty
} from 'class-validator';

export class ProductAttributeValueDto {
  @IsNumber({}, { message: 'Attribute ID must be a number' })
  attributeId: number;

  @IsNumber({}, { message: 'Attribute Value ID must be a number' })
  attributeValueId: number;
}

export class CreateProductDto {
  @IsString({ message: 'title' })
  @IsNotEmpty({ message: 'title' })
  title: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'price' })
  @Min(0, { message: 'pricePositive' })
  @IsNotEmpty({ message: 'price' })
  price: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'cityId' })
  @Min(1, { message: 'cityId' })
  @IsNotEmpty({ message: 'cityId' })
  cityId: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'subcategoryId' })
  @IsNotEmpty({ message: 'subcategoryId' })
  subcategoryId: number;

  @Type(() => Number)
  @IsNumber({}, { message: "listingTypeId" })
  @IsNotEmpty({ message: 'listingTypeId' })
  listingTypeId: number;

  @IsOptional()
  @IsString()
  description?: string = '';

  @IsOptional()
  @IsString()
  address?: string = '';

  @Type(() => Number)
  @IsOptional()
  @IsString()
  area?: Number ;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'buildYearInt' })
  @Min(1900, { message: 'buildYearMin' })
  @Max(new Date().getFullYear(), { message: `buildYearMax` })
  buildYear?: number | null = null;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueDto)
  attributes?: ProductAttributeValueDto[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'sold', 'pending', 'draft'], { message: 'Invalid status' })
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft' = 'draft';
}
