import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { FiltersResponseDto } from '../dto/filters.dto';
import { AttributesResponseDto } from '../dto/attribute.dto';
import { CitiesResponseDto, CountriesResponseDto } from '../dto/location.dto';

export class FiltersSwagger {
  static ApiGetFilters() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get filters',
        description: 'Fetches available categories and listing types based on language and active product status.',
      }),
      ApiOkResponse({
        description: 'Filters fetched successfully',
        type: FiltersResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid language code',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'object',
              properties: {
                lang: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Invalid or unsupported language code'],
                },
              },
            },
          },
        },
      }),
    );
  }

  static ApiGetAttributes() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get attributes by subcategory',
        description: 'Returns the attributes and their values for a given subcategory ID.',
      }),
      ApiParam({
        name: 'subcategoryId',
        type: Number,
        description: 'ID of the subcategory',
        example: 1,
      }),
      ApiOkResponse({
        description: 'Attributes fetched successfully',
        type: AttributesResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid subcategory ID',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'object',
              properties: {
                subcategoryId: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Invalid subcategory ID'],
                },
              },
            },
          },
        },
      }),
    );
  }

  static ApiGetCountries() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get all countries',
        description: 'Fetches all available countries from the database.',
      }),
      ApiOkResponse({
        description: 'Countries fetched successfully',
        type: CountriesResponseDto,
      }),
    );
  }

  static ApiGetCities() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get cities by country code',
        description: 'Fetches all cities for the given country code (e.g., AL, IT, US).',
      }),
      ApiParam({
        name: 'countryCode',
        type: String,
        description: 'ISO country code (2 letters, uppercase)',
        example: 'AL',
      }),
      ApiOkResponse({
        description: 'Cities fetched successfully',
        type: CitiesResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid country code',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'object',
              properties: {
                countryCode: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Invalid or unsupported country code'],
                },
              },
            },
          },
        },
      }),
    );
  }
}
