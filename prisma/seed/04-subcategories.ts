// import { prisma } from './prismaClient';
// import { LanguageCode } from '@prisma/client';

// export async function seedSubcategories() {
//   const categories = await prisma.category.findMany();
//   const categoryMap: Record<string, number> = {};
//   categories.forEach(c => categoryMap[c.slug] = c.id);

//   const subcategories = [
//     { categoryId: categoryMap['residential'], slug: 'apartment' },
//     { categoryId: categoryMap['residential'], slug: 'villa' },
//     { categoryId: categoryMap['residential'], slug: 'house' },
//     { categoryId: categoryMap['commercial'], slug: 'office' },
//     { categoryId: categoryMap['commercial'], slug: 'warehouse' },
//     { categoryId: categoryMap['commercial'], slug: 'shop' },
//     { categoryId: categoryMap['land'], slug: 'farm' },
//     { categoryId: categoryMap['land'], slug: 'plot' },
//     { categoryId: categoryMap['land'], slug: 'vineyard' },
//   ];

//   await prisma.subcategory.createMany({ data: subcategories, skipDuplicates: true });

//   const subs = await prisma.subcategory.findMany();
//   const subMap: Record<string, number> = {};
//   subs.forEach(s => subMap[s.slug] = s.id);

//   const subTranslations = [
//     { subcategoryId: subMap['apartment'], language: LanguageCode.en, name: 'Apartment', slug: 'apartment' },
//     { subcategoryId: subMap['apartment'], language: LanguageCode.al, name: 'Apartament', slug: 'apartament' },
//     { subcategoryId: subMap['apartment'], language: LanguageCode.it, name: 'Appartamento', slug: 'appartamento' },
//     { subcategoryId: subMap['villa'], language: LanguageCode.en, name: 'Villa', slug: 'villa' },
//     { subcategoryId: subMap['villa'], language: LanguageCode.al, name: 'Vilë', slug: 'vile' },
//     { subcategoryId: subMap['villa'], language: LanguageCode.it, name: 'Villa', slug: 'villa' },
//     { subcategoryId: subMap['house'], language: LanguageCode.en, name: 'House', slug: 'house' },
//     { subcategoryId: subMap['house'], language: LanguageCode.al, name: 'Shtëpi', slug: 'shtepi' },
//     { subcategoryId: subMap['house'], language: LanguageCode.it, name: 'Casa', slug: 'casa' },
//     { subcategoryId: subMap['office'], language: LanguageCode.en, name: 'Office', slug: 'office' },
//     { subcategoryId: subMap['office'], language: LanguageCode.al, name: 'Zyrë', slug: 'zyre' },
//     { subcategoryId: subMap['office'], language: LanguageCode.it, name: 'Ufficio', slug: 'ufficio' },
//     { subcategoryId: subMap['warehouse'], language: LanguageCode.en, name: 'Warehouse', slug: 'warehouse' },
//     { subcategoryId: subMap['warehouse'], language: LanguageCode.al, name: 'Magazin', slug: 'magazin' },
//     { subcategoryId: subMap['warehouse'], language: LanguageCode.it, name: 'Magazzino', slug: 'magazzino' },
//     { subcategoryId: subMap['shop'], language: LanguageCode.en, name: 'Shop', slug: 'shop' },
//     { subcategoryId: subMap['shop'], language: LanguageCode.al, name: 'Dyqan', slug: 'dyqan' },
//     { subcategoryId: subMap['shop'], language: LanguageCode.it, name: 'Negozio', slug: 'negozio' },
//     { subcategoryId: subMap['farm'], language: LanguageCode.en, name: 'Farm', slug: 'farm' },
//     { subcategoryId: subMap['farm'], language: LanguageCode.al, name: 'Fermë', slug: 'ferme' },
//     { subcategoryId: subMap['farm'], language: LanguageCode.it, name: 'Fattoria', slug: 'fattoria' },
//     { subcategoryId: subMap['plot'], language: LanguageCode.en, name: 'Plot', slug: 'plot' },
//     { subcategoryId: subMap['plot'], language: LanguageCode.al, name: 'Tokë', slug: 'toke' },
//     { subcategoryId: subMap['plot'], language: LanguageCode.it, name: 'Terreno', slug: 'terreno' },
//     { subcategoryId: subMap['vineyard'], language: LanguageCode.en, name: 'Vineyard', slug: 'vineyard' },
//     { subcategoryId: subMap['vineyard'], language: LanguageCode.al, name: 'Vresht', slug: 'vresht' },
//     { subcategoryId: subMap['vineyard'], language: LanguageCode.it, name: 'Vigneto', slug: 'vigneto' },
//   ];

//   await prisma.subcategoryTranslation.createMany({ data: subTranslations, skipDuplicates: true });
//   console.log('Subcategories and translations seeded!');
// }

import { prisma } from './prismaClient';
import { LanguageCode } from '@prisma/client';

export async function seedSubcategories() {
  const categories = await prisma.category.findMany();
  const categoryMap: Record<string, number> = {};
  categories.forEach((c) => (categoryMap[c.slug] = c.id));

  const subcategories = [
    // Residential
    { categoryId: categoryMap['residential'], slug: 'apartment' },
    { categoryId: categoryMap['residential'], slug: 'villa' },
    { categoryId: categoryMap['residential'], slug: 'house' },
    { categoryId: categoryMap['residential'], slug: 'studio' },
    { categoryId: categoryMap['residential'], slug: 'penthouse' },
    { categoryId: categoryMap['residential'], slug: 'duplex' },
    // Commercial
    { categoryId: categoryMap['commercial'], slug: 'office' },
    { categoryId: categoryMap['commercial'], slug: 'warehouse' },
    { categoryId: categoryMap['commercial'], slug: 'shop' },
    { categoryId: categoryMap['commercial'], slug: 'restaurant' },
    { categoryId: categoryMap['commercial'], slug: 'hotel' },
    { categoryId: categoryMap['commercial'], slug: 'business_center' },
    // Land
    { categoryId: categoryMap['land'], slug: 'farm' },
    { categoryId: categoryMap['land'], slug: 'plot' },
    { categoryId: categoryMap['land'], slug: 'vineyard' },
    { categoryId: categoryMap['land'], slug: 'forest' },
    { categoryId: categoryMap['land'], slug: 'urban_plot' },
  ];

  await prisma.subcategory.createMany({ data: subcategories, skipDuplicates: true });

  const subs = await prisma.subcategory.findMany();
  const subMap: Record<string, number> = {};
  subs.forEach((s) => (subMap[s.slug] = s.id));

  const T = (slug: string, en: string, al: string, it: string) => [
    { subcategoryId: subMap[slug], language: LanguageCode.en, name: en, slug: slug.replace(/_/g, '-') },
    { subcategoryId: subMap[slug], language: LanguageCode.al, name: al, slug: al.toLowerCase().replace(/ë/g, 'e').replace(/ç/g, 'c').replace(/\s+/g, '-') },
    { subcategoryId: subMap[slug], language: LanguageCode.it, name: it, slug: it.toLowerCase().replace(/\s+/g, '-') },
  ];

  const subTranslations = [
    // Residential
    ...T('apartment', 'Apartment', 'Apartament', 'Appartamento'),
    ...T('villa', 'Villa', 'Vilë', 'Villa'),
    ...T('house', 'House', 'Shtëpi', 'Casa'),
    ...T('studio', 'Studio', 'Studio', 'Monolocale'),
    ...T('penthouse', 'Penthouse', 'Penthouse', 'Attico'),
    ...T('duplex', 'Duplex', 'Dyfishe', 'Bilocale'),
    // Commercial
    ...T('office', 'Office', 'Zyrë', 'Ufficio'),
    ...T('warehouse', 'Warehouse', 'Magazin', 'Magazzino'),
    ...T('shop', 'Shop', 'Dyqan', 'Negozio'),
    ...T('restaurant', 'Restaurant', 'Restorant', 'Ristorante'),
    ...T('hotel', 'Hotel', 'Hotel', 'Hotel'),
    ...T('business_center', 'Business Center', 'Qendër Biznesi', 'Centro Affari'),
    // Land
    ...T('farm', 'Farm', 'Fermë', 'Fattoria'),
    ...T('plot', 'Plot', 'Parcelë', 'Terreno'),
    ...T('vineyard', 'Vineyard', 'Vresht', 'Vigneto'),
    ...T('forest', 'Forest', 'Pyll', 'Bosco'),
    ...T('urban_plot', 'Urban Plot', 'Truall Urban', 'Terreno Urbano'),
  ];

  await prisma.subcategoryTranslation.createMany({
    data: subTranslations,
    skipDuplicates: true,
  });
  console.log('✅ Subcategories and translations seeded!');
}