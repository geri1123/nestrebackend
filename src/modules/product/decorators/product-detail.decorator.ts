import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PRODUCT_DETAIL_EXAMPLE } from './product-detail.example';
import { ApiBadRequestResponse } from '../../../common/swagger/response.helper.ts';

const isProd = process.env.NODE_ENV === 'production';

export const ApiProductTags = () =>
  applyDecorators(ApiTags('Products'));

export const ApiGetPublicProduct = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get public product details',
      description: 'Get full public details of a product by ID',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      example: 1,
      description: 'Product ID',
    }),

    ApiOkResponse({
      description: 'Product retrieved successfully',
      schema: isProd
        ? undefined
        : { example: PRODUCT_DETAIL_EXAMPLE },
    }),

    ApiNotFoundResponse({
      description: 'Product not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Product not found',
        },
      },
    }),

    ApiBadRequestResponse('Invalid product ID'),
  );


  export const ApiGetProtectedProduct = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get protected product details',
      description: 'Get full product details (authenticated users only)',
    }),

    ApiBearerAuth(),

    ApiParam({
      name: 'id',
      type: Number,
      example: 1,
      description: 'Product ID',
    }),

    ApiOkResponse({
      description: 'Product retrieved successfully',
      schema: isProd ? undefined : { example: PRODUCT_DETAIL_EXAMPLE },
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Product not found',
    }),
  );