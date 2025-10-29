// src/filters/swagger/filters.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiSuccessResponse, ApiBadRequestResponse } from '../../common/swagger/response.helper.ts';
import { FiltersResponseSwaggerDto } from '../dto/filters.dto';
import { AttributesResponseDto } from '../dto/attribute.dto';
// import { CityDtoResponse, countryResponseDto } from '../dto/location.dto';

export class FiltersSwagger {
  static ApiGetFilters() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get filters',
        description: 'Fetches available filters based on language and active product status.',
      }),
    ApiSuccessResponse('Filters fetched successfully', {
        success: true,
        categories: [
          {
            id: 1,
            name: 'Residenciale',
            slug: 'residenciale',
            productCount: 0,
            subcategories: [
              {
                id: 1,
                name: 'Shtepi private',
                slug: 'shtepi-private',
                categoryId: 1,
                productCount: 0,
              },
              {
                id: 2,
                name: 'Vile',
                slug: 'vile',
                categoryId: 1,
                productCount: 0,
              },
            ],
          },
          {
            id: 2,
            name: 'Komerciale',
            slug: 'komerciale',
            productCount: 0,
            subcategories: [
              {
                id: 3,
                name: 'Hotel',
                slug: 'hotel',
                categoryId: 2,
                productCount: 0,
              },
            ],
          },
        ],
        listingTypes: [
          { id: 1, name: 'Ne shitje', slug: 'ne-shitje', productCount: 0 },
          { id: 2, name: 'Per Qera', slug: 'per-qera', productCount: 0 },
          { id: 3, name: 'Qera afat-shkurtër', slug: 'qera-afat-shkurtër', productCount: 0 },
        ],
      }),
      ApiBadRequestResponse('validationFailed', {
        lang: ['Invalid or unsupported language code'],
      }),
    );
  }

  static ApiGetAttributes() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get attributes by subcategory',
        description: 'Returns the attributes for a given subcategory ID.',
      }),
      ApiParam({
        name: 'subcategoryId',
        type: Number,
        description: 'ID of the subcategory (e.g., 10)',
      }),
      ApiQuery({
        name: 'lang',
        required: false,
        description: 'Language code (optional)',
        example: 'al',
      }),
        ApiSuccessResponse('Attributes fetched successfully', {
        success: true,
        attributes: [
          {
            id: 1,
            inputType: 'number',
            name: 'Dhoma',
            slug: 'dhoma',
            values: [
              { id: 4, name: '1 Dhome', slug: '1-dhome' },
              { id: 5, name: '2 Dhoma', slug: '2-dhoma' },
            ],
          },
          {
            id: 2,
            inputType: 'select',
            name: 'Tualete',
            slug: 'tualete',
            values: [
              { id: 6, name: '1 Tualet', slug: '1-tualet' },
              { id: 7, name: '2 Tualete', slug: '2-tualete' },
            ],
          },
        ],
      }),
      ApiBadRequestResponse('validationFailed', {
        subcategoryId: ['Invalid subcategory ID'],
      }),
    );
  }

  static ApiGetCountries() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get countries',
        description: 'Fetches all available countries.',
      }),
      ApiSuccessResponse('Countries fetched successfully', {
        countries: [{id:'1', code: 'AL', name: 'Albania' }],
      }),
    );
  }

  static ApiGetCities() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get cities by country code',
        description: 'Fetches all cities for the given country code.',
      }),
      ApiParam({
        name: 'countryCode',
        type: String,
        description: 'Country code, e.g., "al", "it"',
      }),
      ApiSuccessResponse('Cities fetched successfully', {
        cities: [{id:1, name: 'Tirana' , countryId: 1 }, {id:2, name: 'Durres' , countryId: 1  }],
      }),
      ApiBadRequestResponse('validationFailed', {
        countryCode: ['Invalid or unsupported country code'],
      }),
    );
  }
}
