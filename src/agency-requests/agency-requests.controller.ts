import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UnauthorizedException } from "@nestjs/common";
import { AgencyRequestsService } from "./agency-requests.service";
import { Roles } from "../common/decorators/roles.decorator";
import type { RequestWithUser } from "../common/types/request-with-user.interface";
import { SupportedLang, t } from "../locales";
import { UpdateRequestStatusDto } from "./dto/agency-request.dto";
import { CustomValidationPipe } from "../common/helpers/custom-validation.pipe";
import { plainToInstance } from "class-transformer";



@Controller('agencies')

export class AgencyRequestsController {
    constructor(private readonly agencyRequestsService: AgencyRequestsService) {}

 @Roles('agency_owner')
  @Get('registration-requests')
    @Roles('agency_owner')
  @Get('registration-requests')
  async getRegistrationRequests(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,        
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    if (!req.agencyId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

  

    return this.agencyRequestsService.getRequestsForAgencyOwner(
      req.agencyId,
      Number(page),           
      Number(limit),
      status as any,           
    );
  }
  
//   @Roles('agency_owner')
// @Patch('registration-requests/:id/status')
// async updateRegistrationRequestStatus(
//   @Req() req: RequestWithUser,
//   @Param('id', ParseIntPipe) requestId: number,
//   @Body() dto: UpdateRequestStatusDto,
// ) {
 
//   console.log('Received DTO:', dto);
//   console.log('Action value:', dto.action);
//   console.log('Action type:', typeof dto.action);
//   console.log('Action length:', dto.action?.length);
//   console.log('Action charCodes:', dto.action?.split('').map(c => c.charCodeAt(0)));

//   const language = req.language || 'al';
//   const userid = req.userId;

//   if (!req.agencyId) {
//     throw new UnauthorizedException(t('userNotAuthenticated', language));
//   }
//   if (!userid) {
//     throw new UnauthorizedException(t('userNotAuthenticated', language));
//   }

//   if (dto.action === 'approved' && !dto.roleInAgency) {
//     throw new BadRequestException(t('roleInAgencyRequired', language));
//   }

//   return this.agencyRequestsService.updateRequestStatus(
//     requestId,
//     req.agencyId,
//     userid,
//     dto.action,
//     dto.roleInAgency!,
//     dto.commissionRate,
//     dto.reviewNotes,
//     language
//   );
// }
@Roles('agency_owner')
@Patch('registration-requests/:id/status')
async updateRegistrationRequestStatus(
  @Req() req: RequestWithUser,
  @Param('id', ParseIntPipe) requestId: number,
  @Body() dto: UpdateRequestStatusDto,
) {
  const language = req.language || 'al';
  const userId = req.userId;

  if (!req.agencyId) {
    throw new UnauthorizedException(t('userNotAuthenticated', language));
  }
  if (!userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', language));
  }

  if (dto.action === 'approved' && !dto.roleInAgency) {
    throw new BadRequestException(t('roleInAgencyRequired', language));
  }

  try {
    // ✅ Call the service
    return await this.agencyRequestsService.updateRequestStatus(
      requestId,
      req.agencyId,
      userId,
      dto.action,
      dto.roleInAgency!,
      dto.commissionRate,
      dto.reviewNotes,
      language
    );
  } catch (err) {
    console.error(err);

    throw new BadRequestException({
      success: false,
      message: err?.message || t('somethingWentWrong', language),
      errors: err?.response?.errors || { general: [err?.message || 'Unknown error'] },
    });
  }
}
}