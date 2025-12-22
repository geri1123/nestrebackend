import { JwtAuthGuard } from "../jwt-auth.guard";

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtMock = { verify: jest.fn() };
  const reflectorMock = { getAllAndOverride: jest.fn() };
  const getUserProfileMock = { execute: jest.fn() };
  const userRepoMock = { updateFields: jest.fn() };
  const agentContextMock = { execute: jest.fn() };
  const agencyByOwnerMock = { execute: jest.fn() };

  beforeEach(() => {
    guard = new JwtAuthGuard(
      jwtMock as any,
      getUserProfileMock as any,
      userRepoMock as any,
      agentContextMock as any,
      agencyByOwnerMock as any,
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
  });
});