import { prisma } from './prismaClient';
import { LanguageCode } from '@prisma/client';

export async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { slug: 'residential' },
      { slug: 'commercial' },
      { slug: 'land' },
    ],
    skipDuplicates: true,
  });

  const residential = await prisma.category.findUnique({ where: { slug: 'residential' } });
  const commercial = await prisma.category.findUnique({ where: { slug: 'commercial' } });
  const land = await prisma.category.findUnique({ where: { slug: 'land' } });
  if (!residential || !commercial || !land) throw new Error('Categories not found');

  await prisma.categoryTranslation.createMany({
    data: [
      { categoryId: residential.id, language: LanguageCode.en, name: 'Residential', slug: 'residential' },
      { categoryId: residential.id, language: LanguageCode.al, name: 'Banesa', slug: 'banesa' },
      { categoryId: residential.id, language: LanguageCode.it, name: 'Residenziale', slug: 'residenziale' },
      { categoryId: commercial.id, language: LanguageCode.en, name: 'Commercial', slug: 'commercial' },
      { categoryId: commercial.id, language: LanguageCode.al, name: 'Tregtare', slug: 'tregtare' },
      { categoryId: commercial.id, language: LanguageCode.it, name: 'Commerciale', slug: 'commerciale' },
      { categoryId: land.id, language: LanguageCode.en, name: 'Land', slug: 'land' },
      { categoryId: land.id, language: LanguageCode.al, name: 'Tokë', slug: 'toke' },
      { categoryId: land.id, language: LanguageCode.it, name: 'Terreno', slug: 'terreno' },
    ],
    skipDuplicates: true,
  });

  console.log('Categories and translations seeded!');
}