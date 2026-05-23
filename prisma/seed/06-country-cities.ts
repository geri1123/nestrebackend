// import { prisma } from './prismaClient';

// export async function seedCountryAndCities() {
//   const albania = await prisma.country.upsert({
//     where: { code: 'AL' },
//     update: {},
//     create: { name: 'Albania', code: 'AL' },
//   });

//   console.log('Country seeded:', albania.name);

//   const citiesData = [
//     { name: 'Tirana', countryId: albania.id },
//     { name: 'Durres', countryId: albania.id },
//     { name: 'Shkodra', countryId: albania.id },
//     { name: 'Vlore', countryId: albania.id },
//     { name: 'Berat', countryId: albania.id },
//   ];

//   await prisma.city.createMany({ data: citiesData, skipDuplicates: true });
//   console.log('Cities seeded!');
// }

import { prisma } from './prismaClient';

export async function seedCountryAndCities() {
  const albania = await prisma.country.upsert({
    where: { code: 'AL' },
    update: {},
    create: { name: 'Albania', code: 'AL' },
  });

  console.log('✅ Country seeded:', albania.name);

  const citiesData = [
    // Qytetet kryesore (qarqe)
    { name: 'Tirana', countryId: albania.id },
    { name: 'Durrës', countryId: albania.id },
    { name: 'Vlorë', countryId: albania.id },
    { name: 'Shkodër', countryId: albania.id },
    { name: 'Elbasan', countryId: albania.id },
    { name: 'Korçë', countryId: albania.id },
    { name: 'Fier', countryId: albania.id },
    { name: 'Berat', countryId: albania.id },
    { name: 'Lushnjë', countryId: albania.id },
    { name: 'Pogradec', countryId: albania.id },
    { name: 'Sarandë', countryId: albania.id },
    { name: 'Gjirokastër', countryId: albania.id },
    { name: 'Lezhë', countryId: albania.id },
    { name: 'Kavajë', countryId: albania.id },
    { name: 'Krujë', countryId: albania.id },
    { name: 'Kuçovë', countryId: albania.id },
    { name: 'Kukës', countryId: albania.id },
    { name: 'Peshkopi', countryId: albania.id },
    { name: 'Burrel', countryId: albania.id },
    { name: 'Tepelenë', countryId: albania.id },
    { name: 'Përmet', countryId: albania.id },
    { name: 'Tropojë', countryId: albania.id },
    { name: 'Has', countryId: albania.id },
    { name: 'Librazhd', countryId: albania.id },
    { name: 'Mat', countryId: albania.id },
  ];

  await prisma.city.createMany({ data: citiesData, skipDuplicates: true });
  console.log(`✅ Cities seeded! (${citiesData.length} qytete)`);
}