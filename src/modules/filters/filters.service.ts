import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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

const SUPPORTED_LANGS: SupportedLang[] = ['al', 'en'];
const PRODUCT_STATUSES = ['active', 'draft', 'pending', 'sold', 'inactive'] as const;

@Injectable()
export class FiltersService implements OnModuleInit {
  private ttlMap = {
    categories: 2 * 24 * 3600 * 1000,
    listingTypes: 12 * 3600 * 1000,
    attributes: 24 * 3600 * 1000,
    countries: 7 * 24 * 3600 * 1000,
    cities: 12 * 3600 * 1000,
    default: 3600 * 1000,
  };

  private getTTL(key: string) {
    return this.ttlMap[key] || this.ttlMap.default;
  }

  constructor(
    @Inject(CATEGORY_REPO) private readonly categoryRepo: ICatRepository,
    @Inject(LISTING_TYPE_REPO) private readonly listingTypeRepo: IListingTypeRepository,
    @Inject(ATTRIBUTE_REPO) private readonly attributeRepo: IAttributeRepo,
    @Inject(LOCATION_REPO) private readonly locationRepo: ILocationRepository,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    // structure refreshers
    for (const lang of SUPPORTED_LANGS) {
      this.cacheService.registerRefresher(
        `categories:structure:${lang}`,
        () => this.categoryRepo.getAllCategories(lang),
        this.getTTL('categories'),
      );

      this.cacheService.registerRefresher(
        `listingTypes:structure:${lang}`,
        () => this.listingTypeRepo.getAllListingTypes(lang),
        this.getTTL('listingTypes'),
      );
    }

    // count refreshers — one per status so DB is never hit twice for same status
    for (const status of PRODUCT_STATUSES) {
      this.cacheService.registerRefresher(
        `categoryCounts:${status}`,
        () => this.categoryRepo.getCategoryCounts(status as ProductStatus),
        this.getTTL('categories'),
      );

      this.cacheService.registerRefresher(
        `listingTypeCounts:${status}`,
        () => this.listingTypeRepo.getListingTypeCounts(status as ProductStatus),
        this.getTTL('listingTypes'),
      );
    }

    this.cacheService.registerRefresher(
      'countries',
      () => this.locationRepo.getAllCountries(),
      this.getTTL('countries'),
    );
  }

  // CATEGORIES

  private async getCategoryStructure(lang: SupportedLang): Promise<any[]> {
    return this.cacheService.getOrSet(
      `categories:structure:${lang}`,
      () => this.categoryRepo.getAllCategories(lang),
      this.getTTL('categories'),
    );
  }

  async getCategories(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ): Promise<CategoryDto[]> {
    const [structure, counts] = await Promise.all([
      this.getCategoryStructure(lang),
      this.cacheService.getOrSet(                          
        `categoryCounts:${status}`,
        () => this.categoryRepo.getCategoryCounts(status),
        this.getTTL('categories'),
      ),
    ]);

    return this.mapCategoriesWithCounts(
      structure,
      counts.subcategoryCountMap,
      counts.categoryCountMap,
    );
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

  // LISTING TYPES

  async getListingTypes(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ) {
    const [listingTypes, counts] = await Promise.all([
      this.cacheService.getOrSet(
        `listingTypes:structure:${lang}`,
        () => this.listingTypeRepo.getAllListingTypes(lang),
        this.getTTL('listingTypes'),
      ),
      this.cacheService.getOrSet(                          // ← now cached
        `listingTypeCounts:${status}`,
        () => this.listingTypeRepo.getListingTypeCounts(status),
        this.getTTL('listingTypes'),
      ),
    ]);

    return listingTypes.map((lt) => ({
      ...lt,
      productCount: counts[lt.id] ?? 0,
    }));
  }

  // COMBINED

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

  // ATTRIBUTES

  async getAttributes(
    subcategoryId: number,
    lang: SupportedLang = 'al',
  ): Promise<AttributeDto[]> {
    return this.cacheService.getOrSet(
      `attributes:v2:${subcategoryId}:${lang}`,
      () => this.attributeRepo.getAttributesBySubcategoryId(subcategoryId, lang),
      this.getTTL('attributes'),
    );
  }

  // LOCATIONS

  async getCountries(): Promise<CountryDto[]> {
    return this.cacheService.getOrSet(
      'countries',
      () => this.locationRepo.getAllCountries(),
      this.getTTL('countries'),
    );
  }

  async getCities(countryCode: string): Promise<CityDto[]> {
    const key = `cities:${countryCode}`;
    this.cacheService.registerRefresher(
      key,
      () => this.locationRepo.getCitiesByCountry(countryCode),
      this.getTTL('cities'),
    );
    return this.cacheService.getOrSet(
      key,
      () => this.locationRepo.getCitiesByCountry(countryCode),
      this.getTTL('cities'),
    );
  }

  // called after product create / update / delete
  // fires in background — never blocks the response
  refreshCounts(): void {
    for (const status of PRODUCT_STATUSES) {
      this.cacheService.delete(`categoryCounts:${status}`)
        .then(() => this.cacheService.getOrSet(
          `categoryCounts:${status}`,
          () => this.categoryRepo.getCategoryCounts(status as ProductStatus),
          this.getTTL('categories'),
        ))
        .catch((err) => console.error(`[FiltersService] refreshCounts categoryCounts:${status}`, err));

      this.cacheService.delete(`listingTypeCounts:${status}`)
        .then(() => this.cacheService.getOrSet(
          `listingTypeCounts:${status}`,
          () => this.listingTypeRepo.getListingTypeCounts(status as ProductStatus),
          this.getTTL('listingTypes'),
        ))
        .catch((err) => console.error(`[FiltersService] refreshCounts listingTypeCounts:${status}`, err));
    }
  }
}