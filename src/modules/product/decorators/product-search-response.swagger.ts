import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductListResponseDto } from '../dto/product-frontend/product-list.dto'; // adjust path
import { ProductListItemDto } from '../dto/product-frontend/product-list.dto';

export const ApiProductsSearchResponse = () =>
  applyDecorators(
    ApiExtraModels(ProductListResponseDto, ProductListItemDto),
    ApiOkResponse({
      description: 'Products retrieved successfully',
      type: ProductListResponseDto,
    }),
  );