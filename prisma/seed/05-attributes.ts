import { prisma } from './prismaClient';
import { LanguageCode } from '@prisma/client';

export async function seedAttributes() {
  const subs = await prisma.subcategory.findMany();
  const subMap: Record<string, number> = {};
  subs.forEach(s => subMap[s.slug] = s.id);

  const attributesData = [
    {
      subcategorySlug: 'apartment',
      attributes: [
        { code: 'rooms', inputType: 'select', translations: { en: 'Rooms', al: 'Dhoma', it: 'Camere' }, values: [{ en: '1', al: '1', it: '1' }, { en: '2', al: '2', it: '2' }, { en: '3', al: '3', it: '3' }, { en: '4+', al: '4+', it: '4+' }] },
        { code: 'has_balcony', inputType: 'boolean', translations: { en: 'Has Balcony', al: 'Ballkon', it: 'Balcone' } },
      ],
    },
    {
      subcategorySlug: 'office',
      attributes: [
        { code: 'floor_area', inputType: 'select', translations: { en: 'Floor Area (sqm)', al: 'Sipërfaqe (m²)', it: 'Superficie (m²)' }, values: [{ en: '50', al: '50', it: '50' }, { en: '100', al: '100', it: '100' }, { en: '150', al: '150', it: '150' }, { en: '200+', al: '200+', it: '200+' }] },
        { code: 'has_parking', inputType: 'boolean', translations: { en: 'Has Parking', al: 'Parking', it: 'Parcheggio' } },
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
          await prisma.attributeValue.create({
            data: {
              attributeId: attribute.id,
              valueCode: val.en,
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
        await prisma.attributeValue.create({ data: { attributeId: attribute.id, valueCode: 'true' } });
      }
    }
  }

  console.log('Attributes and values seeded!');
}