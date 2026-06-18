import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { CreateAdminUseCase } from "./application/create-admin.use-case";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { LoginAdmin } from "./application/login-admin.use-case";
import { Response } from 'express';
import { Public } from "../../../common/decorators/public.decorator";
import { CreateAdminDto } from "./dto/register-admin.dto";
import { AdminJwtGuard } from "./guard/admin-jwt.guard";

@Public()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly createAdmin: CreateAdminUseCase,
    private readonly loginAdmin:LoginAdmin
) {}

@UseGuards(AdminJwtGuard)
  @Post('create')

  async create(@Body() body: CreateAdminDto) {
    const admin = await this.createAdmin.execute({
      email: body.email,
      name: body.name,
      password: body.password,
    });

    return {
      success: true,
      message: "Admin created successfully",
      data: admin,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.loginAdmin.execute(dto, res);
  }
}