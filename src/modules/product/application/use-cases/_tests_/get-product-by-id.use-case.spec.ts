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
    productattributevalue: [],
    advertisements: [],
    city: { name: 'Tirana' },
    subcategory: {
      id: 1,
      subcategorytranslation: [{ name: 'Apartment' }],
      category: { id: 1, categorytranslation: [{ name: 'Residential' }] },
    },
    listing_type: { listing_type_translation: [{ name: 'For Sale' }] },
    user: { username: 'testuser', role: 'user', status: 'active' },
    agency: { agency_name: 'Test Agency', status: 'active' },
  };

  it('returns null if product not found', async () => {
    repo.findByIdWithDetails.mockResolvedValue(null);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('returns null for inactive product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('allows owner to see inactive product on protected route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, { userId: 10 } as any);
    expect(result.product).not.toBeNull();
    expect(result.product?.id).toBe(1);
    expect(result.product?.userId).toBe(10);
  });

  it('allows agency owner to see inactive product', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(
      1,
      'en',
      true,
      { user: { role: 'agency_owner' }, agencyId: 5, userId: 99 } as any,
    );
    expect(result.product).not.toBeNull();
    expect(result.product?.agencyId).toBe(5);
  });

  it('allows agent with permission to see inactive product', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(
      1,
      'en',
      true,
      { user: { role: 'agent' }, agentPermissions: { can_view_all_posts: true } } as any,
    );
    expect(result.product).not.toBeNull();
  });

  it('returns null if user is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      user: { ...baseProduct.user, status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true);
    expect(result).toEqual({ product: null });
  });

  it('returns null if agency is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      agency: { ...baseProduct.agency, status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true);
    expect(result).toEqual({ product: null });
  });

  it('returns product dto with total clicks for active product', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...baseProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([{ count: 2 }, { count: 3 }]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.product).not.toBeNull();
    expect(result.product?.totalClicks).toBe(5);
  });

  it('includes related data if subcategory and category exist', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...baseProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.relatedData).toEqual({ subcategoryId: 1, categoryId: 1 });
  });

  it('does not include related data if subcategory is null', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...baseProduct, status: 'active', subcategory: null });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.relatedData).toBeUndefined();
  });
});