import { ApiProperty } from '@nestjs/swagger';
import { user_role, user_status } from '@prisma/client';
import { UserStatus } from '../../auth/types/create-user-input';
//product Images
export class ProductImageDto {
  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/image.png', 
    nullable: true,
    description: 'Public URL of the product image'
  })
  imageUrl: string | null;
}
export class ProductUserDto {
  @ApiProperty({ nullable: true, description: 'Username of user' })
  username: string;

  @ApiProperty({ nullable: true, description: 'example@yahoo.com' })
  email?: string | null;

  @ApiProperty({ nullable: true, description: 'Arthur' })
  first_name?: string | null;

  @ApiProperty({ nullable: true, description: 'Bond' })
  last_name?: string | null;

  @ApiProperty({ nullable: true, description: '068*******' })
  phone?: string | null;

  @ApiProperty({ nullable: true, description: 'agent | agency_owner | user' })
  role?: user_role;
  @ApiProperty({nullable:true  , description:"active | suspended| inactive "})
  status?:user_status
}

//Product agency dto
export class ProductAgencyDto {
  @ApiProperty({ 
    example: 'Real Estate Agency',
    description: 'Name of the real estate agency'
  })
  agency_name?: string;

  @ApiProperty({ 
    example: 'https://storage.googleapis.com/bucket/logo.webp', 
    nullable: true,
    description: 'Public URL of the agency logo'
  })
  logo?: string | null;

   @ApiProperty({ 
    example: 'Paris', 
  
    description: 'address'
  })
  address?: string|null ;
   @ApiProperty({ 
    example: 'suspended', 
  
    description: 'agency status'
  })
  status?: string|null ;
  @ApiProperty({ 
    example: '12455455', 
  
    description: 'agency phone'
  })
  phone?: string|null ;
   @ApiProperty({ 
    example: '23/2/2012', 
  
    description: 'agency creation'
  })
  created_at?: Date ;

}


//product for frontend
export class ProductFrontendDto {
  @ApiProperty({ 
    example: 132,
    description: 'Unique product ID'
  })
  id: number;

  @ApiProperty({  example: 'Beautiful apartment in city center',description: 'Product title'})
  title: string;

  @ApiProperty({ example: 120000, description: 'Product price'})
  price: number;

  @ApiProperty({ example: 'Tirana',description: 'City where the product is located'})
  city: string;
  @ApiProperty({ example: 'Active', description: 'product status'})
  status: string;

  @ApiProperty({ example: '2025-10-09T13:00:49.118Z',description: 'Product creation timestamp'})
  createdAt: string;
  
  @ApiProperty({ type: [ProductImageDto], description: 'Array of product images (max 2)'})
  image: ProductImageDto[];

  @ApiProperty({ example: 'Residential', description: 'Category name in selected language'})
  categoryName: string;

  @ApiProperty({  example: 'Apartment',description: 'Subcategory name in selected language' })
  subcategoryName: string;

  @ApiProperty({ example: 'For Sale',description: 'Listing type name in selected language'})
  listingTypeName: string;
  @ApiProperty({example:"1", description:"user id in product"})
  userId:number;
  @ApiProperty({example:"3", description:"agencyid in product if exist"})
  agencyId?:number |null;
@ApiProperty({nullable: true,description: 'Username of user'})
user: ProductUserDto | null;
 
  @ApiProperty({ type: ProductAgencyDto, nullable: true,description: 'Agency information if product belongs to an agency'})

  agency: ProductAgencyDto | null;
}

export class ProductsSearchResponseDto {
  @ApiProperty({ type: [ProductFrontendDto],description: 'Array of products matching the search criteria'})
  products: ProductFrontendDto[];

  @ApiProperty({ example: 48,description: 'Total number of products matching the filters'})
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