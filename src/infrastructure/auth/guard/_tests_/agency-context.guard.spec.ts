import { AgencyContextGuard } from '../agency-context.guard';
import { Reflector } from '@nestjs/core';
import { AgencyContextOrchestrator } from '../../services/agency-context-orchestrator.service';
import { ForbiddenException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

describe('AgencyContextGuard', () => {
  let guard: AgencyContextGuard;
  let reflector: any;
  let orchestrator: any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    orchestrator = {
      loadContext: jest.fn(),
      validateStatus: jest.fn(),
    };

    guard = new AgencyContextGuard(reflector, orchestrator);
  });

 const createContext = (user?: any) => {
  const req: any = { user, language: 'en' };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;
};

  it('allows if no user', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext();
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(orchestrator.loadContext).not.toHaveBeenCalled();
  });

  it('throws if user is suspended', async () => {
    const context = createContext({ status: UserStatus.suspended });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not load context if already loaded', async () => {
    const context = createContext({ role: UserRole.agent, status: UserStatus.active, id: 1 });
    const req = context.switchToHttp().getRequest();
    req.agencyId = 1;

    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(orchestrator.loadContext).not.toHaveBeenCalled();
    expect(orchestrator.validateStatus).toHaveBeenCalledWith(req, 'en');
  });

  it('loads context if not loaded and role requires it', async () => {
    const context = createContext({ role: UserRole.agent, status: UserStatus.active, id: 1 });
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const req = context.switchToHttp().getRequest();
    expect(orchestrator.loadContext).toHaveBeenCalledWith(req, 'en');
    expect(orchestrator.validateStatus).toHaveBeenCalledWith(req, 'en');
  });

  it('does not load context if role does not require it', async () => {
    const context = createContext({ role: UserRole.user, status: UserStatus.active, id: 1 });
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(orchestrator.loadContext).not.toHaveBeenCalled();
    expect(orchestrator.validateStatus).not.toHaveBeenCalled();
  });

  it('does not load context if requireAgencyContext is false', async () => {
    const context = createContext({ role: UserRole.agent, status: UserStatus.active, id: 1 });
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(orchestrator.loadContext).not.toHaveBeenCalled();
    expect(orchestrator.validateStatus).not.toHaveBeenCalled();
  });
});
