


import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";

import { Roles } from "../../../common/decorators/roles.decorator";
import type { RequestWithUser } from "../../../common/types/request-with-user.interface";
import {  t } from "../../../locales";
import { UpdateRequestStatusDto } from "../dto/agency-request.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../../common/helpers/validation.helper";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { GetAgencyRequestsUseCase } from "../application/use-cases/get-agency-requests.use-case";
import { UpdateAgencyRequestStatusUseCase } from "../application/use-cases/update-agency-request-status.use-case";
import { ApiAgencyRequestsDecorators } from "../decorators/agency-requests.decorator";
import { RequireAgencyContext } from "../../../common/decorators/require-agency-context.decorator";
import { PermissionsGuard } from "../../../infrastructure/auth/guard/permissions.guard";
import { AgencyContextGuard } from "../../../infrastructure/auth/guard/agency-context.guard";
import { RolesGuard } from "../../../infrastructure/auth/guard/role-guard";

@UseGuards(AgencyContextGuard, RolesGuard, PermissionsGuard)
@Controller('agencies')

export class AgencyRequestsController {
    constructor(private readonly getAgencyRequests: GetAgencyRequestsUseCase , private readonly updateAgencyRequestStatus:UpdateAgencyRequestStatusUseCase) {}


    
@RequireAgencyContext()
@Get('registration-requests')
@Roles('agent', 'agency_owner')
@Permissions('can_approve_requests')
@ApiAgencyRequestsDecorators.GetRegistrationRequests()
async getRegistrationRequests(
  @Req() req: RequestWithUser,
  @Query('page') page = 1,
  @Query('status') status?: string,
  @Query('search') search?: string,
) {
  return this.getAgencyRequests.execute(
    req.agencyId!,
    Number(page),
    status as any,
    search,
  );
}



@RequireAgencyContext()  
@Patch('registration-requests/:id/status')
@Roles('agent', 'agency_owner')
@Permissions("can_approve_requests")
@ApiAgencyRequestsDecorators.UpdateRequestStatus()
async updateRegistrationRequestStatus(
  @Req() req: RequestWithUser,
  @Param('id', ParseIntPipe) requestId: number,
  @Body() body: Record<string, any>,
) {
  try {
    const language = req.language || 'al';
    const userId = req.userId;
    

    
    const dto = plainToInstance(UpdateRequestStatusDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);
    
    if (body.action === 'approved' && !body.roleInAgency) {
      throw new BadRequestException(t('roleInAgencyRequired', language));
    }

    const result = await this.updateAgencyRequestStatus.execute(
      requestId,
      req.agencyId!,
      userId,
      dto,
      language
    );
    
   
    return result;
  } catch (error) {
   
    throw error;
  }
}
}