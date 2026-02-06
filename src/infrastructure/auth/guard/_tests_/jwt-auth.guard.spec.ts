import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthContextService } from '../../services/auth-context.service';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authContextService: AuthContextService;
  let reflector: Reflector;

  beforeEach(() => {
    authContextService = {
      extractToken: jest.fn(),
      authenticate: jest.fn(),
    } as unknown as AuthContextService;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    guard = new JwtAuthGuard(authContextService, reflector);
  });

  // Helper to mock ExecutionContext
  const mockExecutionContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => {},
    getClass: () => {},
  } as unknown as any);

  it('should allow access if route is public', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const req = {};
    const result = await guard.canActivate(mockExecutionContext(req));
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (authContextService.extractToken as jest.Mock).mockReturnValue(null);

    const req = { language: 'al' };
    await expect(guard.canActivate(mockExecutionContext(req))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authContextService.extractToken).toHaveBeenCalledWith(req);
  });

  it('should set user and userId on request if token is valid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (authContextService.extractToken as jest.Mock).mockReturnValue('validToken');
    (authContextService.authenticate as jest.Mock).mockResolvedValue({
      user: { id: 1, username: 'john' },
      userId: 1,
    });

    const req: any = { language: 'al' };
    const result = await guard.canActivate(mockExecutionContext(req));

    expect(result).toBe(true);
    expect(req.user).toEqual({ id: 1, username: 'john' });
    expect(req.userId).toBe(1);
    expect(authContextService.authenticate).toHaveBeenCalledWith('validToken', 'al');
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (authContextService.extractToken as jest.Mock).mockReturnValue('invalidToken');
    (authContextService.authenticate as jest.Mock).mockRejectedValue(new Error('JWT expired'));

    const req: any = { language: 'al' };
    await expect(guard.canActivate(mockExecutionContext(req))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});