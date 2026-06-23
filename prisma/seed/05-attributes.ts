

import { prisma } from './prismaClient';
import { LanguageCode } from '@prisma/client';

interface AttributeValue {
  code: string;
  en: string;
  al: string;
  it: string;
}

interface AttributeDef {
  code: string;
  inputType: 'select' | 'boolean';
  translations: { en: string; al: string; it: string };
  values?: AttributeValue[];
}

export async function seedAttributes() {
  // Idempotence — nëse ka tashmë attributes, kapërcej (rerun-safe)
  const existing = await prisma.attribute.findFirst();
  if (existing) {
    console.log('⏭️  Attributes already seeded, skipping.');
    return;
  }

  const subs = await prisma.subcategory.findMany();
  const subMap: Record<string, number> = {};
  subs.forEach((s) => (subMap[s.slug] = s.id));

  // Vlera të zakonshme të riutilizueshme
  const ROOMS: AttributeValue[] = [
    { code: '1', en: '1', al: '1', it: '1' },
    { code: '2', en: '2', al: '2', it: '2' },
    { code: '3', en: '3', al: '3', it: '3' },
    { code: '4', en: '4', al: '4', it: '4' },
    { code: '5_plus', en: '5+', al: '5+', it: '5+' },
  ];
  const BATHROOMS: AttributeValue[] = [
    { code: '1', en: '1', al: '1', it: '1' },
    { code: '2', en: '2', al: '2', it: '2' },
    { code: '3_plus', en: '3+', al: '3+', it: '3+' },
  ];
  const FLOOR_AREA: AttributeValue[] = [
    { code: 'lt_50', en: '< 50 m²', al: '< 50 m²', it: '< 50 m²' },
    { code: '50_80', en: '50-80 m²', al: '50-80 m²', it: '50-80 m²' },
    { code: '80_120', en: '80-120 m²', al: '80-120 m²', it: '80-120 m²' },
    { code: '120_180', en: '120-180 m²', al: '120-180 m²', it: '120-180 m²' },
    { code: 'gt_180', en: '180+ m²', al: '180+ m²', it: '180+ m²' },
  ];
  const LAND_AREA: AttributeValue[] = [
    { code: 'lt_500', en: '< 500 m²', al: '< 500 m²', it: '< 500 m²' },
    { code: '500_1000', en: '500-1000 m²', al: '500-1000 m²', it: '500-1000 m²' },
    { code: '1000_5000', en: '1000-5000 m²', al: '1000-5000 m²', it: '1000-5000 m²' },
    { code: 'gt_5000', en: '5000+ m²', al: '5000+ m²', it: '5000+ m²' },
  ];
  const YEAR_BUILT: AttributeValue[] = [
    { code: 'before_1990', en: 'Before 1990', al: 'Para 1990', it: 'Prima del 1990' },
    { code: '1990_2010', en: '1990-2010', al: '1990-2010', it: '1990-2010' },
    { code: '2010_2020', en: '2010-2020', al: '2010-2020', it: '2010-2020' },
    { code: 'after_2020', en: 'After 2020', al: 'Pas 2020', it: 'Dopo il 2020' },
  ];
  const VIEW: AttributeValue[] = [
    { code: 'sea', en: 'Sea', al: 'Det', it: 'Mare' },
    { code: 'mountain', en: 'Mountain', al: 'Mal', it: 'Montagna' },
    { code: 'city', en: 'City', al: 'Qytet', it: 'Città' },
    { code: 'none', en: 'No view', al: 'Pa pamje', it: 'Nessuna' },
  ];
  const CONDITION: AttributeValue[] = [
    { code: 'new', en: 'New', al: 'I ri', it: 'Nuovo' },
    { code: 'renovated', en: 'Renovated', al: 'I rinovuar', it: 'Ristrutturato' },
    { code: 'good', en: 'Good', al: 'Mirë', it: 'Buono' },
    { code: 'needs_work', en: 'Needs renovation', al: 'Për rinovim', it: 'Da ristrutturare' },
  ];
  const ZONING: AttributeValue[] = [
    { code: 'residential', en: 'Residential', al: 'Banimi', it: 'Residenziale' },
    { code: 'commercial', en: 'Commercial', al: 'Tregtar', it: 'Commerciale' },
    { code: 'mixed', en: 'Mixed use', al: 'I përzier', it: 'Misto' },
    { code: 'agricultural', en: 'Agricultural', al: 'Bujqësor', it: 'Agricolo' },
  ];

  // Helpers për të krijuar atribute boolean dhe select
  const bool = (code: string, en: string, al: string, it: string): AttributeDef => ({
    code,
    inputType: 'boolean',
    translations: { en, al, it },
  });
  const sel = (code: string, en: string, al: string, it: string, values: AttributeValue[]): AttributeDef => ({
    code,
    inputType: 'select',
    translations: { en, al, it },
    values,
  });

  const attributesData: Array<{ subcategorySlug: string; attributes: AttributeDef[] }> = [
    // ─── RESIDENTIAL ───────────────────────────────────────────────────────
    {
      subcategorySlug: 'apartment',
      attributes: [
        sel('rooms', 'Rooms', 'Dhoma', 'Camere', ROOMS),
        sel('bathrooms', 'Bathrooms', 'Banjo', 'Bagni', BATHROOMS),
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('year_built', 'Year Built', 'Viti i ndërtimit', 'Anno costruzione', YEAR_BUILT),
        sel('view', 'View', 'Pamja', 'Vista', VIEW),
        bool('furnished', 'Furnished', 'I mobiluar', 'Arredato'),
        bool('has_balcony', 'Has Balcony', 'Ballkon', 'Balcone'),
        bool('has_elevator', 'Has Elevator', 'Ashensor', 'Ascensore'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'villa',
      attributes: [
        sel('rooms', 'Rooms', 'Dhoma', 'Camere', ROOMS),
        sel('bathrooms', 'Bathrooms', 'Banjo', 'Bagni', BATHROOMS),
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('land_area', 'Land Area', 'Sipërfaqe trualli', 'Terreno', LAND_AREA),
        sel('condition', 'Condition', 'Gjendja', 'Stato', CONDITION),
        bool('has_pool', 'Pool', 'Pishinë', 'Piscina'),
        bool('has_garden', 'Garden', 'Kopsht', 'Giardino'),
        bool('has_garage', 'Garage', 'Garazh', 'Garage'),
      ],
    },
    {
      subcategorySlug: 'house',
      attributes: [
        sel('rooms', 'Rooms', 'Dhoma', 'Camere', ROOMS),
        sel('bathrooms', 'Bathrooms', 'Banjo', 'Bagni', BATHROOMS),
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('year_built', 'Year Built', 'Viti i ndërtimit', 'Anno costruzione', YEAR_BUILT),
        sel('condition', 'Condition', 'Gjendja', 'Stato', CONDITION),
        bool('has_garden', 'Garden', 'Kopsht', 'Giardino'),
        bool('has_garage', 'Garage', 'Garazh', 'Garage'),
      ],
    },
    {
      subcategorySlug: 'studio',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('view', 'View', 'Pamja', 'Vista', VIEW),
        bool('furnished', 'Furnished', 'I mobiluar', 'Arredato'),
        bool('has_balcony', 'Balcony', 'Ballkon', 'Balcone'),
        bool('has_elevator', 'Elevator', 'Ashensor', 'Ascensore'),
      ],
    },
    {
      subcategorySlug: 'penthouse',
      attributes: [
        sel('rooms', 'Rooms', 'Dhoma', 'Camere', ROOMS),
        sel('bathrooms', 'Bathrooms', 'Banjo', 'Bagni', BATHROOMS),
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('view', 'View', 'Pamja', 'Vista', VIEW),
        bool('has_terrace', 'Terrace', 'Tarracë', 'Terrazza'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'duplex',
      attributes: [
        sel('rooms', 'Rooms', 'Dhoma', 'Camere', ROOMS),
        sel('bathrooms', 'Bathrooms', 'Banjo', 'Bagni', BATHROOMS),
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('furnished', 'Furnished', 'I mobiluar', 'Arredato'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },

    // ─── COMMERCIAL ────────────────────────────────────────────────────────
    {
      subcategorySlug: 'office',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        sel('condition', 'Condition', 'Gjendja', 'Stato', CONDITION),
        bool('furnished', 'Furnished', 'I mobiluar', 'Arredato'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
        bool('has_meeting_room', 'Meeting Room', 'Dhomë takimi', 'Sala riunioni'),
      ],
    },
    {
      subcategorySlug: 'warehouse',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('has_loading_dock', 'Loading Dock', 'Vend ngarkimi', 'Banchina di carico'),
        bool('has_office_space', 'Office Space', 'Hapësirë zyre', 'Spazio ufficio'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'shop',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('has_storefront', 'Storefront', 'Vitrinë', 'Vetrina'),
        bool('has_storage_room', 'Storage Room', 'Magazin', 'Magazzino'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'restaurant',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('has_kitchen', 'Kitchen', 'Kuzhinë', 'Cucina'),
        bool('has_terrace', 'Terrace', 'Tarracë', 'Terrazza'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'hotel',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('has_restaurant', 'Restaurant', 'Restorant', 'Ristorante'),
        bool('has_pool', 'Pool', 'Pishinë', 'Piscina'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
      ],
    },
    {
      subcategorySlug: 'business_center',
      attributes: [
        sel('floor_area', 'Floor Area', 'Sipërfaqe', 'Superficie', FLOOR_AREA),
        bool('has_meeting_room', 'Meeting Rooms', 'Dhoma takimi', 'Sale riunioni'),
        bool('has_parking', 'Parking', 'Parking', 'Parcheggio'),
        bool('has_reception', 'Reception', 'Recepsion', 'Reception'),
      ],
    },

    // ─── LAND ──────────────────────────────────────────────────────────────
    {
      subcategorySlug: 'farm',
      attributes: [
        sel('land_area', 'Land Area', 'Sipërfaqe', 'Superficie', LAND_AREA),
        sel('zoning', 'Zoning', 'Zonimi', 'Zonizzazione', ZONING),
        bool('has_water_access', 'Water Access', 'Akses uji', 'Accesso acqua'),
        bool('has_road_access', 'Road Access', 'Akses rrugor', 'Accesso strada'),
      ],
    },
    {
      subcategorySlug: 'plot',
      attributes: [
        sel('land_area', 'Land Area', 'Sipërfaqe', 'Superficie', LAND_AREA),
        sel('zoning', 'Zoning', 'Zonimi', 'Zonizzazione', ZONING),
        bool('has_utilities', 'Utilities', 'Infrastruktura', 'Servizi'),
        bool('has_road_access', 'Road Access', 'Akses rrugor', 'Accesso strada'),
      ],
    },
    {
      subcategorySlug: 'vineyard',
      attributes: [
        sel('land_area', 'Land Area', 'Sipërfaqe', 'Superficie', LAND_AREA),
        bool('has_water_access', 'Water Access', 'Akses uji', 'Accesso acqua'),
        bool('has_road_access', 'Road Access', 'Akses rrugor', 'Accesso strada'),
      ],
    },
    {
      subcategorySlug: 'forest',
      attributes: [
        sel('land_area', 'Land Area', 'Sipërfaqe', 'Superficie', LAND_AREA),
        bool('has_road_access', 'Road Access', 'Akses rrugor', 'Accesso strada'),
      ],
    },
    {
      subcategorySlug: 'urban_plot',
      attributes: [
        sel('land_area', 'Land Area', 'Sipërfaqe', 'Superficie', LAND_AREA),
        sel('zoning', 'Zoning', 'Zonimi', 'Zonizzazione', ZONING),
        bool('has_utilities', 'Utilities', 'Infrastruktura', 'Servizi'),
      ],
    },
  ];

  for (const sub of attributesData) {
    const subId = subMap[sub.subcategorySlug];
    if (!subId) {
      console.warn(`⚠️  Subcategory "${sub.subcategorySlug}" not found, skipping.`);
      continue;
    }

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
              valueCode: val.code,
              attributeValueTranslations: {
                create: [
                  { language: LanguageCode.en, name: val.en, slug: val.code },
                  { language: LanguageCode.al, name: val.al, slug: val.code },
                  { language: LanguageCode.it, name: val.it, slug: val.code },
                ],
              },
            },
          });
        }
      } else if (attr.inputType === 'boolean') {
        await prisma.attributeValue.create({
          data: { attributeId: attribute.id, valueCode: 'true' },
        });
      }
    }
  }

  console.log('✅ Attributes and values seeded!');
}