import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '../../../common/swagger/response.helper.ts';
import {
  DashboardStatsResponseDto,
  ClickPerDayDto,
} from '../dto/dashboard-stats.dto';

export const ApiGetMyStats = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get dashboard statistics for the authenticated user',
      description:
        "Returns aggregate stats: active properties, total clicks, total saves, total properties, and a per-day click breakdown for the last 7 days. Requires authentication.",
    }),

    ApiBearerAuth(),

    ApiExtraModels(DashboardStatsResponseDto, ClickPerDayDto),
    ApiOkResponse({
      description: 'Dashboard statistics retrieved successfully',
      type: DashboardStatsResponseDto,
    }),

    ApiUnauthorizedResponse(),
  );