
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SupportedLang } from '../../locales';
import { ProductStatus } from '@prisma/client';
import { AttributeDto } from './dto/attribute.dto';
import { CityDto, CountryDto } from './dto/location.dto';
import { CacheService } from '../../infrastructure/redis/cache.service';
import { CategoryDto } from './dto/filters.dto';
import {
  CATEGORY_REPO,
  type ICatRepository,
} from './repositories/category/Icategory.repository';
import {
  LISTING_TYPE_REPO,
  type IListingTypeRepository,
} from './repositories/listingtype/Ilistingtype.repository';
import {
  ATTRIBUTE_REPO,
  type IAttributeRepo,
} from './repositories/attributes/Iattribute.respository';
import {
  type ILocationRepository,
  LOCATION_REPO,
} from './repositories/location/Ilocation.repository';
import {
  PRODUCT_COUNTS_REPO,
  type IProductCountsRepository,
} from './repositories/counts/Iproduct-counts.repository';

const SUPPORTED_LANGS: SupportedLang[] = ['al', 'en'];

@Injectable()
export class FiltersService implements OnModuleInit {
  private readonly logger = new Logger(FiltersService.name);

  // Structure (categories, listing-types, locations) is slow-changing and
  // safe to cache aggressively. Counts no longer use TTL caching here —
  // they live as live counters in Redis hashes, updated by the worker.
  private ttlMap = {
    categories: 2 * 24 * 3600 * 1000,
    listingTypes: 12 * 3600 * 1000,
    attributes: 24 * 3600 * 1000,
    countries: 7 * 24 * 3600 * 1000,
    cities: 12 * 3600 * 1000,
    default: 3600 * 1000,
  };

  private getTTL(key: keyof typeof this.ttlMap | string): number {
    return (this.ttlMap as Record<string, number>)[key] ?? this.ttlMap.default;
  }

  constructor(
    @Inject(CATEGORY_REPO) private readonly categoryRepo: ICatRepository,
    @Inject(LISTING_TYPE_REPO)
    private readonly listingTypeRepo: IListingTypeRepository,
    @Inject(ATTRIBUTE_REPO) private readonly attributeRepo: IAttributeRepo,
    @Inject(LOCATION_REPO) private readonly locationRepo: ILocationRepository,
    @Inject(PRODUCT_COUNTS_REPO)
    private readonly productCounts: IProductCountsRepository,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    // Only structure refreshers — counts are managed by the worker now.
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

    this.cacheService.registerRefresher(
      'countries',
      () => this.locationRepo.getAllCountries(),
      this.getTTL('countries'),
    );
  }

  // ─── CATEGORIES ──────────────────────────────────────────────────────────

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
    const [structure, subcategoryCountMap] = await Promise.all([
      this.getCategoryStructure(lang),
      this.productCounts.getSubcategoryCounts(status),
    ]);

    // Cold-cache safety net: if Redis has nothing yet, fall back to the DB
    // once. This should only happen on first boot before reconciliation runs.
    let effectiveSubcatMap = subcategoryCountMap;
    if (Object.keys(effectiveSubcatMap).length === 0) {
      const initialized = await this.productCounts.isStatusInitialized(status);
      if (!initialized) {
        this.logger.warn(
          `Cold counts for status=${status} — falling back to DB this once`,
        );
        const fresh = await this.categoryRepo.getCategoryCounts(status);
        effectiveSubcatMap = fresh.subcategoryCountMap;
        // Best-effort warm: don't block the response if it fails
        this.productCounts
          .replaceCounts({
            status,
            subcategoryCounts: fresh.subcategoryCountMap,
            listingTypeCounts: {},
          })
          .catch((err) =>
            this.logger.error(`Cold-warm replaceCounts failed: ${err.message}`),
          );
      }
    }

    // Derive category counts from subcategory counts (single source of truth)
    const categoryCountMap = this.deriveCategoryCounts(
      structure,
      effectiveSubcatMap,
    );

    return this.mapCategoriesWithCounts(
      structure,
      effectiveSubcatMap,
      categoryCountMap,
    );
  }

  private deriveCategoryCounts(
    categories: any[],
    subcategoryCountMap: Record<number, number>,
  ): Record<number, number> {
    const out: Record<number, number> = {};
    for (const category of categories ?? []) {
      let total = 0;
      for (const sub of category.subcategory ?? []) {
        total += subcategoryCountMap[sub.id] ?? 0;
      }
      out[category.id] = total;
    }
    return out;
  }

  private mapCategoriesWithCounts(
    categories: any[],
    subcategoryCountMap: Record<number, number>,
    categoryCountMap: Record<number, number>,
  ): CategoryDto[] {
    return (categories ?? []).map((category) => {
      const subcategories = (category.subcategory ?? []).map((subcat: any) => {
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

  // ─── LISTING TYPES ───────────────────────────────────────────────────────

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
      this.productCounts.getListingTypeCounts(status),
    ]);

    return listingTypes.map((lt: any) => ({
      ...lt,
      productCount: counts[lt.id] ?? 0,
    }));
  }

  // ─── COMBINED ────────────────────────────────────────────────────────────

  async getFilters(
    lang: SupportedLang = 'al',
    status: ProductStatus = ProductStatus.active,
  ) {
    const [categories, listingTypes] = await Promise.all([
      this.getCategories(lang, status),
      this.getListingTypes(lang, status),
    ]);
    const totalProductCount = categories.reduce((sum, cat)=>sum+cat.productCount ,0);
    return { categories, listingTypes, totalProductCount };
  }

  // ─── ATTRIBUTES ──────────────────────────────────────────────────────────

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

  // ─── LOCATIONS ───────────────────────────────────────────────────────────

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
}