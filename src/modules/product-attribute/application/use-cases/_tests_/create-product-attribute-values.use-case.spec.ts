import { BadRequestException } from '@nestjs/common';
import { CreateProductAttributeValuesUseCase } from '../create-product-attributes.use-case';

describe('CreateProductAttributeValuesUseCase', () => {
  let useCase: CreateProductAttributeValuesUseCase;

  const valueRepo = {
    createMultiple: jest.fn(),
  } as any;

  const attributeRepo = {
    getValidAttributeIdsBySubcategory: jest.fn(),
    getAttributeById: jest.fn(), 
    getAttributeValueByCode: jest.fn(),  
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
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

 
  it('should automatically find "true" value for boolean attributes without attributeValueId', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([1, 2]);
    
    
    attributeRepo.getAttributeById.mockResolvedValue({
      id: 2,
      inputType: 'boolean',
      code: 'has_tv',
    });

    attributeRepo.getAttributeValueByCode.mockResolvedValue({
      id: 10,
      value_code: 'true',
    });

    await useCase.execute(
      1,
      10,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2 },
      ],
      'en',
    );

    expect(attributeRepo.getAttributeById).toHaveBeenCalledWith(2);
    expect(attributeRepo.getAttributeValueByCode).toHaveBeenCalledWith(2, 'true');
    
    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 10 }, 
      ],
      'en',
    );
  });

  it('should throw BadRequestException if boolean attribute missing "true" value in database', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([2]);
    
    attributeRepo.getAttributeById.mockResolvedValue({
      id: 2,
      inputType: 'boolean',
      code: 'has_parking',
    });

    attributeRepo.getAttributeValueByCode.mockResolvedValue(null);

    await expect(
      useCase.execute(
        1,
        10,
        [{ attributeId: 2 }],
        'en',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(valueRepo.createMultiple).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if non-boolean attribute missing attributeValueId', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([1]);
    
    attributeRepo.getAttributeById.mockResolvedValue({
      id: 1,
      inputType: 'select', // Jo boolean
      code: 'num_rooms',
    });

    await expect(
      useCase.execute(
        1,
        10,
        [{ attributeId: 1 }], 
        'en',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(valueRepo.createMultiple).not.toHaveBeenCalled();
  });


  it('should handle mix of boolean and regular attributes', async () => {
    attributeRepo.getValidAttributeIdsBySubcategory.mockResolvedValue([1, 2, 3]);
    
    // Mock për boolean attribute
    attributeRepo.getAttributeById
      .mockResolvedValueOnce({
        id: 2,
        inputType: 'boolean',
        code: 'has_tv',
      })
      .mockResolvedValueOnce({
        id: 3,
        inputType: 'boolean',
        code: 'has_parking',
      });

    attributeRepo.getAttributeValueByCode
      .mockResolvedValueOnce({ id: 20, value_code: 'true' })
      .mockResolvedValueOnce({ id: 30, value_code: 'true' });

    await useCase.execute(
      1,
      10,
      [
        { attributeId: 1, attributeValueId: 5 }, // Regular
        { attributeId: 2 }, // Boolean
        { attributeId: 3 }, // Boolean
      ],
      'en',
    );

    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 20 },
        { attributeId: 3, attributeValueId: 30 },
      ],
      'en',
    );
  });
});