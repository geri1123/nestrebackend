import { ApiProperty } from '@nestjs/swagger';
import { advertisement_status, advertisement_type } from '@prisma/client';


 // DTO for product images in list view
 
export class ProductListImageDto {
  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/image.png', 
    nullable: true,
    description: 'Public URL of the product image'
  })
  imageUrl: string | null;
}


 // DTO for user information in product list

export class ProductListUserDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'Username of the product owner' 
  })
  username: string;
}

// DTO for agency information in product list

export class ProductListAgencyDto {
  @ApiProperty({ 
    example: 'Prime Real Estate',
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


  // DTO for advertisement information in product list

export class ProductListAdvertisementDto {
  @ApiProperty({ 
    example: 42,
    description: 'Advertisement ID'
  })
  id: number;

  @ApiProperty({ 
    example: 'active',
    enum: ['active', 'inactive', 'expired', 'pending'],
    description: 'Current status of the advertisement'
  })
  status: advertisement_status;
}

 // DTO for individual product in list view
 
export class ProductListItemDto {
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
    description: 'Product price in local currency'
  })
  price: number;

  @ApiProperty({ 
    example: 'Tirana',
    description: 'City where the product is located'
  })
  city: string;

  @ApiProperty({ 
    example: 'active',
    description: 'Product status'
  })
  status: string;

  @ApiProperty({ 
    example: '2025-10-09T13:00:49.118Z',
    description: 'Product creation timestamp'
  })
  createdAt: string;

  @ApiProperty({ 
    type: [ProductListImageDto],
    description: 'Array of product images (max 2 for list view)'
  })
  image: ProductListImageDto[];

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
    example: 100,
    nullable: true,
    description: 'Area of the product in square meters'
  })
  area: number | null;

  @ApiProperty({ 
    example: 5,
    description: 'User ID of the product owner'
  })
  userId: number;

  @ApiProperty({ 
    example: 3,
    nullable: true,
    description: 'Agency ID if product belongs to an agency'
  })
  agencyId: number | null;

  @ApiProperty({ 
    type: ProductListUserDto,
    description: 'User information'
  })
  user: ProductListUserDto;

  @ApiProperty({ 
    type: ProductListAgencyDto,
    nullable: true,
    description: 'Agency information if product belongs to an agency'
  })
  agency: ProductListAgencyDto | null;

  @ApiProperty({ 
    example: true,
    description: 'Whether the product has an active advertisement'
  })
  isAdvertised: boolean;

  @ApiProperty({ 
    type: ProductListAdvertisementDto,
    nullable: true,
    description: 'Active advertisement details if product is advertised'
  })
  advertisement: ProductListAdvertisementDto | null;

  @ApiProperty({ 
    example: 245,
    description: 'Total number of clicks on this product'
  })
  totalClicks: number;
}

/**
 * DTO for paginated product list response
 */
export class ProductListResponseDto {
  @ApiProperty({ 
    type: [ProductListItemDto],
    description: 'Array of products matching the search criteria'
  })
  products: ProductListItemDto[];

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