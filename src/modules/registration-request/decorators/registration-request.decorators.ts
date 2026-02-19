import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiExtraModels, getSchemaPath, ApiOkResponse } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,

} from '../../../common/swagger/response.helper.ts';
import { ActiveRequestResponseDto } from '../dto/active-request-response.dto';

export const ApiSendQuickRequest = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Send quick agent registration request' }),
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

export const ApiGetActiveRequest = () =>
  applyDecorators(
    ApiExtraModels(ActiveRequestResponseDto), 
    ApiOperation({ summary: 'Get current user active registration request' }),
    ApiOkResponse({
      description: 'Returns active request or null',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            oneOf: [
              { $ref: getSchemaPath(ActiveRequestResponseDto) },
              { type: 'null', nullable: true },
            ],
          },
        },
      },
    }),
    ApiUnauthorizedResponse(),
  );