import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
        description:
          'Returns paginated registration requests for the current agency.',
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
      ApiSuccessResponse('Registration requests retrieved successfully', {
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
        requests: [
          {
            id: 3,
            userId: 4,
            agencyId: 1,
            requestType: 'agent_license_verification',
            status: 'approved',
            requestedRole: 'agent',
            createdAt: '2025-12-17T16:43:08.995Z',
            reviewedBy: 2,
            reviewedNotes: 'Approved after review',
            reviewedAt: '2025-12-17T17:28:53.344Z',
          },
          {
            id: 2,
            userId: 1,
            agencyId: 1,
            requestType: 'agent_license_verification',
            status: 'under_review',
            requestedRole: 'agent',
            createdAt: '2025-12-17T15:47:07.093Z',
            reviewedBy: null,
            reviewedNotes: null,
            reviewedAt: null,
          },
        ],
      }),
      ApiUnauthorizedResponse(),
    ),
};