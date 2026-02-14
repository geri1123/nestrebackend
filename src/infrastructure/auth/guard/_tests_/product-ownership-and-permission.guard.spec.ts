import { ForbiddenException } from '@nestjs/common';
import { ProductOwnershipGuard } from '../product-ownership.guard';
import { GetProductForPermissionUseCase } from '../../../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { user_role, user_status } from '@prisma/client';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { AgentPermissions } from '../../../../common/types/permision.type';

describe('ProductOwnershipGuard', () => {
  let guard: ProductOwnershipGuard;
  let getProductMock: jest.Mocked<GetProductForPermissionUseCase>;

  const mockContext = (req: Partial<RequestWithUser>) => ({
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any);

  beforeEach(() => {
    getProductMock = { execute: jest.fn() } as unknown as jest.Mocked<GetProductForPermissionUseCase>;
    guard = new ProductOwnershipGuard(getProductMock);
    jest.clearAllMocks();
  });

  const defaultAgentPermissions: AgentPermissions = {
    can_edit_own_post: false,
    can_edit_others_post: false,
    can_approve_requests: false,
    can_view_all_posts: false,
    can_delete_posts: false,
    can_manage_agents: false,
  };
const createUser = (overrides?: Partial<RequestWithUser['user']>) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',    
  status: user_status.active,
  role: user_role.user,
  emailVerified: true,
  profileImgUrl: null,
  createdAt: new Date(),
  ...overrides,
});

  it('denies agency_owner when product is from another agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 2, userId: 99 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agency_owner }),
      agencyId: 1,
      userId: 1,
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows agency_owner when product is from same agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 99 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agency_owner }),
      agencyId: 1,
      userId: 1,
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  // ----- Agent Tests -----
  it('allows agent to edit own product', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 5 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agent }),
      userId: 5,
      agencyId: 1,
      agencyAgentId: 123,
      agentPermissions: { ...defaultAgentPermissions, can_edit_others_post: false },
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('allows agent to edit others product if has permission and same agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 999 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agent }),
      userId: 5,
      agencyId: 1,
      agencyAgentId: 123,
      agentPermissions: { ...defaultAgentPermissions, can_edit_others_post: true },
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('denies agent to edit others product without permission', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 999 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agent }),
      userId: 5,
      agencyId: 1,
      agencyAgentId: 123,
      agentPermissions: { ...defaultAgentPermissions, can_edit_others_post: false },
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies agent without agency association', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 5 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.agent }),
      userId: 5,
      agencyId: 1,
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
  });

  // ----- Regular User Tests -----
  it('allows regular user to edit own product', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 5 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.user }),
      userId: 5,
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('denies regular user editing someone else product', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 999 } as any);

    const req: Partial<RequestWithUser> = {
      params: { id: '10' },
      language: 'al',
      user: createUser({ role: user_role.user }),
      userId: 5,
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
  });
});