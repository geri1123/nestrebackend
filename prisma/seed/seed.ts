import { prisma } from './prismaClient';
import { seedAdvertisementPricing } from './01-advertisement';
import { seedCategories } from './02-categories';
import { seedListingTypes } from './03-listingTypes';
import { seedSubcategories } from './04-subcategories';
import { seedAttributes } from './05-attributes';
import { seedCountryAndCities } from './06-country-cities';

async function main() {
  await seedAdvertisementPricing();
  await seedCategories();
  await seedListingTypes();
  await seedSubcategories();
  await seedAttributes();
  await seedCountryAndCities();
}

main()
  .catch(e => console.error(e))
  .finally(async () => prisma.$disconnect());
