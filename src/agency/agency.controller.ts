import { Controller, Get, Query, Req, UnauthorizedException } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { AgencyService } from './agency.service';
import type { RequestWithLang } from '../middlewares/language.middleware';
import { SupportedLang, t } from '../locales';
import type { RequestWithUser } from '../common/types/request-with-user.interface';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyservice: AgencyService) {}
  @Public()
  @Get()

async getAllAgencies(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  return this.agencyservice.getPaginatedAgencies(Number(page), Number(limit));
}

@Roles('agency_owner')
@Get('info')
async getAgencyInfo(@Req() req: RequestWithUser) {
  if (!req.userId) {
   throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }
  if(!req.agencyId){
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  
  const language: SupportedLang = req.language || 'al';
 const agencyId = req.agencyId;
  return this.agencyservice.getAgencyInfoByOwner( agencyId,language);
}
// @Roles('agency_owner')
// @Get('registration-requests')
// async getregistrationRequests(
//   @Req() req: RequestWithUser,
//   @Query('limit') limit = 10,
//   @Query('offset') offset = 0
// ) {
//   if (!req.agencyId) {
//     throw new UnauthorizedException(t('userNotAuthenticated', req.language));
//   }

//   const language: SupportedLang = req.language || 'al';

//   return this.agencyservice.getUnderReviewRequestsForAgencyOwner(
//     req.agencyId,
//     Number(limit),
//     Number(offset)
//   );
// }
}