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

  const userProduct = {
    id: 1,
    title: 'Test Product',
    price: 100,
    status: 'draft',
    userId: 10,
    agencyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Test description',
    streetAddress: 'Test Street',
    buildYear: 2020,
    area: 100,
    subcategoryId: 1,
    productImage: [],
    productAttributeValue: [],
    advertisements: [],
    city: { name: 'Tirana' },
    subcategory: {
      id: 1,
      subcategoryTranslation: [{ name: 'Apartment' }],
      category: { id: 1, categoryTranslation: [{ name: 'Residential' }] },
    },
    listing_type: { listing_type_translation: [{ name: 'For Sale' }] },
    user: { username: 'testuser', role: 'user', status: 'active' },
    agency: null,
  };

  const agencyProduct = {
    ...userProduct,
    userId: 10,
    agencyId: 5,
    agency: { agencyName: 'Test Agency', status: 'active' },
  };

  // ── Basic ──────────────────────────────────────────────────────────

  it('returns null if product not found', async () => {
    repo.findByIdWithDetails.mockResolvedValue(null);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('returns null for draft product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue(userProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('returns null for pending product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'pending' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('returns null for sold product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'sold' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result).toEqual({ product: null });
  });

  it('returns active product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.product).not.toBeNull();
  });

  it('returns active agency product on public route', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.product).not.toBeNull();
  });

  // ── Individual user ownership ──────────────────────────────────────

  it('allows individual user to see their own draft (no agency)', async () => {
    repo.findByIdWithDetails.mockResolvedValue(userProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 10,
      user: { role: 'user' },
    } as any);
    expect(result.product).not.toBeNull();
    expect(result.product?.userId).toBe(10);
  });

  it('blocks individual user from seeing draft of another user', async () => {
    repo.findByIdWithDetails.mockResolvedValue(userProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      user: { role: 'user' },
    } as any);
    expect(result).toEqual({ product: null });
  });

  it('blocks individual user from seeing agency product draft even if userId matches', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 10,
      user: { role: 'user' },
    } as any);
    expect(result).toEqual({ product: null });
  });

  // ── Agency owner ───────────────────────────────────────────────────

  it('allows agency owner to see draft of their own agency', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agency_owner' },
    } as any);
    expect(result.product).not.toBeNull();
    expect(result.product?.agencyId).toBe(5);
  });

  it('blocks agency owner from seeing draft of a different agency', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 999,
      user: { role: 'agency_owner' },
    } as any);
    expect(result).toEqual({ product: null });
  });

  // ── Agent view permissions ─────────────────────────────────────────

  it('allows agent with can_view_all_posts to see draft of same agency', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: true, can_edit_others_post: false },
    } as any);
    expect(result.product).not.toBeNull();
  });

  it('blocks agent without can_view_all_posts from seeing draft of others', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: false, can_edit_others_post: false },
    } as any);
    expect(result).toEqual({ product: null });
  });

  it('allows agent to see active product of same agency without any permissions', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: false, can_edit_others_post: false },
    } as any);
    expect(result.product).not.toBeNull();
  });

  it('allows agent to see their own draft without any permissions', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, userId: 99 });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: false, can_edit_others_post: false },
    } as any);
    expect(result.product).not.toBeNull();
  });

  it('blocks agent from seeing draft of a different agency', async () => {
    repo.findByIdWithDetails.mockResolvedValue(agencyProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 999,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: true, can_edit_others_post: true },
    } as any);
    expect(result).toEqual({ product: null });
  });

  it('blocks agent from seeing draft of individual user product (no agencyId)', async () => {
    repo.findByIdWithDetails.mockResolvedValue(userProduct);
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_view_all_posts: true, can_edit_others_post: true },
    } as any);
    expect(result).toEqual({ product: null });
  });

  // ── Agent edit permissions ─────────────────────────────────────────

  it('allows agent with can_edit_others_post to see active product of same agency', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_edit_others_post: true, can_view_all_posts: false },
    } as any);
    expect(result.product).not.toBeNull();
  });

  it('blocks agent with only can_edit_others_post from seeing draft of others', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, status: 'draft' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_edit_others_post: true, can_view_all_posts: false },
    } as any);
    expect(result).toEqual({ product: null });
  });

  it('allows agent with both permissions to see and edit draft of others', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...agencyProduct, status: 'draft' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_edit_others_post: true, can_view_all_posts: true },
    } as any);
    expect(result.product).not.toBeNull();
  });

  it('blocks agent with can_edit_others_post from accessing individual user product', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true, {
      userId: 99,
      agencyId: 5,
      user: { role: 'agent' },
      agentPermissions: { can_edit_others_post: true, can_view_all_posts: true },
    } as any);
    expect(result).toEqual({ product: null });
  });

  // ── Suspended ──────────────────────────────────────────────────────

  it('returns null if user is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...userProduct,
      status: 'active',
      user: { ...userProduct.user, status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true);
    expect(result).toEqual({ product: null });
  });

  it('returns null if agency is suspended', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...agencyProduct,
      status: 'active',
      agency: { agencyName: 'Test Agency', status: 'suspended' },
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', true);
    expect(result).toEqual({ product: null });
  });

  // ── Clicks & related data ──────────────────────────────────────────

  it('returns active product with total clicks', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([{ count: 2 }, { count: 3 }]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.product).not.toBeNull();
    expect(result.product?.totalClicks).toBe(5);
  });

  it('includes related data if subcategory and category exist', async () => {
    repo.findByIdWithDetails.mockResolvedValue({ ...userProduct, status: 'active' });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.relatedData).toEqual({ subcategoryId: 1, categoryId: 1 });
  });

  it('does not include related data if subcategory is null', async () => {
    repo.findByIdWithDetails.mockResolvedValue({
      ...userProduct,
      status: 'active',
      subcategory: null,
    });
    clicksService.getClicksByProduct.mockResolvedValue([]);
    const result = await useCase.execute(1, 'en', false);
    expect(result.relatedData).toBeUndefined();
  });
});