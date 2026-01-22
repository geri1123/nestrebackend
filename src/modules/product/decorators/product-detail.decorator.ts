import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiBadRequestResponse } from '../../../common/swagger/response.helper.ts';
import {
  ProductDetailResponseDto,
  ProductDetailDto,
  RelatedDataDto,
} from '../dto/product-frontend/product-detail.dto'; 

export const ApiGetPublicProduct = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get public product details' }),
    ApiParam({ name: 'id', type: Number, example: 1 }),

    ApiExtraModels(ProductDetailResponseDto, ProductDetailDto, RelatedDataDto),
    ApiOkResponse({ type: ProductDetailResponseDto }),

    ApiNotFoundResponse({ description: 'Product not found' }),
    ApiBadRequestResponse('Invalid product ID'),
  );

export const ApiGetProtectedProduct = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get protected product details' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: Number, example: 1 }),

    ApiExtraModels(ProductDetailResponseDto, ProductDetailDto, RelatedDataDto),
    ApiOkResponse({ type: ProductDetailResponseDto }),

    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Product not found' }),
  );