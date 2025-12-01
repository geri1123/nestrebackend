import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type RequestWithLang } from '../../../middlewares/language.middleware';
import { type RequestWithUser } from '../../../common/types/request-with-user.interface';
import { UserStatusGuard } from '../../../common/guard/status.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { FilterAgentsDto } from '../dto/filter-agents.dto';
import { UpdateAgentsDto } from '../dto/update-agents.dto';
import { plainToInstance } from 'class-transformer';
import { t } from '../../../locales';
import { GetAgentsUseCase } from '../application/use-cases/get-agents.use-case';
import { UpdateAgentUseCase } from '../application/use-cases/update-agent.use-case';
import { AgentBelongsToAgencyGuard } from '../../../common/guard/AgentBelongsToAgency.guard';
import { agencyagent_status } from '@prisma/client';

@Controller('agents')
export class AgentController {
  constructor(
    private readonly getAgentsUseCase: GetAgentsUseCase,
    private readonly updateAgentUseCase: UpdateAgentUseCase,
  ) {}

  @Get('public/:agencyId')
  async getPublicAgents(
    @Param('agencyId') agencyIdParam: string,
    @Req() req: RequestWithLang,
    @Query() filters: FilterAgentsDto,
    @Query('page') page = '1',
  ) {
    const language = req.language;
    const agencyId = Number(agencyIdParam);

    return this.getAgentsUseCase.execute(
      agencyId,
      parseInt(page, 10),
      12,
      language,
      filters,
      false,
      'active' as agencyagent_status,
    );
  }

  @UseGuards(UserStatusGuard)
  @Roles('agency_owner', 'agent')
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

  @Patch('update/:id')
  @Permissions(['can_manage_agents'])
  @UseGuards(UserStatusGuard, AgentBelongsToAgencyGuard)
  async updateAgencyAgents(
    @Param('id') idParam: string,
    @Req() req: RequestWithUser,
    @Body() data: Record<string, any>,
  ) {
    const id = Number(idParam);
    const agencyId = req.agencyId;
    const user = req.user;
    const language = req.language;

    if (!user) {
      return null;
    }

    if (!agencyId) {
      throw new ForbiddenException(t('agencyNotFound', language));
    }

    const dto = plainToInstance(UpdateAgentsDto, data);

    return this.updateAgentUseCase.execute(id, agencyId, dto, language, user);
  }
}