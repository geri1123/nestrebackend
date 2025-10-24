import { AttributeRepo } from '../attributes/attributes.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { LanguageCode } from '@prisma/client';

describe('AttributeRepo', () => {
  let repo: AttributeRepo;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      attribute: {
        findMany: jest.fn(),
      },
    };

    repo = new AttributeRepo(prisma);
  });

  describe('getValidAttributeIdsBySubcategory', () => {
    it('should return an array of ids', async () => {
      const mockAttributes = [{ id: 1 }, { id: 2 }];
      (prisma.attribute.findMany as jest.Mock).mockResolvedValue(mockAttributes);

      const result = await repo.getValidAttributeIdsBySubcategory(5);
      expect(prisma.attribute.findMany).toHaveBeenCalledWith({
        where: { subcategoryId: 5 },
        select: { id: true },
      });
      expect(result).toEqual([1, 2]);
    });

    it('should return empty array if no attributes found', async () => {
      (prisma.attribute.findMany as jest.Mock).mockResolvedValue([]);
      const result = await repo.getValidAttributeIdsBySubcategory(10);
      expect(result).toEqual([]);
    });
  });

  describe('getAttributesBySubcategoryId', () => {
    it('should map attributes and translations correctly', async () => {
      const mockAttributes = [
        {
          id: 1,
          inputType: 'text',
          attributeTranslation: [{ name: 'Name1', slug: 'slug1' }],
          values: [
            { id: 100, attributeValueTranslations: [{ name: 'Value1', slug: 'vslug1' }] },
          ],
        },
      ];

      (prisma.attribute.findMany as jest.Mock).mockResolvedValue(mockAttributes);

      const result = await repo.getAttributesBySubcategoryId(5, LanguageCode.en);

      expect(prisma.attribute.findMany).toHaveBeenCalledWith({
        where: { subcategoryId: 5 },
        include: {
          attributeTranslation: {
            where: { language: LanguageCode.en },
            select: { name: true, slug: true },
          },
          values: {
            include: {
              attributeValueTranslations: {
                where: { language: LanguageCode.en },
                select: { name: true, slug: true },
              },
            },
          },
        },
      });

      expect(result).toEqual([
        {
          id: 1,
          inputType: 'text',
          name: 'Name1',
          slug: 'slug1',
          values: [
            { id: 100, name: 'Value1', slug: 'vslug1' },
          ],
        },
      ]);
    });

    it('should handle missing translations', async () => {
      const mockAttributes = [
        { id: 2, inputType: 'text', attributeTranslation: [], values: [] },
      ];
      (prisma.attribute.findMany as jest.Mock).mockResolvedValue(mockAttributes);

      const result = await repo.getAttributesBySubcategoryId(5, LanguageCode.al);
      expect(result[0].name).toBe('No translation');
      expect(result[0].slug).toBeNull();
      expect(result[0].values).toEqual([]);
    });
  });
});