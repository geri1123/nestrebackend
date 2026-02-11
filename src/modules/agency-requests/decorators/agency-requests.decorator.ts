import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts';
import { UpdateRequestStatusDto } from '../dto/agency-request.dto';
import { PaginatedRegistrationRequestResponseDto } from '../dto/paginated-registration-request-response.dto.js';

export const ApiAgencyRequestsDecorators = {
  UpdateRequestStatus: () =>
    applyDecorators(
      HttpCode(HttpStatus.OK),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Approve or reject an agency registration request',
        description:
          'Allows an agent or agency owner with approval permissions to approve or reject a registration request.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        example: 3,
        description: 'Registration request ID',
      }),
      ApiBody({
        type: UpdateRequestStatusDto,
        description: 'Approval or rejection payload',
      }),
      ApiSuccessResponse('Registration request updated successfully'),
      ApiBadRequestResponse('Validation failed', {
        action: ['action must be either approved or rejected'],
        roleInAgency: ['roleInAgencyRequired'],
        commissionRate: ['invalidCommissionRate'],
      }),
      ApiUnauthorizedResponse(),
    ),

   GetRegistrationRequests: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get agency registration requests',
        description: 'Returns paginated registration requests for the current agency.',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number',
      }),
      ApiQuery({
        name: 'status',
        required: false,
        example: 'under_review',
        description: 'Filter by request status',
      }),
      ApiOkResponse({
        description: 'Registration requests retrieved successfully',
        type: PaginatedRegistrationRequestResponseDto, 
      }),
    ),
};
