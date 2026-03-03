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

  // ─── Product lookup ────────────────────────────────────────────────────────

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

  // ─── Basic update ──────────────────────────────────────────────────────────

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

  // ─── Attributes ────────────────────────────────────────────────────────────

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

  it('should not touch attributes when none are provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });
    deleteImages.findByProductId.mockResolvedValue([]);

    await useCase.execute({
      productId: 1,
      dto: {} as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteAttributes.execute).not.toHaveBeenCalled();
    expect(createAttributes.execute).not.toHaveBeenCalled();
  });

  // ─── Image deletion ────────────────────────────────────────────────────────

  it('should delete removed images from cloudinary and db', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });

    deleteImages.findByProductId.mockResolvedValue([
      { id: 10, imageUrl: 'https://cdn.com/img1.jpg', publicId: 'pub1' },
      { id: 11, imageUrl: 'https://cdn.com/img2.jpg', publicId: 'pub2' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: ['https://cdn.com/img1.jpg'] } as any,
      userId: 10,
      language: 'en',
    });

    // img2 should be deleted
    expect(deleteImages.executeByUrls).toHaveBeenCalledWith(
      ['https://cdn.com/img2.jpg'],
      ['pub2'],
    );

    // img1 should still be in the response
    expect(result.product.images).toEqual([
      { id: 10, imageUrl: 'https://cdn.com/img1.jpg' },
    ]);
  });

  it('should delete all images when existingImageUrls is empty', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });

    deleteImages.findByProductId.mockResolvedValue([
      { id: 10, imageUrl: 'https://cdn.com/img1.jpg', publicId: 'pub1' },
      { id: 11, imageUrl: 'https://cdn.com/img2.jpg', publicId: 'pub2' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: [] } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteImages.executeByUrls).toHaveBeenCalledWith(
      ['https://cdn.com/img1.jpg', 'https://cdn.com/img2.jpg'],
      ['pub1', 'pub2'],
    );
    expect(result.product.images).toEqual([]);
  });

  // ─── Image upload ──────────────────────────────────────────────────────────

  it('should upload new images when provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });
    deleteImages.findByProductId.mockResolvedValue([]);
    uploadImages.execute.mockResolvedValue([
      { id: 20, imageUrl: 'https://cdn.com/new.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: [] } as any,
      userId: 10,
      language: 'en',
      images: [{} as any],
    });

    expect(uploadImages.execute).toHaveBeenCalled();
    expect(result.product.images).toEqual([
      { id: 20, imageUrl: 'https://cdn.com/new.jpg' },
    ]);
  });

  it('should not call uploadImages when no new images are provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });
    deleteImages.findByProductId.mockResolvedValue([]);

    await useCase.execute({
      productId: 1,
      dto: {} as any,
      userId: 10,
      language: 'en',
    });

    expect(uploadImages.execute).not.toHaveBeenCalled();
  });

  // ─── Keep existing + add new (the main bug scenario) ──────────────────────

  it('should keep existing images AND append newly uploaded images', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });

    // Product already has 1 image
    deleteImages.findByProductId.mockResolvedValue([
      { id: 5, imageUrl: 'https://cdn.com/existing.jpg', publicId: 'pub_existing' },
    ]);

    // User uploads 1 more image without removing the existing one
    uploadImages.execute.mockResolvedValue([
      { id: 6, imageUrl: 'https://cdn.com/new.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: ['https://cdn.com/existing.jpg'] } as any,
      userId: 10,
      language: 'en',
      images: [{} as any],
    });

    // Nothing should be deleted
    expect(deleteImages.executeByUrls).not.toHaveBeenCalled();

    // Both images should appear in the response
    expect(result.product.images).toEqual([
      { id: 5, imageUrl: 'https://cdn.com/existing.jpg' },
      { id: 6, imageUrl: 'https://cdn.com/new.jpg' },
    ]);
  });

  // ─── Keep existing only (no new uploads) ──────────────────────────────────

  it('should keep existing images that are in existingImageUrls', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2 });
    repo.update.mockResolvedValue({ toResponse: () => ({ id: 1 }) });

    deleteImages.findByProductId.mockResolvedValue([
      { id: 5, imageUrl: 'https://cdn.com/keep.jpg', publicId: 'pub_keep' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: { existingImageUrls: ['https://cdn.com/keep.jpg'] } as any,
      userId: 10,
      language: 'en',
    });

    // Nothing should be deleted
    expect(deleteImages.executeByUrls).not.toHaveBeenCalled();

    // Kept image should appear in response
    expect(result.product.images).toEqual([
      { id: 5, imageUrl: 'https://cdn.com/keep.jpg' },
    ]);
  });
});