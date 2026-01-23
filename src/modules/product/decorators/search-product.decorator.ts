import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiTags,
  ApiExtraModels,
} from '@nestjs/swagger';

import { ApiProductsSearchResponse } from './product-search-response.swagger';
import { SearchFiltersDto } from '../dto/product-filters.dto';


export const ApiSearchProducts = () =>
  applyDecorators(

    ApiOperation({ summary: 'Search products (Public)' }),

    ApiExtraModels(SearchFiltersDto),
    ApiQuery({ type: SearchFiltersDto }),

    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),

    ApiProductsSearchResponse(),
  );

// PRODUCTS BY AGENCY (PUBLIC)

export const ApiSearchAgencyProducts = () =>
  applyDecorators(

    ApiOperation({ summary: 'Get products by agency (Public)' }),

    ApiParam({
      name: 'agencyId',
      type: Number,
      example: 3,
    }),

    ApiExtraModels(SearchFiltersDto),
    ApiQuery({ type: SearchFiltersDto }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),

    ApiProductsSearchResponse(),
  );

// PRODUCTS BY AGENT (PUBLIC)
export const ApiSearchAgentProducts = () =>
  applyDecorators(

    ApiOperation({
      summary: 'Get products by agent (Public)',
      description: 'Get active products published by a specific agent',
    }),

    ApiParam({
      name: 'agentId',
      type: Number,
      example: 7,
      description: 'Agent (user) ID',
    }),

    ApiExtraModels(SearchFiltersDto),
    ApiQuery({ type: SearchFiltersDto }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),

    ApiProductsSearchResponse(),
  );