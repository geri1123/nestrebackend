// src/products/swagger/products.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';
import { SearchFiltersDto } from '../dto/product-filters.dto';
import { ApiSuccessResponse, ApiBadRequestResponse } from '../../common/swagger/response.helper.ts';

@ApiTags('Products')
export class ProductsSwagger {
  static SearchProducts() {
    return applyDecorators(
      ApiOperation({
        summary: 'Search products',
        description: 'Search products using various filters: category, price, area, cities, country, attributes, status, and sorting.'
      }),
      
      // Auto-generate query parameters from DTO
      ApiQuery({
        name: 'filters',
        required: false,
        type: SearchFiltersDto,
        style: 'deepObject',
        explode: true,
      }),

      ApiSuccessResponse('Products fetched successfully', {
        data: {
          products: [
            {
              id: 132,
              title: 'Beautiful apartment in city center',
              price: 120000,
              city: 'Tirana',
              createdAt: '2025-10-09T13:00:49.118Z',
              image: [
                { imageUrl: 'https://storage.googleapis.com/bucket/image.png' }
              ],
              categoryName: 'Residential',
              subcategoryName: 'Apartment',
              listingTypeName: 'For Sale',
              agency: {
                agency_name: 'Real Estate Agency',
                logo: 'https://storage.googleapis.com/bucket/logo.webp'
              }
            }
          ],
          totalCount: 48,
          currentPage: 1,
          totalPages: 4
        }
      }),

      ApiBadRequestResponse('Invalid query parameters', {
        errors: {
          pricelow: ['Must be a number'],
          pricehigh: ['Must be a number']
        }
      })
    );
  }
}
