import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type RequestWithLang } from '../../../middlewares/language.middleware';
import { type RequestWithUser } from '../../../common/types/request-with-user.interface';
// import { StatusGuard } from '../../../common/guard/status.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { FilterAgentsDto } from '../dto/filter-agents.dto';
import { UpdateAgentsDto } from '../dto/update-agents.dto';
import { plainToInstance } from 'class-transformer';
import { t } from '../../../locales';
import { GetAgentsUseCase } from '../application/use-cases/get-agents.use-case';
import { UpdateAgentUseCase } from '../application/use-cases/update-agent.use-case';
import { AgencyAgentStatus } from '@prisma/client';
import { GetAgentMeUseCase } from '../application/use-cases/get-agent-me.use-case';
import { GetAgentByIdInAgencyUseCase } from '../application/use-cases/get-agent-in-agency.use-case';
import { ApiAgentDecorators } from '../decorators/agent.decorator';
import { RolesGuard } from '../../../infrastructure/auth/guard/role-guard';
import { AgencyContextGuard } from '../../../infrastructure/auth/guard/agency-context.guard';
import { PermissionsGuard } from '../../../infrastructure/auth/guard/permissions.guard';
import { AgentBelongsToAgencyGuard } from '../../../infrastructure/auth/guard/agent-belongs-to-agency.guard';
import { RequireAgencyContext } from '../../../common/decorators/require-agency-context.decorator';
import { Public } from '../../../common/decorators/public.decorator';



@Controller('agents')
export class AgentController {
  constructor(
    private readonly getAgentsUseCase: GetAgentsUseCase,
    private readonly updateAgentUseCase: UpdateAgentUseCase,
    private readonly getAgentMeUseCase:GetAgentMeUseCase,
    private readonly GetAgentByIdInAgency:GetAgentByIdInAgencyUseCase
  ) {}
@Public()
  @Get('public/:agencyId')
  @ApiAgentDecorators.GetPublicAgents()
async getPublicAgents(
  @Param('agencyId', ParseIntPipe) agencyId: number,
  @Req() req: RequestWithLang,
  @Query() filters: FilterAgentsDto,
  @Query('page') page = '1',
) {
  return this.getAgentsUseCase.execute(
    agencyId,
    parseInt(page, 10),
    12,
    req.language,
    filters,
    false,
    AgencyAgentStatus.active,
  );
} 

@RequireAgencyContext()
@Roles('agency_owner', 'agent')
  @UseGuards(AgencyContextGuard, RolesGuard)
 
  @ApiAgentDecorators.GetPrivateAgents()
  @Get('dashboard')
  async getPrivateAgents(
    @Req() req: RequestWithUser,
    @Query() filters: FilterAgentsDto,
    @Query('page') page = '1',
  ) {
    const language = req.language;
    const agencyId = req.agencyId;
    if (!agencyId) return null;

    return this.getAgentsUseCase.execute(
      agencyId,
      parseInt(page, 10),
      12,
      language,
      filters,
      true,
    );
  }

  @RequireAgencyContext()
  @Patch('update/:id')
 
  @UseGuards(AgencyContextGuard, PermissionsGuard, AgentBelongsToAgencyGuard)
@Permissions('can_manage_agents')
  
@ApiAgentDecorators.UpdateAgent()
async updateAgencyAgents(
  @Param('id') idParam: string,
  @Req() req: RequestWithUser,
  @Body() data: Record<string, any>,
) {
  try {
    const id = Number(idParam);
    const agencyId = req.agencyId;
    const user = req.user;
    const language = req.language;


    if (!user) {
      throw new ForbiddenException(t('userNotFound', language));
    }

    if (!agencyId) {
      throw new ForbiddenException(t('agencyNotFound', language));
    }

    const dto = plainToInstance(UpdateAgentsDto, data);
    
    console.log('Transformed DTO:', dto);

    const result = await this.updateAgentUseCase.execute(
      id, 
      agencyId, 
      dto, 
      language, 
      user
    );
    
    console.log('Update Result:', result);
    
    return result;
  } catch (error) {
    
    throw error;
  }
}

@ApiAgentDecorators.GetAgentMe()
@RequireAgencyContext()
@Roles('agent', 'agency_owner')
 @UseGuards(AgencyContextGuard, RolesGuard)

@Get('me')
async getAgentMe(@Req() req: RequestWithUser) {
  if (!req.userId) {
    throw new ForbiddenException(t('userNotAuthenticated', req.language));
  }

  return this.getAgentMeUseCase.execute(req.userId, req.language);
}



@RequireAgencyContext()
@Roles('agent', 'agency_owner')
 @UseGuards(AgencyContextGuard, RolesGuard)
@Get(':id')
@ApiAgentDecorators.GetAgentById()
async getAgentById(
  @Param('id', ParseIntPipe) agencyAgentId: number,
  @Req() req: RequestWithUser,
) {
  if (!req.agencyId) {
    throw new ForbiddenException(t('agencyNotFound', req.language));
  }

  return this.GetAgentByIdInAgency.execute(
    agencyAgentId,
    req.agencyId,
    req.language,
  );
}
}