import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { Public } from "../../../common/decorators/public.decorator";
import { GetEarningsStatsUseCase } from "./application/get-earnings-stats.use-case";
 
@Public()
@Controller("admin/earnings")
@UseGuards(AdminJwtGuard)
export class AdminEarningsController {
  constructor(
    private readonly getEarningsStatsUseCase: GetEarningsStatsUseCase,
  ) {}
 
  @Get("stats")
  async getStats() {
    return this.getEarningsStatsUseCase.execute();
  }
}
 