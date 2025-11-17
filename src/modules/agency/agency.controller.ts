import { Body, Controller, ForbiddenException, Get, Param, Patch, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { AgencyService } from './agency.service';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { SupportedLang, t } from '../../locales';
import type { RequestWithUser } from '../../common/types/request-with-user.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import  { Permissions } from '../../common/decorators/permissions.decorator';
import { RolesGuard } from '../../common/guard/role-guard';
import { plainToInstance } from 'class-transformer';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { ManageAgencyService } from './manage-agency.service';

@Controller('agencies')
export class AgencyController {
  constructor(
    private readonly agencyService: AgencyService,
    private readonly manageAgencyService:ManageAgencyService

  ) {}
  @Public()
  @Get()

async getAllAgencies(
  @Query('page') page = 1,
 
) {
   const fixedLimit = 12; 
  return this.agencyService.getPaginatedAgencies(Number(page), fixedLimit);
}

@Roles('agency_owner', 'agent')
@Get('agencyinfo')
async getAgencyInfoPrivate(@Req() req: RequestWithUser) {
   if (!req.agencyId) {
    throw new ForbiddenException(t('noAgency', req.language));
  }

  return this.agencyService.getAgencyInfo(req.agencyId, req.language, true, req);
}

@Public()
@Get(':id/detail')
async getAgencyInfoPublic(
  @Param('id') agencyId: number,
  @Req() req: RequestWithUser 
) {
  const language = req.language;
  
  return this.agencyService.getAgencyInfo(agencyId, language, false, req);
}
@Roles('agency_owner')
@Patch('update-fields')
async changeagencyfields(
  @Req() req:RequestWithUser,
  // @Query() 
   @Body() data: Record<string, any>, 
){
 const {language , agencyId}=req;
  if (!agencyId) {
    throw new ForbiddenException(t('noAgency', req.language));
  }

const dto=plainToInstance(UpdateAgencyDto , data)

return this.manageAgencyService.updateAgencyFields(dto , language , agencyId)
}

}