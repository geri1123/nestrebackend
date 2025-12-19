import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CountriesResponseDto, CitiesResponseDto } from '../dto/location.dto';
import { FiltersResponseDto } from '../dto/filters.dto';
import { AttributesResponseDto } from '../dto/attribute.dto';

export function ApiGetCountries() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all countries',
      description: 'Retrieve a list of all available countries with their codes'
    }),
    ApiResponse({
      status: 200,
      description: 'Countries retrieved successfully',
      type: CountriesResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiGetFilters() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get filters',
      description: 'Retrieve all filters (categories and listing types)',
    }),
    ApiResponse({
      status: 200,
      description: 'Filters retrieved successfully',
      type: FiltersResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiGetCities() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get cities by country',
      description: 'Retrieve all cities for a specific country'
    }),
    ApiResponse({
      status: 200,
      description: 'Cities retrieved successfully',
      type: CitiesResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid country ID',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiGetAttributes() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get attributes by subcategory',
      description: 'Retrieve all attributes and their values for a specific subcategory',
    }),
    ApiParam({
      name: 'subcategoryId',
      type: Number,
      required: true,
      example: 1,
      description: 'Subcategory ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Attributes retrieved successfully',
      type:AttributesResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid subcategory ID',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}