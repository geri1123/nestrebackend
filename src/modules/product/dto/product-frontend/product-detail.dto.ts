import { ApiProperty } from '@nestjs/swagger';
import { advertisement_status, advertisement_type, user_role, user_status } from '@prisma/client';

/**
 * DTO for product images in detail view
 */
export class ProductDetailImageDto {
  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/image.png', 
    nullable: true,
    description: 'Public URL of the product image'
  })
  imageUrl: string | null;
}

export class RelatedDataDto {
  @ApiProperty({ example: 5 })
  subcategoryId: number;

  @ApiProperty({ example: 2 })
  categoryId: number;
}
/**
 * DTO for user information in product detail
 */
export class ProductDetailUserDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'Username of the product owner' 
  })
  username: string;

  @ApiProperty({ 
    example: 'john@example.com',
    nullable: true,
    description: 'User email address'
  })
  email: string | null;

  @ApiProperty({ 
    example: 'John',
    nullable: true,
    description: 'User first name'
  })
  first_name: string | null;

  @ApiProperty({ 
    example: 'Doe',
    nullable: true,
    description: 'User last name'
  })
  last_name: string | null;

  @ApiProperty({ 
    example: '+355 68 123 4567',
    nullable: true,
    description: 'User phone number'
  })
  phone: string | null;

  @ApiProperty({ 
    example: 'agent',
    enum: ['agent', 'agency_owner', 'user'],
    nullable: true,
    description: 'User role'
  })
  role: user_role;

  @ApiProperty({ 
    example: 'active',
    enum: ['active', 'suspended', 'inactive'],
    nullable: true,
    description: 'User account status'
  })
  status: user_status;
}

/**
 * DTO for agency information in product detail
 */
export class ProductDetailAgencyDto {
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

  @ApiProperty({ 
    example: '123 Main Street, Tirana',
    nullable: true,
    description: 'Agency address'
  })
  address: string | null;

  @ApiProperty({ 
    example: 'active',
    nullable: true,
    description: 'Agency status'
  })
  status: string | null;

  @ApiProperty({ 
    example: '+355 4 123 4567',
    nullable: true,
    description: 'Agency phone number'
  })
  phone: string | null;

  @ApiProperty({ 
    example: '2020-01-15T10:00:00.000Z',
    description: 'Agency creation date'
  })
  created_at: Date;
}

/**
 * DTO for advertisement information in product detail
 */
export class ProductDetailAdvertisementDto {
  @ApiProperty({ 
    example: 42,
    description: 'Advertisement ID'
  })
  id: number;

  @ApiProperty({ 
    example: 'premium',
    enum: ['cheap', 'normal', 'premium'],
    description: 'Type of advertisement'
  })
  adType: advertisement_type;

  @ApiProperty({ 
    example: 'active',
    enum: ['active', 'inactive', 'expired', 'pending'],
    description: 'Current status of the advertisement'
  })
  status: advertisement_status;

  @ApiProperty({ 
    example: '2025-12-01T10:00:00.000Z',
    description: 'Advertisement start date'
  })
  startDate: string;

  @ApiProperty({ 
    example: '2025-12-31T23:59:59.000Z',
    nullable: true,
    description: 'Advertisement end date'
  })
  endDate: string | null;
}

/**
 * DTO for product detail view
 */
export class ProductDetailDto {
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
    example: '2025-10-15T08:30:22.456Z',
    description: 'Product last update timestamp'
  })
  updatedAt: string;

  @ApiProperty({ 
    example: 'Spacious 3-bedroom apartment with modern amenities...',
    nullable: true,
    description: 'Detailed product description'
  })
  description: string | null;

  @ApiProperty({ 
    example: 'Rruga e Kavajes, Nr. 123',
    nullable: true,
    description: 'Street address of the property'
  })
  streetAddress: string | null;

  @ApiProperty({ 
    example: 2020,
    nullable: true,
    description: 'Year the property was built'
  })
  buildYear: number | null;

  @ApiProperty({ 
    example: 100,
    nullable: true,
    description: 'Area of the product in square meters'
  })
  area: number | null;

  @ApiProperty({ 
    type: [ProductDetailImageDto],
    description: 'Array of all product images'
  })
  image: ProductDetailImageDto[];

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
    type: ProductDetailUserDto,
    nullable: true,
    description: 'User information'
  })
  user: ProductDetailUserDto | null;

  @ApiProperty({ 
    type: ProductDetailAgencyDto,
    nullable: true,
    description: 'Agency information if product belongs to an agency'
  })
  agency: ProductDetailAgencyDto | null;

  @ApiProperty({ 
    example: true,
    description: 'Whether the product has an active advertisement'
  })
  isAdvertised: boolean;

  @ApiProperty({ 
    type: ProductDetailAdvertisementDto,
    nullable: true,
    description: 'Active advertisement details if product is advertised'
  })
  advertisement: ProductDetailAdvertisementDto | null;

  @ApiProperty({ 
    example: 245,
    description: 'Total number of clicks on this product'
  })
  totalClicks: number;
}

/**
 * DTO for product detail response with related data
 */

export class ProductDetailResponseDto {
  @ApiProperty({ type: () => ProductDetailDto, nullable: true })
  product: ProductDetailDto | null;

  @ApiProperty({ type: () => RelatedDataDto, nullable: true })
  relatedData?: RelatedDataDto;
}