// src/filters/filters.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_KEYV } from '../cache/cache.module';
import Keyv from 'keyv';
import { CategoryRepository } from '../repositories/category/category.repository';
import { ListingTypeRepo } from '../repositories/listingtype/listingtype.repository';
import { SupportedLang } from '../locales';
import { product_status } from '@prisma/client';
import { AttributeRepo } from '../repositories/attributes/attributes.repository';
import { AttributeDto } from './dto/attribute.dto';
import { LoationRepository } from '../repositories/location/location.repository';
import { cityDto, CountryDto } from './dto/location.dto';
@Injectable()
export class FiltersService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly listingTypeRepo: ListingTypeRepo,
    private readonly attributeRepo:AttributeRepo,
    private readonly locationRepo:LoationRepository,
   @Inject(CACHE_KEYV) private cache: Keyv,
  ) {}



async getCategories(
    lang: SupportedLang = 'al',
    status: product_status = product_status.active,
  ) {
    const cacheKey = `categories:${lang}`;
    let categories = await this.cache.get(cacheKey);

    if (categories) {
      console.log(`[CACHE HIT] Categories for ${lang}`);
      return categories;
    }

    console.log(`[CACHE MISS] Categories for ${lang}`);
    categories = await this.categoryRepo.getAllCategories(lang, status);

    if (categories && categories.length > 0) {
      // TTL in milliseconds
     await this.cache.set(cacheKey, categories, 3600 * 1000); 
      console.log(`[CACHE SET] Cached categories for ${lang}`);
    } else {
      console.log(`[DB EMPTY] No categories found for ${lang}`);
    }

    return categories;
  }
async getListingTypes(
  lang: SupportedLang = 'al',
  status: product_status = product_status.active,
) {
  const cacheKey = `listingTypes:${lang}`;
  let listingTypes = await this.cache.get(cacheKey);

  if (listingTypes) {
    console.log(`[CACHE HIT] Listing types for ${lang}`);
    return listingTypes;
  }

  console.log(`[CACHE MISS] Listing types for ${lang}`);
  listingTypes = await this.listingTypeRepo.getAllListingTypes(lang, status);

  if (listingTypes && listingTypes.length > 0) {
    // TTL in milliseconds
    await this.cache.set(cacheKey, listingTypes, 3600 * 1000);
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
  let attributes = await this.cache.get(cacheKey);

  if (attributes) {
    console.log(`[CACHE HIT] Attributes for subcategory ${subcategoryId} (${lang})`);
    return attributes;
  }

  console.log(`[CACHE MISS] Attributes for subcategory ${subcategoryId} (${lang})`);
  attributes = await this.attributeRepo.getAttributesBySubcategoryId(subcategoryId, lang);

  if (attributes && attributes.length > 0) {
    // Set cache with TTL (1 hour in milliseconds)
    await this.cache.set(cacheKey, attributes, 3600 * 1000);
    console.log(`[CACHE SET] Cached attributes for subcategory ${subcategoryId} (${lang})`);
  } else {
    console.log(`[DB EMPTY] No attributes found for subcategory ${subcategoryId} (${lang})`);
  }

  return attributes;
}
  async getCountries():Promise<CountryDto[]> {
    const cacheKey = 'countries';
    let countries = await this.cache.get(cacheKey);

    if (!countries) {
      countries = await this.locationRepo.getAllCountries();
      await this.cache.set(cacheKey, countries, 3600 * 1000); // 1 hour
      console.log('[CACHE SET] Countries');
    } else {
      console.log('[CACHE HIT] Countries');
    }

    return countries;
  }

  async getCities(countryCode: string):Promise<cityDto[]> {
    const cacheKey = `cities:${countryCode}`;
    let cities = await this.cache.get(cacheKey);

    if (!cities) {
      cities = await this.locationRepo.getCitiesByCountry(countryCode);
      await this.cache.set(cacheKey, cities, 3600 * 1000); // 1 hour
      console.log(`[CACHE SET] Cities for ${countryCode}`);
    } else {
      console.log(`[CACHE HIT] Cities for ${countryCode}`);
    }

    return cities;
  }
}
