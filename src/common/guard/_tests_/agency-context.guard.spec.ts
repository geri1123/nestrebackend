import { ForbiddenException } from '@nestjs/common';
import { AgencyContextGuard } from '../agency-context.guard';
import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { GetAgencyByIdUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-id.use-case';
import { user_role, user_status, agencyagent_status, agency_status } from '@prisma/client';
import { ModuleRef, Reflector } from '@nestjs/core';
import { REQUIRE_AGENCY_CONTEXT } from '../../decorators/require-agency-context.decorator';

describe('AgencyContextGuard', () => {
  let guard: AgencyContextGuard;
  let getAgentAuthContextMock: any;
  let getAgencyByOwnerMock: any;
  let getAgencyByIdMock: any;
  let moduleRefMock: any;
  let reflectorMock: any;

  const mockContext = (req: any, requireAgencyContext = true) => {
    reflectorMock.getAllAndOverride.mockReturnValue(requireAgencyContext);
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(() => {
    getAgentAuthContextMock = {
      execute: jest.fn(),
    };

    getAgencyByOwnerMock = {
      execute: jest.fn(),
    };

    getAgencyByIdMock = {
      execute: jest.fn(),
    };

    moduleRefMock = {
      get: jest.fn((useCase) => {
        if (useCase === GetAgentAuthContextUseCase) return getAgentAuthContextMock;
        if (useCase === GetAgencyByOwnerUseCase) return getAgencyByOwnerMock;
        if (useCase === GetAgencyByIdUseCase) return getAgencyByIdMock;
      }),
    };

    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    guard = new AgencyContextGuard(
      moduleRefMock as unknown as ModuleRef,
      reflectorMock as unknown as Reflector,
    );

    jest.clearAllMocks();
  });

  describe('Suspended User Checks', () => {
    it('throws ForbiddenException if user is suspended', async () => {
      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.suspended },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Already Loaded Agency Context', () => {
    it('returns true if agencyId already loaded and status is active', async () => {
      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        agencyId: 100,
        agentStatus: agencyagent_status.active,
        agencyStatus: agency_status.active,
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
    });

    it('throws if agent status is not active when already loaded', async () => {
      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        agencyId: 100,
        agentStatus: agencyagent_status.inactive,
        agencyStatus: agency_status.active,
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws if agency is suspended when already loaded (agent)', async () => {
      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        agencyId: 100,
        agentStatus: agencyagent_status.active,
        agencyStatus: agency_status.suspended,
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws if agency is suspended when already loaded (agency_owner)', async () => {
      const req = {
        user: { id: 1, role: user_role.agency_owner, status: user_status.active },
        agencyId: 100,
        agencyStatus: agency_status.suspended,
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Regular User Role', () => {
    it('returns true for regular user without loading agency context', async () => {
      const req = {
        user: { id: 1, role: user_role.user, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
      expect(getAgentAuthContextMock.execute).not.toHaveBeenCalled();
      expect(getAgencyByOwnerMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('Route Does Not Require Agency Context', () => {
    it('returns true without loading context if decorator is not present', async () => {
      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req, false))).resolves.toBe(true);
      expect(getAgentAuthContextMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('Agent Role', () => {
    it('loads agency context for agent and sets request properties', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue({
        agencyId: 100,
        agencyAgentId: 50,
        permissions: 'can_view_all_posts,can_edit_others_post',
        status: agencyagent_status.active,
      });

      getAgencyByIdMock.execute.mockResolvedValue({
        id: 100,
        status: agency_status.active,
      });

      const req: any = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);

      expect(req.agencyId).toBe(100);
      expect(req.agencyAgentId).toBe(50);
      expect(req.agentPermissions).toBeDefined();
      expect(req.agentStatus).toBe(agencyagent_status.active);
      expect(req.agencyStatus).toBe(agency_status.active);
    });

    it('throws if agent has no agency association', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue(null);

      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws if agent status is inactive after loading', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue({
        agencyId: 100,
        agencyAgentId: 50,
        permissions: '',
        status: agencyagent_status.inactive,
      });

      getAgencyByIdMock.execute.mockResolvedValue({
        id: 100,
        status: agency_status.active,
      });

      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws if agency is suspended after loading for agent', async () => {
      getAgentAuthContextMock.execute.mockResolvedValue({
        agencyId: 100,
        agencyAgentId: 50,
        permissions: '',
        status: agencyagent_status.active,
      });

      getAgencyByIdMock.execute.mockResolvedValue({
        id: 100,
        status: agency_status.suspended,
      });

      const req = {
        user: { id: 1, role: user_role.agent, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Agency Owner Role', () => {
    it('loads agency context for agency_owner and sets request properties', async () => {
      getAgencyByOwnerMock.execute.mockResolvedValue({
        id: 200,
        status: agency_status.active,
      });

      const req: any = {
        user: { id: 1, role: user_role.agency_owner, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);

      expect(req.agencyId).toBe(200);
      expect(req.agencyStatus).toBe(agency_status.active);
    });

    it('throws if agency is suspended for agency_owner', async () => {
      getAgencyByOwnerMock.execute.mockResolvedValue({
        id: 200,
        status: agency_status.suspended,
      });

      const req = {
        user: { id: 1, role: user_role.agency_owner, status: user_status.active },
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('No User Present', () => {
    it('returns true if no user is present', async () => {
      const req = {
        language: 'al',
      };

      await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
      expect(getAgentAuthContextMock.execute).not.toHaveBeenCalled();
      expect(getAgencyByOwnerMock.execute).not.toHaveBeenCalled();
    });
  });
});