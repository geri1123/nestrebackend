import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { PRODUCTS_SEARCH_EXAMPLE } from './product-search.example';
import { ApiUnauthorizedResponse } from '../../../common/swagger/response.helper.ts';

const isProd = process.env.NODE_ENV === 'production';

export const ApiDashboardProducts = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get dashboard products',
      description:
        'Get products for dashboard. View can be personal or agency-based.',
    }),

    // AUTH REQUIRED
    ApiBearerAuth(),

    // ---------------- QUERY PARAMS ----------------
    ApiQuery({
      name: 'view',
      required: false,
      enum: ['mine', 'agency'],
      example: 'mine',
      description: 'Choose which products to view',
    }),

    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),

    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      example: 'draft',
      description: 'Filter by product status (agency view)',
    }),

    // ---------------- RESPONSE ----------------
    ApiOkResponse({
      description: 'Dashboard products retrieved successfully',
      schema: isProd ? undefined : { example: PRODUCTS_SEARCH_EXAMPLE },
    }),

    ApiUnauthorizedResponse(),
  );