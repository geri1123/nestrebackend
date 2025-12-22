import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from '../update-product.use-case';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  } as any;

  const deleteImages = { execute: jest.fn() } as any;
  const uploadImages = { execute: jest.fn() } as any;
  const deleteAttributes = { execute: jest.fn() } as any;
  const createAttributes = { execute: jest.fn() } as any;

  beforeEach(() => {
    useCase = new UpdateProductUseCase(
      repo,
      deleteImages,
      uploadImages,
      deleteAttributes,
      createAttributes,
    );
  });

  it('should throw NotFoundException if product does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, {} as any, 10, undefined, 'en'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update product successfully', async () => {
    repo.findById.mockResolvedValue({
      id: 1,
      subcategoryId: 2,
    });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1, title: 'Updated' }),
    });

    const result = await useCase.execute(
      1,
      { title: 'Updated' } as any,
      10,
      undefined,
      'en',
    );

    expect(repo.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should delete and recreate attributes when provided', async () => {
    repo.findById.mockResolvedValue({
      id: 1,
      subcategoryId: 2,
    });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    await useCase.execute(
      1,
      { attributes: [{ id: 1, value: 'x' }] } as any,
      10,
      undefined,
      'en',
    );

    expect(deleteAttributes.execute).toHaveBeenCalledWith(1);
    expect(createAttributes.execute).toHaveBeenCalled();
  });

  it('should delete and upload images when images are provided', async () => {
    repo.findById.mockResolvedValue({
      id: 1,
      subcategoryId: 2,
    });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    uploadImages.execute.mockResolvedValue([
      { id: 1, imageUrl: 'img.png' },
    ]);

    const result = await useCase.execute(
      1,
      {} as any,
      10,
      undefined,
      'en',
      [{} as any],
    );

    expect(deleteImages.execute).toHaveBeenCalledWith(1);
    expect(uploadImages.execute).toHaveBeenCalled();
    expect(result.product.images.length).toBe(1);
  });
});