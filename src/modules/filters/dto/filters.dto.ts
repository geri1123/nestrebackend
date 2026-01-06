
import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Shtepi private' })
  name: string;

  @ApiProperty({ example: 'house', nullable: true })  
  slug: string | null;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 61 })
  productCount: number;
}

export class CategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Residenciale' })
  name: string;

  @ApiProperty({ example: 'residential', nullable: true })  
  slug: string | null;

  @ApiProperty({ example: 68 })
  productCount: number;

  @ApiProperty({ type: [SubcategoryDto] })
  subcategories: SubcategoryDto[];
}

export class ListingTypeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ne shitje' })
  name: string;

  @ApiProperty({ example: 'for-sale', nullable: true }) 
  slug: string | null;

  @ApiProperty({ example: 38 })
  productCount: number;
}

export class FiltersResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];

  @ApiProperty({ type: [ListingTypeDto] })
  listingTypes: ListingTypeDto[];
}