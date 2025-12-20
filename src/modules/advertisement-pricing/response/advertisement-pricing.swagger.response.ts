import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiSuccessResponse , ApiUnauthorizedResponse as ApiUnauthorizedErrorResponse } from '../../../common/swagger/response.helper.ts';

export class AdvertisementPricingSwagger {
   static GetAllPricing() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all advertisement pricing plans' }),
      ApiOkResponse({
        description: 'List of advertisement pricing plans',
        schema: {
          example: [
            {
              id: 2,
              adType: 'cheap',
              price: 5.99,
              duration: 7,
              discount: null,
              isActive: true,
              createdAt: '2025-12-17T21:07:02.017Z',
              updatedAt: '2025-12-17T21:07:02.017Z',
            },
            {
              id: 3,
              adType: 'normal',
              price: 12.99,
              duration: 14,
              discount: null,
              isActive: true,
              createdAt: '2025-12-17T21:07:27.987Z',
              updatedAt: '2025-12-17T21:07:27.987Z',
            },
            {
              id: 4,
              adType: 'premium',
              price: 19.99,
              duration: 30,
              discount: null,
              isActive: true,
              createdAt: '2025-12-17T21:08:09.561Z',
              updatedAt: '2025-12-17T21:08:09.561Z',
            },
          ],
        },
      }),
    );
  }


   static GetPricingByType() {
    return applyDecorators(
      ApiOperation({ summary: 'Get advertisement pricing by type' }),
      ApiParam({
        name: 'type',
        example: 'cheap',
        description: 'Advertisement type (cheap | normal | premium)',
      }),
      ApiOkResponse({
        description: 'Advertisement pricing',
        schema: {
          example: {
            id: 2,
            adType: 'cheap',
            price: 5.99,
            duration: 7,
            discount: null,
            isActive: true,
            createdAt: '2025-12-17T21:07:02.017Z',
            updatedAt: '2025-12-17T21:07:02.017Z',
          },
        },
      }),
    );
  }
}