import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from '../update-product.use-case';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  } as any;

  const deleteImages = {
    execute: jest.fn(),
    findByProductId: jest.fn(),
    executeByUrls: jest.fn(),
  } as any;

  const uploadImages = { execute: jest.fn() } as any;
  const deleteAttributes = { execute: jest.fn() } as any;
  const createAttributes = { execute: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();

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
      useCase.execute({
        productId: 1,
        dto: {} as any,
        userId: 10,
        language: 'en',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update product successfully with no images', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1, title: 'Updated' }),
    });
    deleteImages.findByProductId.mockResolvedValue([]);

    const result = await useCase.execute({
      productId: 1,
      dto: { title: 'Updated' } as any,
      userId: 10,
      language: 'en',
    });

    expect(repo.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.product.images).toEqual([]);
  });

  it('should delete and recreate attributes when provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });
    deleteImages.findByProductId.mockResolvedValue([]);

    await useCase.execute({
      productId: 1,
      dto: { attributes: [{ id: 1, value: 'x' }] } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteAttributes.execute).toHaveBeenCalledWith(1);
    expect(createAttributes.execute).toHaveBeenCalled();
  });

  it('should delete removed images from cloudinary and db', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    // Two images exist, user kept only one
    deleteImages.findByProductId.mockResolvedValue([
      { imageUrl: 'https://cdn.com/img1.jpg', publicId: 'pub1' },
      { imageUrl: 'https://cdn.com/img2.jpg', publicId: 'pub2' },
    ]);

    await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: ['https://cdn.com/img1.jpg'] } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteImages.executeByUrls).toHaveBeenCalledWith(
      ['https://cdn.com/img2.jpg'],
      ['pub2'],
    );
  });

  it('should upload new images when provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });
    deleteImages.findByProductId.mockResolvedValue([]);
    uploadImages.execute.mockResolvedValue([
      { id: 1, imageUrl: 'https://cdn.com/new.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: [] } as any,
      userId: 10,
      language: 'en',
      images: [{} as any],
    });

    expect(uploadImages.execute).toHaveBeenCalled();
    expect(result.product.images.length).toBe(1);
    expect(result.product.images[0].imageUrl).toBe('https://cdn.com/new.jpg');
  });

  it('should keep existing images that are in existingImageUrls', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    deleteImages.findByProductId.mockResolvedValue([
      { imageUrl: 'https://cdn.com/keep.jpg', publicId: 'pub_keep' },
    ]);

    await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: ['https://cdn.com/keep.jpg'] } as any,
      userId: 10,
      language: 'en',
    });

    // Nothing should be deleted
    expect(deleteImages.executeByUrls).not.toHaveBeenCalled();
  });
});