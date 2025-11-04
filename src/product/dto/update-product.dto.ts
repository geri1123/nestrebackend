import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  Max, 
  IsEnum, 
  ValidateNested,
} from 'class-validator';

export class ProductAttributeValueDto {
  @IsNumber({}, { message: 'Attribute ID must be a number' })
  attributeId: number;

  @IsNumber({}, { message: 'Attribute Value ID must be a number' })
  attributeValueId: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must be positive' })
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'area must be a number' })
  area?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'buildYear must be a number' })
  @Min(1900, { message: 'buildYear min is 1900' })
  @Max(new Date().getFullYear(), { message: 'buildYear cannot be in the future' })
  buildYear?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'sold', 'pending', 'draft'], { message: 'Invalid status' })
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft';

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueDto)
  attributes?: ProductAttributeValueDto[];
}
