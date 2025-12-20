import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import {
  ApiSuccessResponse,
  ApiUnauthorizedResponse as ApiUnauthorizedErrorResponse,
} from '../../../common/swagger/response.helper.ts';

export class SaveProductSwagger {
  static SaveProduct() {
    return applyDecorators(
      ApiOperation({ summary: 'Save product to favorites' }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Product ID',
      }),
      ApiSuccessResponse('Product saved successfully'),
      ApiUnauthorizedErrorResponse(),
    );
  }

static GetSavedProducts() {
  return applyDecorators(
    ApiOperation({ summary: 'Get saved products (favorites)' }),
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
    }),
    ApiSuccessResponse('Saved products fetched successfully', {
      products: [
        {
          id: 1,
          title: '',
          price: 0,
          categoryName: 'Komerciale',
          subcategoryName: 'Zyrë',
          listingTypeName: 'Ne-Shitje',
          city: 'Tirana',
          country: 'Albania',
          user: {
            username: 'dawdawaadaswd',
          },
          images: [],
          savedAt: 'Dec 20, 2025, 17:07',
        },
      ],
      count: 1,
      currentPage: 1,
      totalPages: 1,
    }),
    ApiUnauthorizedErrorResponse(),
  );
}
  static UnsaveProduct() {
    return applyDecorators(
      ApiOperation({ summary: 'Remove product from favorites' }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Product ID',
      }),
      ApiSuccessResponse('Product unsaved successfully'),
      ApiUnauthorizedErrorResponse(),
    );
  }
}
