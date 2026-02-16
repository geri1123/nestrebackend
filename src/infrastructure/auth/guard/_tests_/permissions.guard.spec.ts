import { ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from '../permissions.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PERMISSIONS_KEY } from '../../../../common/decorators/permissions.decorator';

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
    reflector = reflectorMock as unknown as Reflector;
    guard = new PermissionsGuard(reflector);
    jest.clearAllMocks();
  });

  it('allows access if no permissions are required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(
      mockContext({ user: { role: UserRole.agent } }),
    );

    expect(result).toBe(true);
  });

  it('allows agency_owner regardless of permissions', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['can_edit']);

    const result = guard.canActivate(
      mockContext({ user: { role: UserRole.agency_owner } }),
    );

    expect(result).toBe(true);
  });

  it('denies access if no user is present', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['can_edit']);

    expect(() =>
      guard.canActivate(mockContext({ language: 'al' })),
    ).toThrow(ForbiddenException);
  });

  it('denies agent without required permission', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['can_edit']);

    expect(() =>
      guard.canActivate(
        mockContext({
          language: 'al',
          user: { role: UserRole.agent },
          agencyAgentId: 1,
          agentPermissions: { can_edit: false },
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows agent with all required permissions', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['can_edit', 'can_delete']);

    const result = guard.canActivate(
      mockContext({
        language: 'al',
        user: { role: UserRole.agent },
        agencyAgentId: 1,
        agentPermissions: { can_edit: true, can_delete: true },
      }),
    );

    expect(result).toBe(true);
  });

  it('denies agent if missing one of multiple permissions', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['can_edit', 'can_delete']);

    expect(() =>
      guard.canActivate(
        mockContext({
          language: 'al',
          user: { role: UserRole.agent },
          agencyAgentId: 1,
          agentPermissions: { can_edit: true, can_delete: false },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});