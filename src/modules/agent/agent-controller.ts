import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { type RequestWithLang } from "../../middlewares/language.middleware";
import { UserStatusGuard } from "../../common/guard/status.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { type RequestWithUser } from "../../common/types/request-with-user.interface";

@Controller("agents")
export class AgentController{
    constructor(private readonly agentService:AgentService){}
    @Get("public/:agencyId")
  async getPublicAgents(
    
    @Param("agencyId") agencyId: number,
     @Req() req:RequestWithLang,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
 
  ) {
    const language = req.language;

 
    const pageNumber = parseInt(page ?? "1", 10);
    const limitNumber = parseInt(limit ?? "10", 10);

    return this.agentService.getAgentsForPublicView(
      agencyId,
      pageNumber,
      limitNumber,
      language
    );
  }

@UseGuards(UserStatusGuard)
 @Roles('agency_owner', 'agent')
    @Get("dashboard")
  
  async getPrivateAgents(
    
 
     @Req() req:RequestWithUser,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
 
  ) {
    const language = req.language;
  const agencyId=req.agencyId;
if(!agencyId){
    return null;
}
 
    const pageNumber = parseInt(page ?? "1", 10);
    const limitNumber = parseInt(limit ?? "10", 10);

    return this.agentService.getAgentsForProtectedRoute(
      agencyId,
      pageNumber,
      limitNumber,
      language
    );
  }
}