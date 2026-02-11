import { PrismaClient, LanguageCode, advertisement_type } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ===============================
  // 1️⃣ Advertisement Pricing
  // ===============================
  await prisma.advertisementPricing.createMany({
    data: [
      { adType: advertisement_type.cheap, price: 4.99, duration: 1, discount: 0, isActive: true },
      { adType: advertisement_type.normal, price: 8.99, duration: 14, discount: 2, isActive: true },
      { adType: advertisement_type.premium, price: 13.99, duration: 30, discount: 5, isActive: true },
    ],
    skipDuplicates: true,
  });
  console.log('Advertisement pricing seeded!');

  // ===============================
  // 2️⃣ Categories
  // ===============================
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

  await prisma.categorytranslation.createMany({
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
  console.log('Category translations seeded!');

  // ===============================
  // 3️⃣ Listing Types
  // ===============================
  await prisma.listing_type.createMany({
    data: [
      { slug: 'for-sale' },
      { slug: 'for-rent' },
      { slug: 'daily-rent' },
    ],
    skipDuplicates: true,
  });

  const forSale = await prisma.listing_type.findFirst({ where: { slug: 'for-sale' } });
  const forRent = await prisma.listing_type.findFirst({ where: { slug: 'for-rent' } });
  const dailyRent = await prisma.listing_type.findFirst({ where: { slug: 'daily-rent' } });
  if (!forSale || !forRent || !dailyRent) throw new Error('Listing types not found');

  await prisma.listing_type_translation.createMany({
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
  console.log('Listing type translations seeded!');

  // ===============================
  // 4️⃣ Subcategories
  // ===============================
  const subcategories = [
    // Residential
    { categoryId: residential.id, slug: 'apartment' },
    { categoryId: residential.id, slug: 'villa' },
    { categoryId: residential.id, slug: 'house' },
    // Commercial
    { categoryId: commercial.id, slug: 'office' },
    { categoryId: commercial.id, slug: 'warehouse' },
    { categoryId: commercial.id, slug: 'shop' },
    // Land
    { categoryId: land.id, slug: 'farm' },
    { categoryId: land.id, slug: 'plot' },
    { categoryId: land.id, slug: 'vineyard' },
  ];

  await prisma.subcategory.createMany({ data: subcategories, skipDuplicates: true });

  const subs = await prisma.subcategory.findMany();
  const subMap: Record<string, number> = {};
  subs.forEach((s) => (subMap[s.slug] = s.id));

  const subTranslations = [
    // Residential
    { subcategoryId: subMap['apartment'], language: LanguageCode.en, name: 'Apartment', slug: 'apartment' },
    { subcategoryId: subMap['apartment'], language: LanguageCode.al, name: 'Apartament', slug: 'apartament' },
    { subcategoryId: subMap['apartment'], language: LanguageCode.it, name: 'Appartamento', slug: 'appartamento' },
    { subcategoryId: subMap['villa'], language: LanguageCode.en, name: 'Villa', slug: 'villa' },
    { subcategoryId: subMap['villa'], language: LanguageCode.al, name: 'Vilë', slug: 'vile' },
    { subcategoryId: subMap['villa'], language: LanguageCode.it, name: 'Villa', slug: 'villa' },
    { subcategoryId: subMap['house'], language: LanguageCode.en, name: 'House', slug: 'house' },
    { subcategoryId: subMap['house'], language: LanguageCode.al, name: 'Shtëpi', slug: 'shtepi' },
    { subcategoryId: subMap['house'], language: LanguageCode.it, name: 'Casa', slug: 'casa' },
    // Commercial
    { subcategoryId: subMap['office'], language: LanguageCode.en, name: 'Office', slug: 'office' },
    { subcategoryId: subMap['office'], language: LanguageCode.al, name: 'Zyrë', slug: 'zyre' },
    { subcategoryId: subMap['office'], language: LanguageCode.it, name: 'Ufficio', slug: 'ufficio' },
    { subcategoryId: subMap['warehouse'], language: LanguageCode.en, name: 'Warehouse', slug: 'warehouse' },
    { subcategoryId: subMap['warehouse'], language: LanguageCode.al, name: 'Magazin', slug: 'magazin' },
    { subcategoryId: subMap['warehouse'], language: LanguageCode.it, name: 'Magazzino', slug: 'magazzino' },
    { subcategoryId: subMap['shop'], language: LanguageCode.en, name: 'Shop', slug: 'shop' },
    { subcategoryId: subMap['shop'], language: LanguageCode.al, name: 'Dyqan', slug: 'dyqan' },
    { subcategoryId: subMap['shop'], language: LanguageCode.it, name: 'Negozio', slug: 'negozio' },
    // Land
    { subcategoryId: subMap['farm'], language: LanguageCode.en, name: 'Farm', slug: 'farm' },
    { subcategoryId: subMap['farm'], language: LanguageCode.al, name: 'Fermë', slug: 'ferme' },
    { subcategoryId: subMap['farm'], language: LanguageCode.it, name: 'Fattoria', slug: 'fattoria' },
    { subcategoryId: subMap['plot'], language: LanguageCode.en, name: 'Plot', slug: 'plot' },
    { subcategoryId: subMap['plot'], language: LanguageCode.al, name: 'Tokë', slug: 'toke' },
    { subcategoryId: subMap['plot'], language: LanguageCode.it, name: 'Terreno', slug: 'terreno' },
    { subcategoryId: subMap['vineyard'], language: LanguageCode.en, name: 'Vineyard', slug: 'vineyard' },
    { subcategoryId: subMap['vineyard'], language: LanguageCode.al, name: 'Vresht', slug: 'vresht' },
    { subcategoryId: subMap['vineyard'], language: LanguageCode.it, name: 'Vigneto', slug: 'vigneto' },
  ];

  await prisma.subcategorytranslation.createMany({ data: subTranslations, skipDuplicates: true });
  console.log('Subcategory translations seeded!');

  // ===============================
  // 7️⃣ Attributes and Attribute Values with translations
  // ===============================
  const attributesData = [
    {
      subcategorySlug: 'apartment',
      attributes: [
        {
          code: 'rooms',
          inputType: 'select',
          translations: { en: 'Rooms', al: 'Dhoma', it: 'Camere' },
          values: [
            { en: '1', al: '1', it: '1' },
            { en: '2', al: '2', it: '2' },
            { en: '3', al: '3', it: '3' },
            { en: '4+', al: '4+', it: '4+' },
          ],
        },
        {
          code: 'has_balcony',
          inputType: 'boolean',
          translations: { en: 'Has Balcony', al: 'Ballkon', it: 'Balcone' },
        },
      ],
    },
    {
      subcategorySlug: 'office',
      attributes: [
        {
          code: 'floor_area',
          inputType: 'select',
          translations: { en: 'Floor Area (sqm)', al: 'Sipërfaqe (m²)', it: 'Superficie (m²)' },
          values: [
            { en: '50', al: '50', it: '50' },
            { en: '100', al: '100', it: '100' },
            { en: '150', al: '150', it: '150' },
            { en: '200+', al: '200+', it: '200+' },
          ],
        },
        {
          code: 'has_parking',
          inputType: 'boolean',
          translations: { en: 'Has Parking', al: 'Parking', it: 'Parcheggio' },
        },
      ],
    },
  ];

  for (const sub of attributesData) {
    const subId = subMap[sub.subcategorySlug];
    if (!subId) continue;

    for (const attr of sub.attributes) {
      const attribute = await prisma.attribute.create({
        data: {
          subcategoryId: subId,
          code: attr.code,
          inputType: attr.inputType,
          attributeTranslation: {
            create: [
              { language: LanguageCode.en, name: attr.translations.en, slug: attr.code },
              { language: LanguageCode.al, name: attr.translations.al, slug: attr.code },
              { language: LanguageCode.it, name: attr.translations.it, slug: attr.code },
            ],
          },
        },
      });

     if (attr.inputType === 'select' && attr.values) {
  for (const val of attr.values) {
    await prisma.attribute_value.create({
      data: {
        attribute_id: attribute.id,
        value_code: val.en,
        attributeValueTranslations: {
          create: [
            { language: LanguageCode.en, name: val.en, slug: val.en },
            { language: LanguageCode.al, name: val.al, slug: val.al },
            { language: LanguageCode.it, name: val.it, slug: val.it },
          ],
        },
      },
    });
  }
} else if (attr.inputType === 'boolean') {
  await prisma.attribute_value.create({
    data: { attribute_id: attribute.id, value_code: 'true' },
  });
}
    }
  }

  console.log('Attributes and attribute values with translations seeded!');


   const albania = await prisma.country.upsert({
    where: { code: 'AL' },
    update: {},
    create: { name: 'Albania', code: 'AL' },
  });

  console.log('Country seeded:', albania.name);

  // ===============================
  // Cities in Albania
  // ===============================
  const citiesData = [
    { name: 'Tirana', countryId: albania.id },
    { name: 'Durres', countryId: albania.id },
    { name: 'Shkodra', countryId: albania.id },
    { name: 'Vlore', countryId: albania.id },
    { name: 'Berat', countryId: albania.id },
  ];

  await prisma.city.createMany({
    data: citiesData,
    skipDuplicates: true,
  });

  console.log('Cities in Albania seeded!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());