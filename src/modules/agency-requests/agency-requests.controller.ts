// import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
// import { AgencyRequestsService } from "./agency-requests.service";
// import { Roles } from "../../common/decorators/roles.decorator";
// import type { RequestWithUser } from "../../common/types/request-with-user.interface";
// import { SupportedLang, t } from "../../locales";
// import { UpdateRequestStatusDto } from "./dto/agency-request.dto";
// import { plainToInstance } from "class-transformer";
// import { validate } from "class-validator";
// import { throwValidationErrors } from "../../common/helpers/validation.helper";
// import { PermissionsGuard } from "../../common/guard/permision.guard";
// import { Permissions } from "../../common/decorators/permissions.decorator";
// import { UserStatusGuard } from "../../common/guard/status.guard";



// @UseGuards(PermissionsGuard)
// @Controller('agencies')

// export class AgencyRequestsController {
//     constructor(private readonly agencyRequestsService: AgencyRequestsService) {}


    
//   @Get('registration-requests')
//   @UseGuards(UserStatusGuard)
//   @Roles('agent', 'agency_owner')
//   @Permissions(['can_approve_requests']) 
//   async getRegistrationRequests(
//     @Req() req: RequestWithUser,
//     @Query('page') page = 1,        
//     @Query('limit') limit = 10,
//     @Query('status') status?: string,
//   ) {
//     if (!req.agencyId) {
//       throw new UnauthorizedException(t('userNotAuthenticated', req.language));
//     }

  

//     return this.agencyRequestsService.getRequestsForAgencyOwner(
//       req.agencyId,
//       Number(page),           
//       Number(limit),
//       status as any,           
//     );
//   }
  


// @Patch('registration-requests/:id/status')
// @UseGuards(UserStatusGuard)
// @Roles('agent', 'agency_owner')
//  @Permissions(['can_approve_requests']) 
// async updateRegistrationRequestStatus(
//   @Req() req: RequestWithUser,
//   @Param('id', ParseIntPipe) requestId: number,
//   @Body() body: Record<string, any>,
// ) {
//   const language = req.language || 'al';
//   const userId = req.userId;
  
//   const dto = plainToInstance(UpdateRequestStatusDto, body);
//   const errors = await validate(dto);
//   if (errors.length > 0) throwValidationErrors(errors, language);
//   if (body.action === 'approved' && !body.roleInAgency) {
//     throw new BadRequestException(t('roleInAgencyRequired', language));
//   }

  
//   return await this.agencyRequestsService.updateRequestStatus(
//     requestId,
//   req.agencyId!,
//     userId,
//     dto.action,
//     dto.roleInAgency!,
//     dto.commissionRate,
//     dto.reviewNotes,
//      dto.permissions ,
//     language
//   );
// }
// }


import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AgencyRequestsService } from "./agency-requests.service";
import { Roles } from "../../common/decorators/roles.decorator";
import type { RequestWithUser } from "../../common/types/request-with-user.interface";
import { SupportedLang, t } from "../../locales";
import { UpdateRequestStatusDto } from "./dto/agency-request.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { PermissionsGuard } from "../../common/guard/permision.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { UserStatusGuard } from "../../common/guard/status.guard";



@UseGuards(PermissionsGuard)
@Controller('agencies')

export class AgencyRequestsController {
    constructor(private readonly agencyRequestsService: AgencyRequestsService) {}


    
  @Get('registration-requests')
  @UseGuards(UserStatusGuard)
  @Roles('agent', 'agency_owner')
  @Permissions(['can_approve_requests']) 
  async getRegistrationRequests(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,        

    @Query('status') status?: string,
  ) {
    if (!req.agencyId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

  

    return this.agencyRequestsService.getRequestsForAgencyOwner(
      req.agencyId,
      Number(page),           
      
      status as any,           
    );
  }
  


@Patch('registration-requests/:id/status')
@UseGuards(UserStatusGuard)
@Roles('agent', 'agency_owner')
 @Permissions(['can_approve_requests']) 
async updateRegistrationRequestStatus(
  @Req() req: RequestWithUser,
  @Param('id', ParseIntPipe) requestId: number,
  @Body() body: Record<string, any>,
) {
  const language = req.language || 'al';
  const userId = req.userId;
  
  const dto = plainToInstance(UpdateRequestStatusDto, body);
  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);
  if (body.action === 'approved' && !body.roleInAgency) {
    throw new BadRequestException(t('roleInAgencyRequired', language));
  }

  
  return await this.agencyRequestsService.updateRequestStatus(
    requestId,
  req.agencyId!,
    userId,
    dto,
    language
  );
}


}