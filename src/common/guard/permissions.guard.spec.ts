import { ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { user_role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  const mockContext = (req: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any);

  beforeEach(() => {
    reflector = reflectorMock as any;
    guard = new PermissionsGuard(reflector);
    jest.clearAllMocks();
  });

  it('allows public route', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) =>
      key === IS_PUBLIC_KEY ? true : null,
    );

    const result = await guard.canActivate(
      mockContext({ language: 'al' }),
    );

    expect(result).toBe(true);
  });

  it('allows agency_owner regardless of permissions', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) =>
      key === PERMISSIONS_KEY ? ['can_edit'] : false,
    );

    const result = await guard.canActivate(
      mockContext({
        language: 'al',
        user: { role: 'agency_owner' },
      }),
    );

    expect(result).toBe(true);
  });

  it('denies agent without required permission', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) =>
      key === PERMISSIONS_KEY ? ['can_edit'] : false,
    );

    await expect(
      guard.canActivate(
        mockContext({
          language: 'al',
          user: { role: user_role.agent },
          agencyAgentId: 1,
          agentPermissions: { can_edit: false },
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});