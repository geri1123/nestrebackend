import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUserStatsUseCase } from '../application/use-cases/get-user-stats.use-case';
import { ApiGetMyStats } from '../decorators/dashboard.decorators';
import { t } from '../../../locales';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
 
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getUserStatsUseCase: GetUserStatsUseCase) {}
 
  @Get('me/stats')
  @ApiGetMyStats()
  async getMyStats(@Req() req: RequestWithUser) {
    if (!req.userId) {
      throw new UnauthorizedException(
        t('userNotAuthenticated', req.language),
      );
    }
    return this.getUserStatsUseCase.execute(req.userId);
  }
}
 