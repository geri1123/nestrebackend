import { ForbiddenException } from '@nestjs/common';
import { ProductOwnershipAndPermissionGuard } from './product-ownership.guard';
import { GetProductForPermissionUseCase } from '../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { user_role } from '@prisma/client';

describe('ProductOwnershipAndPermissionGuard', () => {
  let guard: ProductOwnershipAndPermissionGuard;

  const getProductMock = {
    execute: jest.fn(),
  };

  const mockContext = (req: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any);

  beforeEach(() => {
    guard = new ProductOwnershipAndPermissionGuard(
      getProductMock as unknown as GetProductForPermissionUseCase,
    );
    jest.clearAllMocks();
  });

  it('denies agency_owner when product is from another agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 2, userId: 99 });

    const req = {
      params: { id: '10' },
      language: 'al',
      user: { role: user_role.agency_owner },
      agencyId: 1,
      userId: 1,
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows agency_owner when product is from same agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 99 });

    const req = {
      params: { id: '10' },
      language: 'al',
      user: { role: user_role.agency_owner },
      agencyId: 1,
      userId: 1,
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('allows agent to edit own product', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 5 });

    const req = {
      params: { id: '10' },
      language: 'al',
      user: { role: user_role.agent },
      userId: 5,
      agencyId: 1,
      agencyAgentId: 123,
      agentPermissions: { canEditOthersPost: false },
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('allows agent to edit others product if has permission and same agency', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 999 });

    const req = {
      params: { id: '10' },
      language: 'al',
      user: { role: user_role.agent },
      userId: 5,
      agencyId: 1,
      agencyAgentId: 123,
      agentPermissions: { canEditOthersPost: true },
    };

    await expect(guard.canActivate(mockContext(req))).resolves.toBe(true);
  });

  it('denies normal user when not product owner', async () => {
    getProductMock.execute.mockResolvedValue({ agencyId: 1, userId: 999 });

    const req = {
      params: { id: '10' },
      language: 'al',
      user: { role: user_role.user },
      userId: 5,
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});