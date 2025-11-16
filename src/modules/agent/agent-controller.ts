import { Body, Controller, ForbiddenException, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { type RequestWithLang } from "../../middlewares/language.middleware";
import { UserStatusGuard } from "../../common/guard/status.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { type RequestWithUser } from "../../common/types/request-with-user.interface";
import { agencyagent_status } from "@prisma/client";
import { FilterAgentsDto } from "./dto/filter-agents.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { plainToInstance } from "class-transformer";
import { UpdateAgentsDto } from "./dto/update-agents.dto";
import { t } from "../../locales";
import {  ManageAgentsService } from "./manage-agents.service";
import { AgentBelongsToAgencyGuard } from "../../common/guard/AgentBelongsToAgency.guard";

@Controller("agents")
export class AgentController{
    constructor(private readonly agentService:AgentService, private readonly manageAgentService:ManageAgentsService ){}


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

@Patch('update/:id')
@Permissions(['can_manage_agents'])
@UseGuards(UserStatusGuard ,AgentBelongsToAgencyGuard)
async updateAgencyAgents(@Param('id') id:number ,@Req() req:RequestWithUser , @Body() data: Record<string, any>,  ){
   const agencyId = req.agencyId;
   const user=req.user;
 const language=req.language;
 if(!user){
  return null;
 }
 if (!agencyId) {
  throw new ForbiddenException(t("agencyNotFound" , language));
}
  const dto = plainToInstance(UpdateAgentsDto, data)
 return this.manageAgentService.updateAgencyAgents(id, agencyId, dto, language , user)
}
}