import { GetProductByIdUseCase } from '../get-product-by-id.use-case';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;

  const repo = {
    findByIdWithDetails: jest.fn(),
  } as any;

  const clicksService = {
    getClicksByProduct: jest.fn(),
  } as any;

  beforeEach(() => {
    useCase = new GetProductByIdUseCase(repo, clicksService);
    jest.clearAllMocks();
  });

  const baseProduct = {
    id: 1,
    title: 'Test Product',
    price: 100,
    status: 'draft',
    userId: 10,
    agencyId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Test description',
    streetAddress: 'Test Street',
    buildYear: 2020,
    area: 100,
    subcategoryId: 1,
    productimage: [],
    productattributevalue: [], // Add this for attributes
    advertisements: [],
    city: { name: 'Tirana' },
    subcategory: {
      id: 1,
      subcategorytranslation: [{ name: 'Apartment' }],
      category: {
        id: 1,
        categorytranslation: [{ name: 'Residential' }],
      },
    },
    listing_type: {
      listing_type_translation: [{ name: 'For Sale' }],
    },
    user: { 
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      role: 'user',
      status: 'active',
    },
    agency: { 
      agency_name: 'Test Agency',
      logo: null,
      address: 'Test Address',
      phone: null,
      created_at: new Date(),
      status: 'active',
    },
  };

  it('should return null product if product not found', async () => {
    repo.findByIdWithDetails.mockResolvedValue(null);

    const result = await useCase.execute(1, 'en', false);

    expect(result).toEqual({ product: null });
  });

  it('should return null product for inactive product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result).toEqual({ product: null });
  });

  it('should allow owner to see inactive product on protected route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(
      1,
      'en',
      true,
      { userId: 10 } as any,
    );

    expect(result.product).not.toBeNull();
    expect(result.product?.id).toBe(1);
    expect(result.product?.userId).toBe(10);
  });

  it('should allow agency owner to see inactive product', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(
      1,
      'en',
      true,
      { 
        userId: 99, 
        user: { role: 'agency_owner' },
        agencyId: 5,
      } as any,
    );

    expect(result.product).not.toBeNull();
    expect(result.product?.agencyId).toBe(5);
  });

  it('should allow agent with permissions to see inactive product', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(
      1,
      'en',
      true,
      { 
        userId: 99, 
        user: { role: 'agent' },
        agentPermissions: { canViewAllPosts: true },
      } as any,
    );

    expect(result.product).not.toBeNull();
  });

  it('should return null if user is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      user: { ...baseProduct.user, status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', true);

    expect(result).toEqual({ product: null });
  });

  it('should return null if agency is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      agency: { ...baseProduct.agency, status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', true);

    expect(result).toEqual({ product: null });
  });

  it('should return product dto with total clicks for active product', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
    });

    clicksService.getClicksByProduct.mockResolvedValue([
      { count: 2 },
      { count: 3 },
    ]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.product).not.toBeNull();
    expect(result.product?.totalClicks).toBe(5);
    expect(result.product?.id).toBe(1);
    expect(result.product?.title).toBe('Test Product');
    expect(result.product?.price).toBe(100);
  });

  it('should include related data with subcategory and category IDs', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
    });

    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.relatedData).toBeDefined();
    expect(result.relatedData?.subcategoryId).toBe(1);
    expect(result.relatedData?.categoryId).toBe(1);
  });

  it('should not include related data if subcategory is null', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      subcategory: null,
    });

    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.relatedData).toBeUndefined();
  });

  it('should map product attributes correctly', async () => {
    const productWithAttributes = {
      ...baseProduct,
      status: 'active',
      productattributevalue: [
        {
          attributeId: 1,
          attributeValueId: 2,
          attributes: {
            inputType: 'select',
            attributeTranslation: [{ name: 'Bedrooms' }],
          },
          attribute_values: {
            value_code: '3',
            attributeValueTranslations: [{ name: '3 Bedrooms' }],
          },
        },
        {
          attributeId: 2,
          attributeValueId: 5,
          attributes: {
            inputType: 'checkbox',
            attributeTranslation: [{ name: 'Has Parking' }],
          },
          attribute_values: {
            value_code: 'true',
            attributeValueTranslations: [{ name: 'Yes' }],
          },
        },
      ],
    };

    repo.findByIdWithDetails.mockResolvedValue(productWithAttributes);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.product?.attributes).toHaveLength(2);
    expect(result.product?.attributes[0]).toEqual({
      attributeId: 1,
      attributeName: 'Bedrooms',
      inputType: 'select',
      attributeValueId: 2,
      attributeValue: '3 Bedrooms',
      valueCode: '3',
    });
    expect(result.product?.attributes[1]).toEqual({
      attributeId: 2,
      attributeName: 'Has Parking',
      inputType: 'checkbox',
      attributeValueId: 5,
      attributeValue: 'Yes',
      valueCode: 'true',
    });
  });

  it('should handle missing attribute translations gracefully', async () => {
    const productWithMissingTranslations = {
      ...baseProduct,
      status: 'active',
      productattributevalue: [
        {
          attributeId: 1,
          attributeValueId: 2,
          attributes: {
            inputType: 'select',
            attributeTranslation: [],
          },
          attribute_values: {
            value_code: '3',
            attributeValueTranslations: [],
          },
        },
      ],
    };

    repo.findByIdWithDetails.mockResolvedValue(productWithMissingTranslations);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.product?.attributes[0]).toEqual({
      attributeId: 1,
      attributeName: 'Unknown Attribute',
      inputType: 'select',
      attributeValueId: 2,
      attributeValue: '3', // Falls back to valueCode
      valueCode: '3',
    });
  });

  it('should include advertisement details for advertised products', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const productWithAd = {
      ...baseProduct,
      status: 'active',
      advertisements: [
        {
          id: 10,
          status: 'active',
          adType: 'premium',
          startDate: new Date(),
          endDate: futureDate,
        },
      ],
    };

    repo.findByIdWithDetails.mockResolvedValue(productWithAd);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.product?.isAdvertised).toBe(true);
    expect(result.product?.advertisement).toEqual({
      id: 10,
      adType: 'premium',
      status: 'active',
      startDate: expect.any(String),
      endDate: expect.any(String),
    });
  });

  it('should not show expired advertisements', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);

    const productWithExpiredAd = {
      ...baseProduct,
      status: 'active',
      advertisements: [
        {
          id: 10,
          status: 'active',
          adType: 'premium',
          startDate: pastDate,
          endDate: pastDate,
        },
      ],
    };

    repo.findByIdWithDetails.mockResolvedValue(productWithExpiredAd);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result.product?.isAdvertised).toBe(false);
    expect(result.product?.advertisement).toBeNull();
  });
});