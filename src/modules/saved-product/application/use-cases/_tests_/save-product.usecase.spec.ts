import { ForbiddenException } from '@nestjs/common';
import { SaveProductUseCase } from '../save-product.usecase';

describe('SaveProductUseCase', () => {
  let useCase: SaveProductUseCase;

  const repo = {
    findByUserAndProduct: jest.fn(),
    save: jest.fn(),
  } as any;

  const prodRepo = {
    findById: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SaveProductUseCase(repo, prodRepo);
  });

  it('should throw if user tries to save their own product', async () => {
    prodRepo.findById.mockResolvedValue({ id: 10, userId: 1 });

    await expect(
      useCase.execute(1, 10, 'en'),
    ).rejects.toThrow(ForbiddenException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw if product is already saved', async () => {
    prodRepo.findById.mockResolvedValue({ id: 10, userId: 2 });
    repo.findByUserAndProduct.mockResolvedValue({ id: 1 });

    await expect(
      useCase.execute(1, 10, 'en'),
    ).rejects.toThrow(ForbiddenException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw if save fails', async () => {
    prodRepo.findById.mockResolvedValue({ id: 10, userId: 2 });
    repo.findByUserAndProduct.mockResolvedValue(null);
    repo.save.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 10, 'en'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should save product successfully', async () => {
    prodRepo.findById.mockResolvedValue({ id: 10, userId: 2 });
    repo.findByUserAndProduct.mockResolvedValue(null);
    repo.save.mockResolvedValue({ id: 1, userId: 1, productId: 10 });

    const result = await useCase.execute(1, 10, 'en');

    expect(repo.save).toHaveBeenCalled();
    expect(result.productId).toBe(10);
  });
});
