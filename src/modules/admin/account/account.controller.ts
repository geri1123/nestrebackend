import { Controller, Get, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { RequestAdmin } from "../auth/types/request-admin.interface";
@Public()
@Controller('admin/account')
@UseGuards(AdminJwtGuard)
export class AccountController{
    // constructor(){}
    @UseGuards()
    @Get('me')
    async getMe(@Req() req: RequestAdmin){
        if(!req.adminId){
            throw new UnauthorizedException("Admin not found")
        }
       return{
        id:req.admin.id,
        name:req.admin.name,
        email:req.admin.email,
        role:req.admin.role,
        createdAt:req.admin.createdAt,
       }
    }
}