import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '../../../common/swagger/response.helper.ts';

import { ProductListResponseDto, ProductListItemDto } from '../dto/product-frontend/product-list.dto'; // adjust path

export const ApiDashboardProducts = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get dashboard products',
      description: 'Get products for dashboard. View can be personal or agency-based.',
    }),

    ApiBearerAuth(),

    ApiQuery({
      name: 'view',
      required: false,
      enum: ['mine', 'agency'],
      example: 'mine',
      description: 'Choose which products to view',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      example: 'draft',
      description: 'Filter by product status (agency view)',
    }),

    ApiExtraModels(ProductListResponseDto, ProductListItemDto),
    ApiOkResponse({
      description: 'Dashboard products retrieved successfully',
      type: ProductListResponseDto,
    }),

    ApiUnauthorizedResponse(),
  );