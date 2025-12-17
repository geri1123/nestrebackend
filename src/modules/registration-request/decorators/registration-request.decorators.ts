import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts';

export const ApiSendQuickRequest = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Send quick agent registration request',
    }),
    ApiParam({
      name: 'agencyId',
      type: Number,
      example: 12,
      description: 'ID of the agency to send the request to',
    }),
    ApiSuccessResponse('Kërkesa u dërgua me sukses.'),
    ApiBadRequestResponse('Agjensia nuk ekziston', {
      agencyId: ['ID e agjensisë është e pavlefshme'],
    }),
    ApiUnauthorizedResponse(),
  );