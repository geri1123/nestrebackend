import { BadRequestException } from '@nestjs/common';

import { CreateProductAttributeValuesUseCase } from '../create-product-attributes.use-case';
describe('CreateProductAttributeValuesUseCase', () => {
  let useCase: CreateProductAttributeValuesUseCase;

  const valueRepo = {
    createMultiple: jest.fn(),
  } as any;

  const attributeRepo = {
    getValidAttributeIdsBySubcategory: jest.fn(),
  } as any;

  beforeEach(() => {
    useCase = new CreateProductAttributeValuesUseCase(
      valueRepo,
      attributeRepo,
    );
  });

  it('should return early if attributes array is empty', async () => {
    await useCase.execute(1, 2, [], 'en');

    expect(attributeRepo.getValidAttributeIdsBySubcategory).not.toHaveBeenCalled();
    expect(valueRepo.createMultiple).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid attribute', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([1, 2]);

    await expect(
      useCase.execute(
        1,
        10,
        [{ attributeId: 99, attributeValueId: 5 }],
        'en',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(valueRepo.createMultiple).not.toHaveBeenCalled();
  });

  it('should create attribute values when all attributes are valid', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([1, 2, 3]);

    await useCase.execute(
      1,
      10,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 6 },
      ],
      'en',
    );

    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 6 },
      ],
      'en',
    );
  });
});