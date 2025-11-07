// category.repository.spec.ts
import { CategoryRepository } from '../category/category.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LanguageCode, product_status } from '@prisma/client';

describe('CategoryRepository', () => {
  let repo: CategoryRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    repo = new CategoryRepository(prisma);
  });

  it('should return categories with subcategories and product counts', async () => {
    // Mock Prisma response
    const mockData = [
      {
        id: 1,
        categorytranslation: [{ name: 'Electronics', slug: 'electronics' }],
        subcategory: [
          {
            id: 10,
            categoryId: 1,
            subcategorytranslation: [{ name: 'Phones', slug: 'phones' }],
            _count: { product: 5 },
          },
          {
            id: 11,
            categoryId: 1,
            subcategorytranslation: [{ name: 'Laptops', slug: 'laptops' }],
            _count: { product: 3 },
          },
        ],
      },
    ];

    (prisma.category.findMany as jest.Mock).mockResolvedValue(mockData);

    const result = await repo.getAllCategories(LanguageCode.al, product_status.active);

    expect(result).toEqual([
      {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        productCount: 8,
        subcategories: [
          { id: 10, name: 'Phones', slug: 'phones', categoryId: 1, productCount: 5 },
          { id: 11, name: 'Laptops', slug: 'laptops', categoryId: 1, productCount: 3 },
        ],
      },
    ]);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      include: expect.any(Object),
    });
  });
});
