import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from '../update-product.use-case';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  } as any;

  const getImages = {
    byProductId: jest.fn(),
  } as any;

  const deleteImages = {
    byIds: jest.fn(),
  } as any;

  const uploadImages = {
    execute: jest.fn(),
  } as any;

  const deleteAttributes = {
    execute: jest.fn(),
  } as any;

  const createAttributes = {
    execute: jest.fn(),
  } as any;

  const productCountsProducer = {
    emitStatusChanged: jest.fn().mockResolvedValue(undefined),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new UpdateProductUseCase(
      repo,
      getImages,
      deleteImages,
      uploadImages,
      deleteAttributes,
      createAttributes,
      productCountsProducer,
    );
  });

  // ───────────────────────────────
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

  // ───────────────────────────────
  it('should update product successfully with no images', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1, title: 'Updated' }),
    });

    getImages.byProductId.mockResolvedValue([]);

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

  // ───────────────────────────────
  it('should delete removed images by ids', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    getImages.byProductId.mockResolvedValue([
      { id: 10, imageUrl: 'img1.jpg', publicId: 'p1' },
      { id: 11, imageUrl: 'img2.jpg', publicId: 'p2' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: {
        existingImageUrls: ['img1.jpg'],
      } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteImages.byIds).toHaveBeenCalledWith([11]);

    expect(result.product.images).toEqual([
      { id: 10, imageUrl: 'img1.jpg' },
    ]);
  });

  // ───────────────────────────────
  it('should delete all images when existingImageUrls is empty', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    getImages.byProductId.mockResolvedValue([
      { id: 10, imageUrl: 'img1.jpg' },
      { id: 11, imageUrl: 'img2.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: {
        existingImageUrls: [],
      } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteImages.byIds).toHaveBeenCalledWith([10, 11]);
    expect(result.product.images).toEqual([]);
  });

  // ───────────────────────────────
  it('should upload new images and keep existing ones', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    getImages.byProductId.mockResolvedValue([
      { id: 5, imageUrl: 'existing.jpg' },
    ]);

    uploadImages.execute.mockResolvedValue([
      { id: 6, imageUrl: 'new.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: {
        existingImageUrls: ['existing.jpg'],
      } as any,
      userId: 10,
      language: 'en',
      images: [{} as any],
    });

    expect(uploadImages.execute).toHaveBeenCalled();

    expect(result.product.images).toEqual([
      { id: 5, imageUrl: 'existing.jpg' },
      { id: 6, imageUrl: 'new.jpg' },
    ]);
  });

  // ───────────────────────────────
  it('should not upload when no new images provided', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    getImages.byProductId.mockResolvedValue([]);

    await useCase.execute({
      productId: 1,
      dto: {} as any,
      userId: 10,
      language: 'en',
    });

    expect(uploadImages.execute).not.toHaveBeenCalled();
  });

  // ───────────────────────────────
  it('should keep existing images when no changes', async () => {
    repo.findById.mockResolvedValue({ id: 1, subcategoryId: 2, status: 'ACTIVE' });

    repo.update.mockResolvedValue({
      toResponse: () => ({ id: 1 }),
    });

    getImages.byProductId.mockResolvedValue([
      { id: 9, imageUrl: 'keep.jpg' },
    ]);

    const result = await useCase.execute({
      productId: 1,
      dto: {
        existingImageUrls: ['keep.jpg'],
      } as any,
      userId: 10,
      language: 'en',
    });

    expect(deleteImages.byIds).not.toHaveBeenCalled();

    expect(result.product.images).toEqual([
      { id: 9, imageUrl: 'keep.jpg' },
    ]);
  });
});