import { prisma } from './prismaClient';

export async function seedCountryAndCities() {
  const albania = await prisma.country.upsert({
    where: { code: 'AL' },
    update: {},
    create: { name: 'Albania', code: 'AL' },
  });

  console.log('Country seeded:', albania.name);

  const citiesData = [
    { name: 'Tirana', countryId: albania.id },
    { name: 'Durres', countryId: albania.id },
    { name: 'Shkodra', countryId: albania.id },
    { name: 'Vlore', countryId: albania.id },
    { name: 'Berat', countryId: albania.id },
  ];

  await prisma.city.createMany({ data: citiesData, skipDuplicates: true });
  console.log('Cities seeded!');
}