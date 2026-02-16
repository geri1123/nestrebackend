import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export const RELATED_PRODUCTS_EXAMPLE = {
  products: [
    {
      id: 2,
      title: 'Apartament 2+1 ne shitje',
      price: 95000,
      city: 'Tirana',
      status: 'active',
      createdAt: '2025-12-15T10:30:00.000Z',
      image: [
        {
          imageUrl: 'https://storage.googleapis.com/bucket/image1.png',
        },
        {
          imageUrl: 'https://storage.googleapis.com/bucket/image2.png',
        },
      ],
      userId: 5,
      categoryName: 'Residential',
      subcategoryName: 'Apartment',
      listingTypeName: 'For Sale',
      user: {
        username: 'agent_john',
      },
      agency: {
        agency_name: 'Premium Real Estate',
        logo: 'https://storage.googleapis.com/bucket/logo.png',
      },
      isAdvertised: true,
      advertisement: {
        id: 10,
        status: 'active',
      },
      totalClicks: 45,
    },
    {
      id: 3,
      title: 'Apartament modern ne qender',
      price: 110000,
      city: 'Tirana',
      status: 'active',
      createdAt: '2025-12-10T14:20:00.000Z',
      image: [
        {
          imageUrl: 'https://storage.googleapis.com/bucket/image3.png',
        },
      ],
      userId: 8,
      categoryName: 'Residential',
      subcategoryName: 'Apartment',
      listingTypeName: 'For Sale',
      user: {
        username: 'seller_maria',
      },
      agency: null,
      isAdvertised: false,
      advertisement: null,
      totalClicks: 23,
    },
    {
      id: 4,
      title: 'Apartament 1+1 i renovuar',
      price: 85000,
      city: 'Durres',
      status: 'active',
      createdAt: '2025-12-08T09:15:00.000Z',
      image: [],
      userId: 12,
      categoryName: 'Residential',
      subcategoryName: 'Apartment',
      listingTypeName: 'For Sale',
      user: {
        username: 'realtor_alex',
      },
      agency: {
        agency_name: 'Coastal Properties',
        logo: null,
      },
      isAdvertised: false,
      advertisement: null,
      totalClicks: 12,
    },
  ],
};

export function ApiGetRelatedProducts() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get related products',
      description: 'Retrieves products similar to the specified product based on subcategory and category. Returns products from the same subcategory first, then fills with products from the same category if needed.',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Product ID to find related products for',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Maximum number of related products to return (1-12)',
      example: 6,
    }),
    ApiResponse({
      status: 200,
      description: 'Related products retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 2 },
                title: { type: 'string', example: 'Apartament 2+1 ne shitje' },
                price: { type: 'number', example: 95000 },
                city: { type: 'string', example: 'Tirana' },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', example: '2025-12-15T10:30:00.000Z' },
                image: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      imageUrl: { type: 'string', nullable: true },
                    },
                  },
                },
                userId: { type: 'number', example: 5 },
                categoryName: { type: 'string', example: 'Residential' },
                subcategoryName: { type: 'string', example: 'Apartment' },
                listingTypeName: { type: 'string', example: 'For Sale' },
                user: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', example: 'agent_john' },
                  },
                },
                agency: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    agency_name: { type: 'string', example: 'Premium Real Estate' },
                    logo: { type: 'string', nullable: true },
                  },
                },
                isAdvertised: { type: 'boolean', example: true },
                advertisement: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
                totalClicks: { type: 'number', example: 45 },
              },
            },
          },
        },
        example: RELATED_PRODUCTS_EXAMPLE,
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Product not found or no related products available',
      schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {},
            example: [],
          },
        },
      },
    }),
  );
}