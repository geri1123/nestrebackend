import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    
    ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiSuccessResponse  , ApiBadRequestResponse } from '../../../common/swagger/response.helper.ts';
import { FilterAgentsDto } from '../dto/filter-agents.dto.js';
import { UpdateAgentsDto } from '../dto/update-agents.dto.js';
import { AgentMeResponse } from '../dto/agent-me.response.js';

export const ApiAgentDecorators = {
  GetPublicAgents: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get public agents of an agency',
        description:
          'Returns a paginated list of active agents for a public agency profile.',
      }),
        ApiExtraModels(FilterAgentsDto),
      ApiParam({
        name: 'agencyId',
        type: Number,
        example: 1,
        description: 'Agency ID',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number',
      }),
      ApiQuery({
        name: 'role',
        required: false,
        example: 'agent',
        description: 'Filter by role in agency',
      }),
      ApiQuery({
        name: 'search',
        required: false,
        example: 'geri',
        description: 'Search by agent name or username',
      }),
      ApiSuccessResponse('Agents retrieved successfully', {
        agents: [
          {
            id: 1,
            role_in_agency: 'agent',
            status: 'active',
            created_at: 'Dec 17, 2025, 18:28',
            agentUser: {
              id: 4,
              username: 'dawdawaadaswd',
              email: 'asaaaajuhgfaaasaaadad@AllFreeMail.net',
              first_name: 'geri19',
              last_name: 'celmeta',
              profile_image: null,
            },
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      }),
    ),
    GetPrivateAgents: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get agency agents (dashboard)',
        description:
          'Returns paginated agents of the current agency for dashboard usage. Requires authentication.',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number',
      }),
      ApiQuery({
        name: 'search',
        required: false,
        example: 'geri',
        description: 'Search agents by name or username',
      }),
      ApiQuery({
        name: 'status',
        required: false,
        example: 'active',
        description: 'Filter agents by status',
      }),
      ApiQuery({
        name: 'sort',
        required: false,
        example: 'created_at_desc',
        description: 'Sort order',
      }),
      ApiSuccessResponse('Agents retrieved successfully', {
        agents: [
          {
            id: 1,
            role_in_agency: 'agent',
            status: 'active',
            created_at: 'Dec 17, 2025, 18:28',
            agentUser: {
              id: 4,
              username: 'dawdawaadaswd',
              email: 'asaaaajuhgfaaasaaadad@AllFreeMail.net',
              first_name: 'geri19',
              last_name: 'celmeta',
              profile_image: null,
            },
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      }),
      ApiUnauthorizedResponse(),
    ),
    UpdateAgent: () =>
    applyDecorators(
      HttpCode(HttpStatus.OK),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Update agent in agency',
        description:
          'Updates role, status, commission rate, end date, or permissions of an agent in the agency.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'Agency agent ID',
      }),
      ApiBody({
        type: UpdateAgentsDto,
        description: 'Agent update payload',
      }),
      ApiSuccessResponse('Agent updated successfully'),
     ApiBadRequestResponse('Validation failed', {
      role_in_agency: ['roleInAgencyRequired'],
      commission_rate: ['invalidCommissionRate'],
      end_date: ['endDateInvalid'],
      status: ['statusInvalid'],
    }),

      ApiUnauthorizedResponse(),
    ),
    
 GetAgentMe: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get my agent profile',
        description:
          'Returns the authenticated agent profile including agency, permissions, and metadata.',
      }),
      ApiOkResponse({
        description: 'Agent profile retrieved successfully',
        type: AgentMeResponse,
      }),
      ApiUnauthorizedResponse({
        description: 'User is not authenticated',
      }),
    ),
GetAgentById: () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get agent by ID',
      description:
        'Returns agent profile within the current agency including permissions and metadata.',
    }),
    ApiOkResponse({
      description: 'Agent profile retrieved successfully',
      type: AgentMeResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'User is not authenticated',
    }),
  ),
};