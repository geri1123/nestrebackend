import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { PRODUCTS_SEARCH_EXAMPLE } from './product-search.example';

const isProd = process.env.NODE_ENV === 'production';

export const ApiProductsSearchResponse = () =>
  applyDecorators(
    ApiOkResponse({
      description: 'Products retrieved successfully',
      schema: isProd
        ? undefined 
        : { example: PRODUCTS_SEARCH_EXAMPLE },
    }),
  );