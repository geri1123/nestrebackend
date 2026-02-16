import { prisma } from './prismaClient';
import { LanguageCode } from '@prisma/client';

export async function seedListingTypes() {
  await prisma.listingType.createMany({
    data: [
      { slug: 'for-sale' },
      { slug: 'for-rent' },
      { slug: 'daily-rent' },
    ],
    skipDuplicates: true,
  });

 const forSale = await prisma.listingType.findFirst({ where: { slug: 'for-sale' } });
  const forRent = await prisma.listingType.findFirst({ where: { slug: 'for-rent' } });
  const dailyRent = await prisma.listingType.findFirst({ where: { slug: 'daily-rent' } });

  if (!forSale || !forRent || !dailyRent) throw new Error('Listing types not found');

  await prisma.listingTypeTranslation.createMany({
    data: [
      { listingTypeId: forSale.id, language: LanguageCode.en, name: 'For Sale', slug: 'for-sale' },
      { listingTypeId: forSale.id, language: LanguageCode.al, name: 'Shitet', slug: 'shitet' },
      { listingTypeId: forSale.id, language: LanguageCode.it, name: 'In Vendita', slug: 'in-vendita' },

      { listingTypeId: forRent.id, language: LanguageCode.en, name: 'For Rent', slug: 'for-rent' },
      { listingTypeId: forRent.id, language: LanguageCode.al, name: 'Me Qira', slug: 'me-qira' },
      { listingTypeId: forRent.id, language: LanguageCode.it, name: 'In Affitto', slug: 'in-affitto' },

      { listingTypeId: dailyRent.id, language: LanguageCode.en, name: 'Daily Rent', slug: 'daily-rent' },
      { listingTypeId: dailyRent.id, language: LanguageCode.al, name: 'Qira Ditore', slug: 'qira-ditore' },
      { listingTypeId: dailyRent.id, language: LanguageCode.it, name: 'Affitto Giornaliero', slug: 'affitto-giornaliero' },
    ],
    skipDuplicates: true,
  });

  console.log('Listing types and translations seeded!');
}