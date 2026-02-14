import { Test } from '@nestjs/testing';

import { user_role } from '@prisma/client';
import { AgencyContextOrchestrator } from '../agency-context-orchestrator.service';
import { AgentContextService } from '../agent-context.service';
import { AgencyOwnerContextService } from '../agency-owner-context.service';

describe('AgencyContextOrchestrator', () => {
  let orchestrator: AgencyContextOrchestrator;
  let agentService: any;
  let agencyService: any;

  beforeEach(async () => {
    agentService = {
      loadAgentContext: jest.fn(),
      validateAgentStatus: jest.fn(),
      validateAgencyStatusForAgent: jest.fn(),
    };
    agencyService = {
      loadAgencyOwnerContext: jest.fn(),
      validateAgencyStatus: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AgencyContextOrchestrator,
        { provide: AgentContextService, useValue: agentService },
        { provide: AgencyOwnerContextService, useValue: agencyService },
      ],
    }).compile();

    orchestrator = moduleRef.get(AgencyContextOrchestrator);
  });

  describe('loadContext', () => {
    it('calls agent service for agent user', async () => {
      const req: any = { user: { role: user_role.agent, id: 1 } };
      await orchestrator.loadContext(req, 'en');
      expect(agentService.loadAgentContext).toHaveBeenCalledWith(req, 'en');
      expect(agencyService.loadAgencyOwnerContext).not.toHaveBeenCalled();
    });

    it('calls agency service for agency_owner user', async () => {
      const req: any = { user: { role: user_role.agency_owner, id: 1 } };
      await orchestrator.loadContext(req, 'en');
      expect(agencyService.loadAgencyOwnerContext).toHaveBeenCalledWith(req, 'en');
      expect(agentService.loadAgentContext).not.toHaveBeenCalled();
    });

    it('does nothing if no user', async () => {
      const req: any = {};
      await orchestrator.loadContext(req, 'en');
      expect(agentService.loadAgentContext).not.toHaveBeenCalled();
      expect(agencyService.loadAgencyOwnerContext).not.toHaveBeenCalled();
    });
  });

  describe('validateStatus', () => {
    it('calls agent validation for agent user', () => {
      const req: any = { user: { role: user_role.agent } };
      orchestrator.validateStatus(req, 'en');
      expect(agentService.validateAgentStatus).toHaveBeenCalledWith(req, 'en');
      expect(agentService.validateAgencyStatusForAgent).toHaveBeenCalledWith(req, 'en');
      expect(agencyService.validateAgencyStatus).not.toHaveBeenCalled();
    });

    it('calls agency validation for agency_owner user', () => {
      const req: any = { user: { role: user_role.agency_owner } };
      orchestrator.validateStatus(req, 'en');
      expect(agencyService.validateAgencyStatus).toHaveBeenCalledWith(req, 'en');
      expect(agentService.validateAgentStatus).not.toHaveBeenCalled();
      expect(agentService.validateAgencyStatusForAgent).not.toHaveBeenCalled();
    });

    it('does nothing if no user', () => {
      const req: any = {};
      orchestrator.validateStatus(req, 'en');
      expect(agentService.validateAgentStatus).not.toHaveBeenCalled();
      expect(agentService.validateAgencyStatusForAgent).not.toHaveBeenCalled();
      expect(agencyService.validateAgencyStatus).not.toHaveBeenCalled();
    });
  });
});