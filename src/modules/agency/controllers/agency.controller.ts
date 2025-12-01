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

  // ---------------------------------------------------------
  // PUBLIC: GET PAGINATED AGENCIES
  // ---------------------------------------------------------
  @Public()
  @Get()
  async getAllAgencies(@Query('page') page = 1) {
    return this.getPaginatedAgencies.execute(Number(page), 12);
  }

  // ---------------------------------------------------------
  // PRIVATE AGENCY INFO
  // ---------------------------------------------------------
  @Roles('agency_owner', 'agent')
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

  // ---------------------------------------------------------
  // PUBLIC AGENCY DETAIL
  // ---------------------------------------------------------
  @Public()
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

  // ---------------------------------------------------------
  // UPDATE FIELDS
  // ---------------------------------------------------------
  @Roles('agency_owner')
  @Patch('update-fields')
  async updateFields(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, any>,
  ) {
    if (!req.agencyId) {
      throw new ForbiddenException(t('noAgency', req.language));
    }

    const dto = plainToInstance(UpdateAgencyDto, body);

    return this.updateAgencyFields.execute(
      req.agencyId,
      dto,
      req.language,
    );
  }

  // -----------
  // UPLOAD LOGO
  // -----------s
  @Roles('agency_owner')
  @Patch('upload-logo')
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

  // ---------------------------------------------------------
  // DELETE LOGO
  // ---------------------------------------------------------
  @Roles('agency_owner')
  @Delete('logo')
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

  // ---------------------------------------------------------
  // CREATE AGENCY
  // ---------------------------------------------------------
  @Roles('user')
  @Post('create-agency')
  async createAgency(
    @Req() req: RequestWithUser,
    @Body() data: Record<string, any>,
  ) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    const dto = plainToInstance(CreateAgencyDto, data);

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