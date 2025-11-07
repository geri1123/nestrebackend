import { ApiProperty } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/image.png', 
    nullable: true,
    description: 'Public URL of the product image'
  })
  imageUrl: string | null;
}

export class AgencyDto {
  @ApiProperty({ 
    example: 'Real Estate Agency',
    description: 'Name of the real estate agency'
  })
  agency_name: string;

  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/logo.webp', 
    nullable: true,
    description: 'Public URL of the agency logo'
  })
  logo: string | null;
}

export class ProductFrontendDto {
  @ApiProperty({ 
    example: 132,
    description: 'Unique product ID'
  })
  id: number;

  @ApiProperty({ 
    example: 'Beautiful apartment in city center',
    description: 'Product title'
  })
  title: string;

  @ApiProperty({ 
    example: 120000,
    description: 'Product price'
  })
  price: number;

  @ApiProperty({ 
    example: 'Tirana',
    description: 'City where the product is located'
  })
  city: string;

  @ApiProperty({ 
    example: '2025-10-09T13:00:49.118Z',
    description: 'Product creation timestamp'
  })
  createdAt: string;

  @ApiProperty({ 
    type: [ProductImageDto],
    description: 'Array of product images (max 2)'
  })
  image: ProductImageDto[];

  @ApiProperty({ 
    example: 'Residential',
    description: 'Category name in selected language'
  })
  categoryName: string;

  @ApiProperty({ 
    example: 'Apartment',
    description: 'Subcategory name in selected language'
  })
  subcategoryName: string;

  @ApiProperty({ 
    example: 'For Sale',
    description: 'Listing type name in selected language'
  })
  listingTypeName: string;

  @ApiProperty({ 
    type: AgencyDto, 
    nullable: true,
    description: 'Agency information if product belongs to an agency'
  })
  agency: AgencyDto | null;
}

export class ProductsSearchResponseDto {
  @ApiProperty({ 
    type: [ProductFrontendDto],
    description: 'Array of products matching the search criteria'
  })
  products: ProductFrontendDto[];

  @ApiProperty({ 
    example: 48,
    description: 'Total number of products matching the filters'
  })
  totalCount: number;

  @ApiProperty({ 
    example: 1,
    description: 'Current page number'
  })
  currentPage: number;

  @ApiProperty({ 
    example: 4,
    description: 'Total number of pages available'
  })
  totalPages: number;
}