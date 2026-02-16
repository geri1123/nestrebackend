

import { Inject, Injectable } from '@nestjs/common';
import { SupportedLang } from '../../locales';
import { ProductStatus } from '@prisma/client';
import { AttributeDto } from './dto/attribute.dto';
import { CityDto, CountryDto } from './dto/location.dto';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { CategoryDto } from './dto/filters.dto';
import { CATEGORY_REPO, type ICatRepository } from './repositories/category/Icategory.repository';
import { LISTING_TYPE_REPO, type IListingTypeRepository } from './repositories/listingtype/Ilistingtype.repository';
import { ATTRIBUTE_REPO, type IAttributeRepo } from './repositories/attributes/Iattribute.respository';
import { type ILocationRepository, LOCATION_REPO } from './repositories/location/Ilocation.repository';

@Injectable()
export class FiltersService {
  private ttlMap = {
    categories: 2 * 24 * 3600 * 1000,    // 2 days for structure
    listingTypes: 12 * 3600 * 1000,      // 12 hours for structure
    attributes: 24 * 3600 * 1000,        // 1 day
    countries: 7 * 24 * 3600 * 1000,     // 7 days
    cities: 12 * 3600 * 1000,            // 12 hours
    default: 3600 * 1000,                // 1 hour
  };

  private getTTL(key: string) {
    return this.ttlMap[key] || this.ttlMap.default;
  }

  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepo: ICatRepository,
    @Inject(LISTING_TYPE_REPO)
    private readonly listingTypeRepo: IListingTypeRepository,
    @Inject(ATTRIBUTE_REPO)
    private readonly attributeRepo: IAttributeRepo,
    @Inject(LOCATION_REPO)
    private readonly locationRepo: ILocationRepository,
    private readonly cacheService: CacheService,
  ) {}

  //CATEGORIES 

  // Cache structure only (no counts)
  private async getCategoryStructure(lang: SupportedLang): Promise<any[]> {
    const cacheKey = `categories:structure:${lang}`;

    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] category structure for ${lang}`);
      return cached;
    }

    console.log(`[CACHE MISS] category structure for ${lang}`);
    const raw = await this.categoryRepo.getAllCategories(lang);

    await this.cacheService.set(cacheKey, raw, this.getTTL('categories'));
    console.log(`[CACHE SET] Cached category structure for ${lang}`);
    
    return raw;
  }

  // Main method: combine cached structure + fresh counts
  async getCategories(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ): Promise<CategoryDto[]> {
    try {
      const structure = await this.getCategoryStructure(lang);

      const { subcategoryCountMap, categoryCountMap } =
        await this.categoryRepo.getCategoryCounts(status);

      console.log(`[FRESH COUNTS] Product counts fetched for status: ${status}`);

      // Map and merge
      return this.mapCategoriesWithCounts(
        structure,
        subcategoryCountMap,
        categoryCountMap,
      );
    } catch (err: any) {
      console.error(' getCategories ERROR:', err?.message);
      console.error(err);
      throw err;
    }
  }
private mapCategoriesWithCounts(
  categories: any[],
  subcategoryCountMap: Record<number, number>,
  categoryCountMap: Record<number, number>,
): CategoryDto[] {
  return (categories ?? []).map((category) => {
    const subcategories = (category.subcategory ?? []).map((subcat) => {
      const [translation] = subcat.subcategoryTranslation ?? [];

      return {
        id: subcat.id,
        name: translation?.name ?? 'No translation',
        slug: subcat.slug,
        categoryId: subcat.categoryId,
        productCount: subcategoryCountMap[subcat.id] ?? 0,
      };
    });

    const [translation] = category.categoryTranslation ?? [];

    return {
      id: category.id,
      name: translation?.name ?? 'No translation',
      slug: category.slug,
      productCount: categoryCountMap[category.id] ?? 0,
      subcategories,
    };
  });
}
 

  async getListingTypes(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ) {
    const cacheKey = `listingTypes:structure:${lang}`;
    let listingTypes = await this.cacheService.get<any[]>(cacheKey);

    if (listingTypes) {
      console.log(`[CACHE HIT] Listing types structure for ${lang}`);
    } else {
      console.log(`[CACHE MISS] Listing types structure for ${lang}`);
      listingTypes = await this.listingTypeRepo.getAllListingTypes(lang);

      if (listingTypes && listingTypes.length > 0) {
        await this.cacheService.set(
          cacheKey,
          listingTypes,
          this.getTTL('listingTypes'),
        );
        console.log(`[CACHE SET] Cached listing types structure for ${lang}`);
      } else {
        console.log(`[DB EMPTY] No listing types found for ${lang}`);
      }
    }

    // Get fresh counts
    const counts = await this.listingTypeRepo.getListingTypeCounts(status);
    console.log(`[FRESH COUNTS] Listing type counts fetched for status: ${status}`);

    
    return listingTypes.map((lt) => ({
      ...lt,
      productCount: counts[lt.id] ?? 0,
    }));
  }

  // COMBINED FILTERS

  async getFilters(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ) {
    const [categories, listingTypes] = await Promise.all([
      this.getCategories(lang, status),
      this.getListingTypes(lang, status),
    ]);
    return { categories, listingTypes };
  }

  //ATTRIBUTES 

  async getAttributes(
    subcategoryId: number,
    lang: SupportedLang = 'al',
  ): Promise<AttributeDto[]> {
   const cacheKey = `attributes:v2:${subcategoryId}:${lang}`;


    let attributes = await this.cacheService.get<AttributeDto[]>(cacheKey);

    if (attributes) {
      console.log(
        `[CACHE HIT] Attributes for subcategory ${subcategoryId} (${lang})`,
      );
      return attributes;
    }

    console.log(
      `[CACHE MISS] Attributes for subcategory ${subcategoryId} (${lang})`,
    );
    attributes = await this.attributeRepo.getAttributesBySubcategoryId(
      subcategoryId,
      lang,
    );

    if (attributes && attributes.length > 0) {
      await this.cacheService.set(cacheKey, attributes, this.getTTL('attributes'));
      console.log(
        `[CACHE SET] Cached attributes for subcategory ${subcategoryId} (${lang})`,
      );
    } else {
      console.log(
        `[DB EMPTY] No attributes found for subcategory ${subcategoryId} (${lang})`,
      );
    }
    return attributes ?? [];
  }

  //LOCATIONS

  async getCountries(): Promise<CountryDto[]> {
    const cacheKey = 'countries';

    let countries = await this.cacheService.get<CountryDto[]>(cacheKey);

    if (!countries) {
      countries = await this.locationRepo.getAllCountries();
      await this.cacheService.set(cacheKey, countries, this.getTTL('countries'));
      console.log('[CACHE SET] Countries');
    } else {
      console.log('[CACHE HIT] Countries');
    }

    return countries;
  }

  async getCities(countryCode: string): Promise<CityDto[]> {
    const cacheKey = `cities:${countryCode}`;

    let cities = await this.cacheService.get<CityDto[]>(cacheKey);

    if (!cities) {
      cities = await this.locationRepo.getCitiesByCountry(countryCode);
      await this.cacheService.set(cacheKey, cities, this.getTTL('cities'));
      console.log(`[CACHE SET] Cities for ${countryCode}`);
    } else {
      console.log(`[CACHE HIT] Cities for ${countryCode}`);
    }

    return cities;
  }
}