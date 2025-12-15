import { ApiProperty } from '@nestjs/swagger';


export class SubcategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Shtepi private' })
  name: string;

  @ApiProperty({ example: 'shtepi-private', nullable: true })
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

  @ApiProperty({ example: 'residenciale', nullable: true })
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

  @ApiProperty({ example: 'ne-shitje', nullable: true })
  slug: string | null;

  @ApiProperty({ example: 38 })
  productCount: number;
}

// Main response DTO
export class FiltersResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];

  @ApiProperty({ type: [ListingTypeDto] })
  listingTypes: ListingTypeDto[];
}

// import { ApiProperty } from '@nestjs/swagger';
// export interface SubcategoryDto {
//   id: number;
//   name: string;
//   slug: string | null;
//   categoryId: number;
//   productCount: number;
// }

//  export interface CategoryDto {
//   id: number;
//   name: string;
//   slug: string | null;
//   productCount: number;
//   subcategories: SubcategoryDto[];
// }

// export interface ListingTypeDto {
//   id: number;
//   name: string;
//   slug: string | null;
//   productCount: number;
// }


// export class FiltersResponseDto {
//   @ApiProperty({ type: [String] })
//   categories: string[];

//   @ApiProperty({ type: [String] })
//   listingTypes: string[];
// }



// export class FiltersResponseSwaggerDto {
//   @ApiProperty({
//     type: 'array',
//     items: {
//       type: 'object',
//       properties: {
//         id: { type: 'number', example: 1 },
//         name: { type: 'string', example: 'Residenciale' },
//         slug: { type: 'string', nullable: true, example: 'residenciale' },
//         productCount: { type: 'number', example: 68 },
//         subcategories: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               id: { type: 'number', example: 1 },
//               name: { type: 'string', example: 'Shtepi private' },
//               slug: { type: 'string', nullable: true, example: 'shtepi-private' },
//               categoryId: { type: 'number', example: 1 },
//               productCount: { type: 'number', example: 61 },
//             },
//           },
//         },
//       },
//     },
//   })
//   categories: CategoryDto[];

//   @ApiProperty({
//     type: 'array',
//     items: {
//       type: 'object',
//       properties: {
//         id: { type: 'number', example: 1 },
//         name: { type: 'string', example: 'Ne shitje' },
//         slug: { type: 'string', nullable: true, example: 'ne-shitje' },
//         productCount: { type: 'number', example: 38 },
//       },
//     },
//   })
//   listingTypes: ListingTypeDto[];
// }