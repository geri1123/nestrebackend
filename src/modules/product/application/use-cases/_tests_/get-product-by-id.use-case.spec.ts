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
  });

  const baseProduct = {
    id: 1,
    title: 'Test',
    price: 100,
    status: 'draft',
    userId: 10,
    agencyId: 5,
    createdAt: new Date(),
    productimage: [],
    advertisements: [],
    city: { name: 'Tirana' },
    subcategory: null,
    listing_type: null,
    user: { status: 'active' },
    agency: { status: 'active' },
  };

  it('should return null if product not found', async () => {
    repo.findByIdWithDetails.mockResolvedValue(null);

    const result = await useCase.execute(1, 'en', false);

    expect(result).toBeNull();
  });

  it('should return null for inactive product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(baseProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', false);

    expect(result).toBeNull();
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

    expect(result).not.toBeNull();
  });

  it('should return null if user or agency is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
      user: { status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);

    const result = await useCase.execute(1, 'en', true);

    expect(result).toBeNull();
  });

  it('should return product dto for active product', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...baseProduct,
      status: 'active',
    });

    clicksService.getClicksByProduct.mockResolvedValue([
      { count: 2 },
      { count: 3 },
    ]);

    const result = await useCase.execute(1, 'en', false);

    expect(result?.totalClicks).toBe(5);
    expect(result?.id).toBe(1);
  });
});