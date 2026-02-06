import { ForbiddenException } from '@nestjs/common';
import { AgencyContextGuard } from '../agency-context.guard';
import { AgencyContextService } from '../../services/agency-context.service';
import { Reflector } from '@nestjs/core';
import { user_role, user_status } from '@prisma/client';
import { REQUIRE_AGENCY_CONTEXT } from '../../../../common/decorators/require-agency-context.decorator';

describe('AgencyContextGuard', () => {
  let guard: AgencyContextGuard;
  let agencyContextService: jest.Mocked<AgencyContextService>;
  let reflector: jest.Mocked<Reflector>;

  const mockContext = (req: any, requireAgencyContext = true) => {
    reflector.getAllAndOverride.mockReturnValue(requireAgencyContext);

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(() => {
    agencyContextService = {
      loadAgencyContext: jest.fn(),
      checkAgencyAndAgentStatus: jest.fn(),
    } as any;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new AgencyContextGuard(reflector, agencyContextService);

    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // Suspended user
  // --------------------------------------------------
  it('throws ForbiddenException if user is suspended', async () => {
    const req = {
      user: { id: 1, role: user_role.agent, status: user_status.suspended },
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req)),
    ).rejects.toThrow(ForbiddenException);
  });

  // --------------------------------------------------
  // Already loaded context
  // --------------------------------------------------
  it('does not reload context if agencyId already exists', async () => {
    const req = {
      user: { id: 1, role: user_role.agent, status: user_status.active },
      agencyId: 100,
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req)),
    ).resolves.toBe(true);

    expect(agencyContextService.loadAgencyContext).not.toHaveBeenCalled();
    expect(agencyContextService.checkAgencyAndAgentStatus).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Route does NOT require agency context
  // --------------------------------------------------
  it('returns true when decorator is missing', async () => {
    const req = {
      user: { id: 1, role: user_role.agent, status: user_status.active },
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req, false)),
    ).resolves.toBe(true);

    expect(agencyContextService.loadAgencyContext).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Agent role
  // --------------------------------------------------
  it('loads agency context for agent when required', async () => {
    const req = {
      user: { id: 1, role: user_role.agent, status: user_status.active },
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req)),
    ).resolves.toBe(true);

    expect(agencyContextService.loadAgencyContext).toHaveBeenCalledWith(
      req,
      'al',
    );
    expect(agencyContextService.checkAgencyAndAgentStatus).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // Agency owner role
  // --------------------------------------------------
  it('loads agency context for agency owner', async () => {
    const req = {
      user: { id: 2, role: user_role.agency_owner, status: user_status.active },
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req)),
    ).resolves.toBe(true);

    expect(agencyContextService.loadAgencyContext).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // No user
  // --------------------------------------------------
  it('returns true if no user is present', async () => {
    const req = { language: 'al' };

    await expect(
      guard.canActivate(mockContext(req)),
    ).resolves.toBe(true);

    expect(agencyContextService.loadAgencyContext).not.toHaveBeenCalled();
  });
});