import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { SearchFiltersDto } from '../../product/dto/product-filters.dto';

export function ApiSearchFilters() {
  return applyDecorators(
    ApiExtraModels(SearchFiltersDto),
    ApiQuery({
      name: 'filters',
      required: false,
      style: 'deepObject',
      explode: true,
      schema: { $ref: getSchemaPath(SearchFiltersDto) },
    }),
  );
}