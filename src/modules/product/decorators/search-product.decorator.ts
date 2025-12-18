import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts';
import { ApiProductsSearchResponse } from './product-search-response.swagger';

// ---------------------------------------------------------
// TAG
// ---------------------------------------------------------
export const ApiProductTags = () =>
  applyDecorators(ApiTags('Products'));

// ---------------------------------------------------------
// SEARCH PRODUCTS (PUBLIC)
// ---------------------------------------------------------
export const ApiSearchProducts = () =>
  applyDecorators(
    ApiOperation({ summary: 'Search products (Public)' }),

    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'categoryId', required: false, type: Number }),
    ApiQuery({ name: 'subcategoryId', required: false, type: Number }),
    ApiQuery({ name: 'listingTypeId', required: false, type: Number }),
    ApiQuery({
      name: 'cities',
      required: false,
      type: String,
      example: 'Tirana,Durrës',
    }),
    ApiQuery({
      name: 'attributes[1]',
      required: false,
      type: String,
      example: '4,5',
    }),

    ApiProductsSearchResponse(),

  );

// ---------------------------------------------------------
// PRODUCTS BY AGENCY (PUBLIC)
// ---------------------------------------------------------
export const ApiSearchAgencyProducts = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get products by agency (Public)' }),

    ApiParam({
      name: 'agencyId',
      type: Number,
      example: 3,
    }),

    ApiQuery({ name: 'page', required: false, type: Number }),

    ApiProductsSearchResponse(),
  );


//=-----
//agents products
//---
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

    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),

    ApiProductsSearchResponse(),
  );