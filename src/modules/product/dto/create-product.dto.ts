import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  Max, 
  IsEnum, 
  ValidateNested,
  IsNotEmpty,
  IsInt
} from 'class-validator';

export class ProductAttributeValueDto {
  @IsInt({ message: 'Attribute ID must be an integer' })
  @IsNotEmpty({ message: 'Attribute ID is required' })
  attributeId!: number;

  @IsOptional() 
  @IsInt({ message: 'Attribute Value ID must be an integer' })
  attributeValueId?: number;  
}

export class CreateProductDto {
  @IsString({ message: 'title' })
  @IsNotEmpty({ message: 'title' })
  title!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'price' })
  @Min(0, { message: 'pricePositive' })
  @IsNotEmpty({ message: 'price' })
  price!: number;

  @Type(() => Number)
  @IsInt({ message: 'cityId' }) 
  @Min(1, { message: 'cityId' })
  @IsNotEmpty({ message: 'cityId' })
  cityId!: number;

  @Type(() => Number)
  @IsInt({ message: 'subcategoryId' })  
  @IsNotEmpty({ message: 'subcategoryId' })
  subcategoryId!: number;

  @Type(() => Number)
  @IsInt({ message: "listingTypeId" })  
  @IsNotEmpty({ message: 'listingTypeId' })
  listingTypeId!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'area must be an integer' })  
  @Min(1, { message: 'area must be positive' })
  area?: number;  

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'buildYearInt' })  
  @Min(1900, { message: 'buildYearMin' })
  @Max(new Date().getFullYear(), { message: 'buildYearMax' })
  buildYear?: number;

  @IsOptional()
  
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueDto)
  attributes?: ProductAttributeValueDto[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'sold', 'pending', 'draft'], { message: 'Invalid status' })
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft';
}
