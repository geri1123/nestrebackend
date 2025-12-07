// src/filters/filters.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { CategoryRepository } from './repositories/category/category.repository';
import { ListingTypeRepo } from './repositories/listingtype/listingtype.repository';
import { SupportedLang } from '../../locales';
import { product_status } from '@prisma/client';
import { AttributeRepo } from './repositories/attributes/attributes.repository';
import { AttributeDto } from './dto/attribute.dto';
import { LoationRepository } from './repositories/location/location.repository';
import { CityDto, CountryDto } from './dto/location.dto';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { CategoryDto } from './dto/filters.dto';
import { CATEGORY_REPO, type ICatRepository } from './repositories/category/Icategory.repository';
import { LISTING_TYPE_REPO, type IListingTypeRepository } from './repositories/listingtype/Ilistingtype.repository';
import { ATTRIBUTE_REPO,type IAttributeRepo } from './repositories/attributes/Iattribute.respository';
import {type ILocationRepository, LOCATION_REPO } from './repositories/location/Ilocation.repository';
@Injectable()
export class FiltersService {
 

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

async getCategories(
  lang: SupportedLang = 'al',
  status: product_status = product_status.active,
) {
  const cacheKey = `categories:${lang}`;
  let categories = await this.cacheService.get<CategoryDto[]>(cacheKey);

  if (categories) {
    console.log(`[CACHE HIT] Categories for ${lang}`);
    return categories;
  }

  console.log(`[CACHE MISS] Categories for ${lang}`);
  categories = await this.categoryRepo.getAllCategories(lang, status);

  if (categories && categories.length > 0) {
    await this.cacheService.set(cacheKey, categories, this.getTTL('categories'));
    console.log(`[CACHE SET] Cached categories for ${lang}`);
  } else {
    console.log(`[DB EMPTY] No categories found for ${lang}`);
  }

  return categories;
}
//get listing type
async getListingTypes(
  lang: SupportedLang = 'al',
  status: product_status = product_status.active,
) {
  const cacheKey = `listingTypes:${lang}`;
  let listingTypes = await this.cacheService.get<any[]>(cacheKey); 

  if (listingTypes) {
    console.log(`[CACHE HIT] Listing types for ${lang}`);
    return listingTypes;
  }

  console.log(`[CACHE MISS] Listing types for ${lang}`);
  listingTypes = await this.listingTypeRepo.getAllListingTypes(lang, status);

  if (listingTypes && listingTypes.length > 0) {
    await this.cacheService.set(cacheKey, listingTypes, this.getTTL('listingTypes')); 
    console.log(`[CACHE SET] Cached listing types for ${lang}`);
  } else {
    console.log(`[DB EMPTY] No listing types found for ${lang}`);
  }

  return listingTypes;
}

  async getFilters(lang: SupportedLang="al", status:product_status = product_status.active) {
    const [categories, listingTypes] = await Promise.all([
      this.getCategories(lang, status),
      this.getListingTypes(lang, status),
    ]);
    return { categories, listingTypes };
  }
 
 async getAttributes(
  subcategoryId: number,
  lang: SupportedLang = 'al',
): Promise<AttributeDto[]> {
  const cacheKey = `attributes:${subcategoryId}:${lang}`;
  
  // Use CacheService instead of Keyv directly
  let attributes = await this.cacheService.get<AttributeDto[]>(cacheKey);

  if (attributes) {
    console.log(`[CACHE HIT] Attributes for subcategory ${subcategoryId} (${lang})`);
    return attributes;
  }

  console.log(`[CACHE MISS] Attributes for subcategory ${subcategoryId} (${lang})`);
  attributes = await this.attributeRepo.getAttributesBySubcategoryId(subcategoryId, lang);

  if (attributes && attributes.length > 0) {
    await this.cacheService.set(cacheKey, attributes, this.getTTL("attributes"));
    console.log(`[CACHE SET] Cached attributes for subcategory ${subcategoryId} (${lang})`);
  } else {
    console.log(`[DB EMPTY] No attributes found for subcategory ${subcategoryId} (${lang})`);
  }

  return attributes ?? [];
}
  async getCountries(): Promise<CountryDto[]> {
  const cacheKey = 'countries';

  // Use CacheService instead of Keyv directly
  let countries = await this.cacheService.get<CountryDto[]>(cacheKey);

  if (!countries) {
    countries = await this.locationRepo.getAllCountries();
    await this.cacheService.set(cacheKey, countries, this.getTTL("countries"));
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
    await this.cacheService.set(cacheKey, cities, this.getTTL("cities"));
    console.log(`[CACHE SET] Cities for ${countryCode}`);
  } else {
    console.log(`[CACHE HIT] Cities for ${countryCode}`);
  }

  return cities;
}
}
