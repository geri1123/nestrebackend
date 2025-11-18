import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

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
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { AgencyCreationService } from './AgencyCreation.Service';

@Controller('agencies')
export class AgencyController {
  constructor(
    private readonly agencyService: AgencyService,
    private readonly manageAgencyService:ManageAgencyService,
    private readonly createAgencyService:AgencyCreationService
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

@Roles('agency_owner')
@Patch('upload-logo')
@UseInterceptors(FileInterceptor('file'))
async uploadAgencyLogo(
  @Req() req: RequestWithUser,
  @UploadedFile() file: Express.Multer.File,
) {
  const { language, agencyId } = req;

  if (!agencyId) {
    throw new ForbiddenException(t('noAgency', language));
  }

 const agencyLogo= await this.manageAgencyService.uploadLogo(agencyId, file, language);
   return {
      success: true,
      message:t('imagesuccessfullyUploaded', language),
      imageUrl: agencyLogo,
    };
}
@Roles('agency_owner')
@Delete("logo")
async deleteAgencyLogo(
@Req() req:RequestWithUser
){
  const {agencyId,language}=req;
    if(!agencyId){
      throw new ForbiddenException(t('noAgency', language));
    }

    await this.manageAgencyService.deletelogo(agencyId , language)
      return {
      success: true,
      message:t('imagesuccessfullydeleted', language),
    };
}

@Roles('user')
@Post('create-agency')

async createAgency(
  @Req() req:RequestWithUser,
  @Body() data: Record<string, any>, 
){
 const {userId , language}=req;
if (!userId) {
  throw new UnauthorizedException(t("userNotAuthenticated" , language));

}
const dto=plainToInstance(CreateAgencyDto , data)
const agency=await this.createAgencyService.registerAgencyFromUser(dto ,userId , language)

return {
  message: t("agencyCreatedSuccessfully", language),
  agency, 
}
}
}