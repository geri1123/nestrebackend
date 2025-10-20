import { ApiProperty } from '@nestjs/swagger';
export interface SubcategoryDto {
  id: number;
  name: string;
  slug: string | null;
  categoryId: number;
  productCount: number;
}

 export interface CategoryDto {
  id: number;
  name: string;
  slug: string | null;
  productCount: number;
  subcategories: SubcategoryDto[];
}

export interface ListingTypeDto {
  id: number;
  name: string;
  slug: string | null;
  productCount: number;
}


export class FiltersResponseDto {
  @ApiProperty({ type: [String] })
  categories: string[];

  @ApiProperty({ type: [String] })
  listingTypes: string[];
}



export class FiltersResponseSwaggerDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Residenciale' },
        slug: { type: 'string', nullable: true, example: 'residenciale' },
        productCount: { type: 'number', example: 68 },
        subcategories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Shtepi private' },
              slug: { type: 'string', nullable: true, example: 'shtepi-private' },
              categoryId: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 61 },
            },
          },
        },
      },
    },
  })
  categories: CategoryDto[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Ne shitje' },
        slug: { type: 'string', nullable: true, example: 'ne-shitje' },
        productCount: { type: 'number', example: 38 },
      },
    },
  })
  listingTypes: ListingTypeDto[];
}