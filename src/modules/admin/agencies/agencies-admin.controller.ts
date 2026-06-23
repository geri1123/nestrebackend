import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { GetAllAgenciesAdminDto } from './dto/get-all-agencies-admin.query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { GetAllAgenciesAdminUseCase } from './application/get-agencies.use-case';

@Public()
@Controller('admin/agencies')
@UseGuards(AdminJwtGuard)
export class AdminAgenciesController {
  constructor(
    private readonly getAllAgenciesAdminUseCase: GetAllAgenciesAdminUseCase,
  ) {}

  @Get()
  async getAll(@Query() dto: GetAllAgenciesAdminDto) {
    return this.getAllAgenciesAdminUseCase.execute(dto);
  }
}