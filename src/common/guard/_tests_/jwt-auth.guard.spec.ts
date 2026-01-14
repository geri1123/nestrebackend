import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const authContextServiceMock = {
    extractToken: jest.fn(),
    authenticate: jest.fn(),
  };

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new JwtAuthGuard(
      authContextServiceMock as any,
      reflectorMock as any,
    );
  });

  it('allows public route', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as any);

    expect(result).toBe(true);
    expect(authContextServiceMock.extractToken).not.toHaveBeenCalled();
    expect(authContextServiceMock.authenticate).not.toHaveBeenCalled();
  });

  it('throws if no token', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    authContextServiceMock.extractToken.mockReturnValue(null);

    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ language: 'al', headers: {}, cookies: {} }) }),
    } as any;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches auth context to request when token is valid', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    authContextServiceMock.extractToken.mockReturnValue('token123');
    authContextServiceMock.authenticate.mockResolvedValue({
      user: { id: 1, role: 'agent' },
      userId: 1,
      agencyId: 10,
      agencyAgentId: 99,
      agentPermissions: { canEditOthersPost: true },
      agentStatus: 'active',
    });

    const req: any = { language: 'al', headers: {}, cookies: {} };

    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => req }),
    } as any;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.userId).toBe(1);
    expect(req.agencyId).toBe(10);
    expect(req.agencyAgentId).toBe(99);
    expect(req.agentPermissions).toEqual({ canEditOthersPost: true });
    expect(req.agentStatus).toBe('active');
  });
});