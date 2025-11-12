import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { type RequestWithLang } from "../../middlewares/language.middleware";
import { UserStatusGuard } from "../../common/guard/status.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { type RequestWithUser } from "../../common/types/request-with-user.interface";
import { agencyagent_status } from "@prisma/client";
import { FilterAgentsDto } from "./dto/filter-agents.dto";

@Controller("agents")
export class AgentController{
    constructor(private readonly agentService:AgentService){}


    @Get('public/:agencyId')
async getPublicAgents(
  @Param('agencyId') agencyId: number,
  @Req() req: RequestWithLang,
  @Query() filters: FilterAgentsDto,
  @Query('page') page = '1',
) {
  const language = req.language;
  return this.agentService.getAgents(
    agencyId,
    parseInt(page, 10),
    12,
    language,
    filters,
    false,          
    'active'         
  );
}


@UseGuards(UserStatusGuard)
@Roles('agency_owner', 'agent')
@Get("dashboard")
async getPrivateAgents(
  @Req() req: RequestWithUser,
  @Query() filters: FilterAgentsDto,
  @Query('page') page = '1',
) {
  const language = req.language;
  const agencyId = req.agencyId;
  if (!agencyId) return null;

  return this.agentService.getAgents(
    agencyId,
    parseInt(page, 10),
    12,
    language,
    filters,
    true, 
  );
}

// @Get('public/:agencyId')
 
//   async getPublicAgents(
//     @Param('agencyId') agencyId: number,
//     @Req() req: RequestWithLang,
//     @Query() filters: FilterAgentsDto,
//     @Query('page') page = '1',
//   ) {
//     const language = req.language;
//     const pageNumber = parseInt(page, 10);
//     const limitNumber = 12;

//     return this.agentService.getAgentsForPublicView(
//       agencyId,
//       pageNumber,
//       limitNumber,
//       language,
//       filters,
//     );
//   }

// @UseGuards(UserStatusGuard)
// @Roles('agency_owner', 'agent')
// @Get("dashboard")
// async getPrivateAgents(
  
  
//   @Req() req: RequestWithUser,
//     @Query() filters: FilterAgentsDto,
//     @Query('page') page = '1',
// ) {
//   const language = req.language;
//   const agencyId = req.agencyId;
//   if (!agencyId) return null;

  
//     const pageNumber = parseInt(page, 10);
//     const limitNumber = 12;
//   return this.agentService.getAgentsForProtectedRoute(
//     agencyId,
//       pageNumber,
//       limitNumber,
//       language,
//       filters,
//   );
// }
}