import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './role-guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;

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
    guard = new RolesGuard(reflectorMock as unknown as Reflector);
    jest.clearAllMocks();
  });

  it('allows access when no roles are required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(
      mockContext({ language: 'al', user: { role: 'user' } }),
    );

    expect(result).toBe(true);
  });

  it('allows access when user role is included', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['agent', 'agency_owner']);

    const result = guard.canActivate(
      mockContext({ language: 'al', user: { role: 'agent' } }),
    );

    expect(result).toBe(true);
  });

  it('denies access when user role is not included', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['agency_owner']);

    expect(() =>
      guard.canActivate(
        mockContext({ language: 'al', user: { role: 'user' } }),
      ),
    ).toThrow(ForbiddenException);
  });
});