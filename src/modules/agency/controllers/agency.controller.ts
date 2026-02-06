import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';

import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';

// DTOs
import { UpdateAgencyDto } from '../dto/update-agency.dto';
import { CreateAgencyDto } from '../dto/create-agency.dto';

// USE CASES
import { GetPaginatedAgenciesUseCase } from '../application/use-cases/get-paginated-agencies.use-case';
import { GetAgencyInfoUseCase } from '../application/use-cases/get-agency-info.use-case';
import { UpdateAgencyFieldsUseCase } from '../application/use-cases/update-agency-fields.use-case';
import { UploadAgencyLogoUseCase } from '../application/use-cases/upload-logo.use-case';
import { DeleteAgencyLogoUseCase } from '../application/use-cases/delete-agency-logo.use-case';
import { RegisterAgencyFromUserUseCase } from '../application/use-cases/register-agency-from-user.use-case';
import { ApiCreateAgency, ApiDeleteAgencyLogo, ApiGetAgencyInfoPrivate, ApiGetAgencyInfoPublic, ApiGetPaginatedAgencies, ApiUpdateAgencyFields, ApiUploadAgencyLogo } from '../decorators/agency.decorators';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import { validate } from 'class-validator';
import { AgencyContextGuard } from '../../../infrastructure/auth/guard/agency-context.guard';
import { RolesGuard } from '../../../infrastructure/auth/guard/role-guard';
import { RequireAgencyContext } from '../../../common/decorators/require-agency-context.decorator';
import { user_role } from '@prisma/client';

@Controller('agencies')
export class AgencyController {
  constructor(
    private readonly getPaginatedAgencies: GetPaginatedAgenciesUseCase,
    private readonly getAgencyInfo: GetAgencyInfoUseCase,
    private readonly updateAgencyFields: UpdateAgencyFieldsUseCase,
    private readonly uploadAgencyLogo: UploadAgencyLogoUseCase,
    private readonly deleteAgencyLogo: DeleteAgencyLogoUseCase,
    private readonly registerAgencyFromUser: RegisterAgencyFromUserUseCase,
  ) {}

  // PUBLIC: GET PAGINATED AGENCIES

  @Public()
  @ApiGetPaginatedAgencies()
  @Get()
  async getAllAgencies(@Query('page') page = 1, @Query('search') search?: string) {
    return this.getPaginatedAgencies.execute(Number(page), 12, search);
  }

  // PRIVATE AGENCY INFO
   @RequireAgencyContext()
    @Roles('agency_owner', 'agent')
  @UseGuards(AgencyContextGuard , RolesGuard)
 
 
  @ApiGetAgencyInfoPrivate()

  @Get('agencyinfo')
  async getAgencyInfoPrivate(@Req() req: RequestWithUser) {
    if (!req.agencyId) {
      throw new ForbiddenException(t('noAgency', req.language));
    }

    return this.getAgencyInfo.execute(
      req.agencyId,
      req.language,
      true // protected route
    );
  }

  // PUBLIC AGENCY DETAIL
  @Public()
  @ApiGetAgencyInfoPublic()
  @Get(':id/detail')
  async getAgencyInfoPublic(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.getAgencyInfo.execute(
      Number(id),
      req.language,
      false // public route
    );
  }

  // UPDATE FIELDS
  @RequireAgencyContext()              
@Roles('agency_owner')         
@UseGuards(AgencyContextGuard, RolesGuard)
  
  @Patch('update-fields')
  @ApiUpdateAgencyFields()
  async updateFields(
    @Req() req: RequestWithUser,
    @Body() dto:UpdateAgencyDto,
  ) {
    if (!req.agencyId) {
      throw new ForbiddenException(t('noAgency', req.language));
    }


    const errors = await validate(dto);
  
    if (errors.length > 0) {
      throwValidationErrors(errors, req.language);
    }
    return this.updateAgencyFields.execute(
      req.agencyId,
      dto,
      req.language,
    );
  }

  // UPLOAD LOGO
  @RequireAgencyContext()

  @Roles("agency_owner")
  @UseGuards(AgencyContextGuard , RolesGuard)
  @Patch('upload-logo')
  @ApiUploadAgencyLogo()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAgencyLogoRoute(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.agencyId) {
      throw new ForbiddenException(t('noAgency', req.language));
    }

    const imageUrl = await this.uploadAgencyLogo.execute(
      req.agencyId,
      file,
      req.language,
    );

    return {
      success: true,
      message: t('imagesuccessfullyUploaded', req.language),
      imageUrl,
    };
  }

  // DELETE LOGO
  @RequireAgencyContext()
  @UseGuards(AgencyContextGuard , RolesGuard)
  @Roles('agency_owner')
  @Delete('logo')
  @ApiDeleteAgencyLogo()
  async deleteLogo(@Req() req: RequestWithUser) {
    if (!req.agencyId) {
      throw new ForbiddenException(t('noAgency', req.language));
    }

    await this.deleteAgencyLogo.execute(req.agencyId, req.language);

    return {
      success: true,
      message: t('imagesuccessfullydeleted', req.language),
    };
  }

  // CREATE AGENCY
  
  @Roles('user')
  @UseGuards(RolesGuard)
  @Post('create-agency')
  @ApiCreateAgency()
  async createAgency(
    @Req() req: RequestWithUser,
    @Body() dto: CreateAgencyDto,
  ) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }


    const agency = await this.registerAgencyFromUser.execute(
      dto,
      req.userId,
      req.language,
    );

    return {
      message: t('agencyCreatedSuccessfully', req.language),
      agency,
    };
  }
}