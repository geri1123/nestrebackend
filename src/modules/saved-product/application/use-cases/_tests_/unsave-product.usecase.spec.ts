import { NotFoundException } from '@nestjs/common';
import { UnsaveProductUseCase } from '../unsave-product.usecase';
describe('UnsaveProductUseCase', () => {
  let useCase: UnsaveProductUseCase;

  const repo = {
    findByUserAndProduct: jest.fn(),
    delete: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UnsaveProductUseCase(repo);
  });

  it('should throw NotFoundException if product is not saved', async () => {
    repo.findByUserAndProduct.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 10, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should delete saved product when it exists', async () => {
    repo.findByUserAndProduct.mockResolvedValue({ id: 1 });

    await useCase.execute(1, 10, 'en');

    expect(repo.delete).toHaveBeenCalledWith(1, 10);
  });
});