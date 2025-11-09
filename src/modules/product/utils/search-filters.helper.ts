import { Injectable } from '@nestjs/common';
import { SearchFiltersDto } from '../dto/product-filters.dto';

@Injectable()
export class SearchFiltersHelper {
  parse(rawQuery: Record<string, any>, page: string = '1', fixedLimit = 12): SearchFiltersDto {
    const FIXED_LIMIT = fixedLimit;
    const pageValue = Math.max(1, parseInt(page, 10) || 1);
    const offsetValue = (pageValue - 1) * FIXED_LIMIT;

    // Parse attributes[1]=4,5 or attributes[1]=4&attributes[1]=5
    const attributes: Record<number, number[]> = {};
    for (const key in rawQuery) {
      const match = key.match(/^attributes\[(\d+)\]$/);
      if (match) {
        const attrId = Number(match[1]);
        const value = rawQuery[key];
        if (Array.isArray(value)) {
          attributes[attrId] = value.flatMap(v =>
            String(v).split(',').map(num => Number(num.trim()))
          );
        } else {
          attributes[attrId] = String(value).split(',').map(v => Number(v.trim()));
        }
      }
    }

    // Parse cities
    let cities: string[] | undefined;
    if (rawQuery.cities) {
      if (Array.isArray(rawQuery.cities)) {
        cities = rawQuery.cities.flatMap(city =>
          String(city).split(',').map(c => c.trim())
        );
      } else {
        cities = String(rawQuery.cities).split(',').map(c => c.trim());
      }
    }

    // Build filters
    const filters: SearchFiltersDto = {
      categoryId: rawQuery.categoryId ? Number(rawQuery.categoryId) : undefined,
      subcategoryId: rawQuery.subcategoryId ? Number(rawQuery.subcategoryId) : undefined,
      listingTypeId: rawQuery.listingTypeId ? Number(rawQuery.listingTypeId) : undefined,
      pricelow: rawQuery.pricelow ? Number(rawQuery.pricelow) : undefined,
      pricehigh: rawQuery.pricehigh ? Number(rawQuery.pricehigh) : undefined,
      areaLow: rawQuery.areaLow ? Number(rawQuery.areaLow) : undefined,
      areaHigh: rawQuery.areaHigh ? Number(rawQuery.areaHigh) : undefined,
      cities,
      country: rawQuery.country,
      sortBy: rawQuery.sortBy as SearchFiltersDto['sortBy'],
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      limit: FIXED_LIMIT,
      offset: offsetValue,
    };

    return filters;
  }
}