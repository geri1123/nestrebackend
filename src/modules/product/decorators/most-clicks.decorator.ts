
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { PRODUCTS_MOST_CLICKS_EXAMPLE } from './products-most-clicks.example';

const isProd = process.env.NODE_ENV === 'production';

export const ApiProductsMostClickResponse = () =>
  applyDecorators(
    ApiOkResponse({
      description: 'Products retrieved successfully',
      schema: isProd
        ? undefined 
        : { example:PRODUCTS_MOST_CLICKS_EXAMPLE },
    }),
  );