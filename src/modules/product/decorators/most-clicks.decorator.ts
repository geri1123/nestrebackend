import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { MostClickedProductsResponseDto } from '../dto/product-frontend/most-click.dto';
import { ProductListItemDto } from '../dto/product-frontend/product-list.dto'; 

export const ApiProductsMostClickResponse = () =>
  applyDecorators(
    ApiExtraModels(MostClickedProductsResponseDto, ProductListItemDto),
    ApiOkResponse({
      description: 'Products retrieved successfully',
      type: MostClickedProductsResponseDto,
    }),
  );