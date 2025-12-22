import { BadRequestException } from '@nestjs/common';
import { CreateProductUseCase } from '../create-product.use-case';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  const productRepo = { create: jest.fn() } as any;
  const uploadImages = { execute: jest.fn() } as any;
  const createAttributes = { execute: jest.fn() } as any;

  beforeEach(() => {
    useCase = new CreateProductUseCase(
      productRepo,
      uploadImages,
      createAttributes,
    );
  });

  it('should create product successfully', async () => {
    productRepo.create.mockResolvedValue({
      id: 1,
      toResponse: () => ({ id: 1, title: 'Test' }),
    });

    uploadImages.execute.mockResolvedValue([]);
    createAttributes.execute.mockResolvedValue(undefined);

    const result = await useCase.execute(
      {
        title: 'Test',
        price: 100,
        cityId: 1,
        subcategoryId: 2,
        listingTypeId: 1,
      } as any,
      [],
      'en',
      10,
    );

    expect(productRepo.create).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should call image and attribute use cases when provided', async () => {
    productRepo.create.mockResolvedValue({
      id: 1,
      toResponse: () => ({ id: 1 }),
    });

    await useCase.execute(
      {
        title: 'Test',
        price: 100,
        cityId: 1,
        subcategoryId: 2,
        listingTypeId: 1,
        attributes: [{ id: 1, value: 'x' }],
      } as any,
      [{} as any],
      'en',
      10,
    );

    expect(uploadImages.execute).toHaveBeenCalled();
    expect(createAttributes.execute).toHaveBeenCalled();
  });

  it('should throw BadRequestException on failure', async () => {
    productRepo.create.mockRejectedValue(new Error('DB error'));

    await expect(
      useCase.execute(
        { title: 'Test' } as any,
        [],
        'en',
        10,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});