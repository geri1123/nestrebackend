import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts';
import { AdvertiseDto } from '../dto/advertise.dto';

export const ApiAdvertiseDecorators = {
  AdvertiseProduct: () =>
    applyDecorators(
      HttpCode(HttpStatus.OK),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Advertise a product',
        description:
          'Creates or activates an advertisement for a product using the user wallet.',
      }),
      ApiBody({ type: AdvertiseDto }),
      ApiSuccessResponse('Product advertised successfully'),
      ApiBadRequestResponse('Advertisement failed', {
        productId: ['Invalid product ID'],
        adType: ['Invalid advertisement type'],
      }),
      ApiUnauthorizedResponse(),
    ),
};