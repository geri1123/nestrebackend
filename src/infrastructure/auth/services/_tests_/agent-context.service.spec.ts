import { Test } from '@nestjs/testing';
import { AgentContextService } from '../agent-context.service';
import { GetAgentAuthContextUseCase } from '../../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { GetAgencyByIdUseCase } from '../../../../modules/agency/application/use-cases/get-agency-by-id.use-case';
import { ForbiddenException } from '@nestjs/common';
import { AgencyAgentStatus, AgencyStatus } from '@prisma/client';

describe('AgentContextService', () => {
  let service: AgentContextService;
  let getAgentAuthContextMock: any;
  let getAgencyByIdMock: any;

  const mockAgentContext = {
    agencyAgentId: 10,
    agencyId: 1,
    roleInAgency: 'agent',
    status: AgencyAgentStatus.active,
    commissionRate: 15,
    startDate: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
    permissions: {
      canEditOwnPost: true,
      canEditOthersPost: false,
      canApproveRequests: false,
      canViewAllPosts: true,
      canDeletePosts: false,
      canManageAgents: false,
    },
  };

  const mockAgency = {
    id: 1,
    agencyName: 'Prime Agency',
    agencyEmail: 'prime@example.com',
    logo: null,
    website: null,
    status: AgencyStatus.active,
  };

  beforeEach(async () => {
    getAgentAuthContextMock = { execute: jest.fn() };
    getAgencyByIdMock = { execute: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AgentContextService,
        { provide: GetAgentAuthContextUseCase, useValue: getAgentAuthContextMock },
        { provide: GetAgencyByIdUseCase, useValue: getAgencyByIdMock },
      ],
    }).compile();

    service = moduleRef.get(AgentContextService);
  });

  describe('getAgentProfileData', () => {
    it('returns agent profile with mapped permissions', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue(mockAgentContext);
      getAgencyByIdMock.execute.mockResolvedValue(mockAgency);

      const result = await service.getAgentProfileData(1, 'en');

      expect(result.agencyAgentId).toBe(mockAgentContext.agencyAgentId);
      expect(result.permissions.can_edit_own_post).toBe(true);
      expect(result.agency.name).toBe('Prime Agency');
    });

    it('throws ForbiddenException if agent not found', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue(null);

      await expect(service.getAgentProfileData(1, 'en')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('loadAgentContext', () => {
    it('sets request properties correctly', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue(mockAgentContext);
      getAgencyByIdMock.execute.mockResolvedValue(mockAgency);

      const req: any = { user: { id: 1 } };
      await service.loadAgentContext(req, 'en');

      expect(req.agencyId).toBe(1);
      expect(req.agencyStatus).toBe(AgencyStatus.active);
      expect(req.agencyAgentId).toBe(mockAgentContext.agencyAgentId);
      expect(req.agentPermissions.can_edit_own_post).toBe(true);
      expect(req.agentStatus).toBe(mockAgentContext.status);
      expect(req.isAgencyOwner).toBe(false);
    });

    it('throws ForbiddenException if agent not found', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue(null);
      const req: any = { user: { id: 1 } };
      await expect(service.loadAgentContext(req, 'en')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('validateAgentStatus', () => {
    it('does not throw for active status', () => {
      const req: any = { agentStatus: AgencyAgentStatus.active };
      expect(() => service.validateAgentStatus(req, 'en')).not.toThrow();
    });

    it('throws ForbiddenException for inactive status', () => {
      const req: any = { agentStatus: AgencyAgentStatus.inactive };
      expect(() => service.validateAgentStatus(req, 'en')).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for terminated status', () => {
      const req: any = { agentStatus: AgencyAgentStatus.terminated };
      expect(() => service.validateAgentStatus(req, 'en')).toThrow(ForbiddenException);
    });
  });

  describe('validateAgencyStatusForAgent', () => {
    it('does not throw for active status', () => {
      const req: any = { agencyStatus: AgencyStatus.active };
      expect(() => service.validateAgencyStatusForAgent(req, 'en')).not.toThrow();
    });

    it('throws ForbiddenException for suspended status', () => {
      const req: any = { agencyStatus: AgencyStatus.suspended };
      expect(() => service.validateAgencyStatusForAgent(req, 'en')).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for inactive status', () => {
      const req: any = { agencyStatus: AgencyStatus.inactive };
      expect(() => service.validateAgencyStatusForAgent(req, 'en')).toThrow(ForbiddenException);
    });
  });
});
