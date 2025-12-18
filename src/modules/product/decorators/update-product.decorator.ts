import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiSuccessResponse,
} from '../../../common/swagger/response.helper.ts';

export const ApiUpdateProduct = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update product',
      description: 'Update product fields and images (owner or agency only)',
    }),

    ApiBearerAuth(),

    ApiParam({
      name: 'id',
      type: Number,
      example: 12,
      description: 'Product ID',
    }),

    ApiConsumes('multipart/form-data'),

    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: 'Updated apartment title',
          },
          price: {
            type: 'number',
            example: 120000,
          },
          description: {
            type: 'string',
            example: 'Updated description',
          },
          address: {
            type: 'string',
            example: 'Updated address',
          },
          area: {
            type: 'number',
            example: 130,
          },
          buildYear: {
            type: 'number',
            example: 2018,
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'sold', 'pending', 'draft'],
            example: 'active',
          },

          attributes: {
            type: 'array',
            example: [
              { attributeId: 1, attributeValueId: 4 },
              { attributeId: 2, attributeValueId: 10 },
            ],
            items: {
              type: 'object',
              properties: {
                attributeId: { type: 'number' },
                attributeValueId: { type: 'number' },
              },
            },
          },

          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'Up to 7 new product images',
          },
        },
      },
    }),

    ApiSuccessResponse('Produkti u përditësua me sukses.'),

    ApiBadRequestResponse('Gabim validimi'),
    ApiUnauthorizedResponse(),
  );