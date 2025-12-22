import { NotFoundException } from '@nestjs/common';
import { GetProductForPermissionUseCase } from '../get-product-for-permission.use-case';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';

describe('GetProductForPermissionUseCase', () => {
  let useCase: GetProductForPermissionUseCase;
  let repo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    repo = {
      findForPermissionCheck: jest.fn(),
    } as any;

    useCase = new GetProductForPermissionUseCase(repo);
  });

  it('should return product when it exists', async () => {
    const product = { id: 1, userId: 10, agencyId: 5 };

    repo.findForPermissionCheck.mockResolvedValue(product as any);

    const result = await useCase.execute(1, 'en');

    expect(repo.findForPermissionCheck).toHaveBeenCalledWith(1);
    expect(result).toBe(product);
  });

  it('should throw NotFoundException when product does not exist', async () => {
    repo.findForPermissionCheck.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.findForPermissionCheck).toHaveBeenCalledWith(999);
  });
});