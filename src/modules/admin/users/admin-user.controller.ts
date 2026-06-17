import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { GetAllUsersDto } from "./dto/get-all-users.dto";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { GetAllUsersAdminUseCase } from "./application/get-all-users.use-case";
import { Public } from "../../../common/decorators/public.decorator";
import { ChangeUserStatusDto } from "./dto/change-status.dto";
import { ChangeUserStatusUseCase } from "./application/change-user-status.use-case";
@Public()
@Controller('admin/users')
@UseGuards(AdminJwtGuard)
export class AdminUserController {
  constructor(
    private readonly getAllUsers: GetAllUsersAdminUseCase,
    private readonly changeUserStatusUseCase:ChangeUserStatusUseCase
) {}

  @Get()
  async getAll(@Query() dto: GetAllUsersDto) {
    return this.getAllUsers.execute(dto);
  }
  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeUserStatusDto,){
              return this.changeUserStatusUseCase.execute(
    id,
    dto.status,
  );
  }
}