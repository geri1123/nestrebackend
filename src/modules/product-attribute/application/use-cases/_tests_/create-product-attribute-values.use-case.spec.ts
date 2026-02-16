import { SupportedLang } from "../../../../../locales";
import { CreateProductAttributeValuesUseCase } from "../create-product-attributes.use-case";

describe('CreateProductAttributeValuesUseCase', () => {
  let valueRepo: any;
  let attributeRepo: any;
  let useCase: CreateProductAttributeValuesUseCase;

  beforeEach(() => {
    valueRepo = {
      createMultiple: jest.fn().mockResolvedValue(undefined),
    };
    attributeRepo = {
      getValidAttributeIdsBySubcategory: jest.fn().mockResolvedValue([1, 2, 3]),
      getAttributeById: jest.fn().mockResolvedValue({ inputType: 'boolean' }),
      getAttributeValueByCode: jest.fn().mockResolvedValue({ id: 10 }),
    };

    useCase = new CreateProductAttributeValuesUseCase(valueRepo, attributeRepo);
  });

  it('should create attribute values when all attributes are valid', async () => {
    await useCase.execute(
      1,
      5,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 6 }
      ],
      'en' as SupportedLang
    );

    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 6 }
      ]
    );
  });

  it('should automatically find "true" value for boolean attributes without attributeValueId', async () => {
    attributeRepo.getAttributeById.mockResolvedValue({ inputType: 'boolean' });
    attributeRepo.getAttributeValueByCode.mockResolvedValue({ id: 10 });

    await useCase.execute(
      1,
      5,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2 } // missing attributeValueId
      ],
      'en' as SupportedLang
    );

    expect(attributeRepo.getAttributeValueByCode).toHaveBeenCalledWith(2, 'true');
    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 10 }
      ]
      // Removed 'en'
    );
  });

  it('should handle mix of boolean and regular attributes', async () => {
    attributeRepo.getAttributeById.mockImplementation(async (id) => {
      return { inputType: id === 2 ? 'boolean' : 'text' };
    });
    attributeRepo.getAttributeValueByCode.mockResolvedValue({ id: 20 });

    await useCase.execute(
      1,
      5,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2 }, // boolean
        { attributeId: 3, attributeValueId: 30 }
      ],
      'en' as SupportedLang
    );

    expect(valueRepo.createMultiple).toHaveBeenCalledWith(
      1,
      [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, attributeValueId: 20 },
        { attributeId: 3, attributeValueId: 30 }
      ]
      // Removed 'en'
    );
  });
});