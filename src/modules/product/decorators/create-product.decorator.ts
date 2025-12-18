import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiSuccessResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts';
import { ProductFrontendDto } from '../dto/product-frontend.dto';

export const ApiCreateProduct = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create product',
      description: 'Create a new product with images (authenticated users only)',
    }),

    // AUTH
    ApiBearerAuth(),

    // multipart/form-data
    ApiConsumes('multipart/form-data'),

// BODY (fields + files)
    ApiBody({
      schema: {
        type: 'object',
        required: [
          'title',
          'price',
          'cityId',
          'subcategoryId',
          'listingTypeId',
        ],
        properties: {
          title: {
            type: 'string',
            example: 'Beautiful apartment in Tirana',
          },
          price: {
            type: 'number',
            example: 100000,
          },
          cityId: {
            type: 'number',
            example: 1,
          },
          subcategoryId: {
            type: 'number',
            example: 5,
          },
          listingTypeId: {
            type: 'number',
            example: 2,
          },
          description: {
            type: 'string',
            example: 'Spacious apartment near city center',
          },
          address: {
            type: 'string',
            example: 'Rruga e Kavajës',
          },
          area: {
            type: 'number',
            example: 120,
          },
          buildYear: {
            type: 'number',
            example: 2015,
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'sold', 'pending', 'draft'],
            example: 'draft',
          },

          // 🔑 attributes[]
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

          //  images[]
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'Up to 7 product images',
          },
        },
      },
    }),

 ApiSuccessResponse('Produkti u regjistrua me sukses'),
    ApiBadRequestResponse('Gabim validimi'),
    ApiUnauthorizedResponse(),

    ApiForbiddenResponse({
      description: 'User not allowed to create product',
      schema: {
        example: {
          statusCode: 403,
          message: 'User not associated with agency',
        },
      },
    }),
  );
