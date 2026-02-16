import { AdvertisementType } from '@prisma/client';
import { prisma } from './prismaClient';

export async function seedAdvertisementPricing() {
  await prisma.advertisementPricing.createMany({
    data: [
      { adType: AdvertisementType.cheap, price: 4.99, duration: 1, discount: 0, isActive: true },
      { adType: AdvertisementType.normal, price: 8.99, duration: 14, discount: 2, isActive: true },
      { adType: AdvertisementType.premium, price: 13.99, duration: 30, discount: 5, isActive: true },
    ],
    skipDuplicates: true,
  });
  console.log('Advertisement pricing seeded!');
}