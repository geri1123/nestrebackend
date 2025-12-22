import { NotFoundException } from '@nestjs/common';
import { FindProductByIdUseCase } from '../find-product-by-id.use-case';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';

describe('FindProductByIdUseCase', () => {
  let useCase: FindProductByIdUseCase;
  let repo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
    } as any;

    useCase = new FindProductByIdUseCase(repo);
  });

  it('should return product when it exists', async () => {
    const product = { id: 1, title: 'Test product' };

    repo.findById.mockResolvedValue(product as any);

    const result = await useCase.execute(1, 'en');

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(product);
  });

  it('should throw NotFoundException when product does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.findById).toHaveBeenCalledWith(999);
  });
});