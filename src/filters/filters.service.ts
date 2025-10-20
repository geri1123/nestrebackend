// src/filters/filters.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CategoryRepository } from '../repositories/category/category.repository';
import { ListingTypeRepo } from '../repositories/listingtype/listingtype.repository';
import { SupportedLang } from '../locales';
import { product_status } from '@prisma/client';
import { AttributeRepo } from '../repositories/attributes/attributes.repository';
import { AttributeDto } from './dto/attribute.dto';
@Injectable()
export class FiltersService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly listingTypeRepo: ListingTypeRepo,
    private readonly attributeRepo:AttributeRepo,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCategories(lang: SupportedLang="al", status:product_status = product_status.active) {
    const cacheKey = `categories:${lang}`;
    let categories = await this.cacheManager.get(cacheKey);
    if (!categories) {
      categories = await this.categoryRepo.getAllCategories(lang, status);
     await this.cacheManager.set(cacheKey, categories, 3600); 
    }
    return categories;
  }

  async getListingTypes(lang: SupportedLang="al", status: product_status = product_status.active) {
    const cacheKey = `listingTypes:${lang}`;
    let listingTypes = await this.cacheManager.get(cacheKey);
    if (!listingTypes) {
      listingTypes = await this.listingTypeRepo.getAllListingTypes(lang, status);
      await this.cacheManager.set(cacheKey, listingTypes); 
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
 
  async getAttributes(subcategoryId: number, lang: SupportedLang = "al"):Promise<AttributeDto[]>  {
  const attributes = await this.attributeRepo.getAttributesBySubcategoryId(subcategoryId, lang);
  return attributes;
}
}
