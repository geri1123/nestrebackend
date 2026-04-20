// get-agency-city-counts.usecase.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  SEARCH_PRODUCT_REPO,
  ISearchProductRepository,
  CityCount,
} from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersResolver } from '../../infrastructure/search/search-filters-resolver.service';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ILocationRepository, LOCATION_REPO } from '../../../filters/repositories/location/Ilocation.repository';

@Injectable()
export class GetAgencyCityCountsUseCase {
  constructor(
    @Inject(SEARCH_PRODUCT_REPO)
    private readonly repo: ISearchProductRepository,
    private readonly filtersResolver: SearchFiltersResolver,
    @Inject(LOCATION_REPO)                              
    private readonly locationRepo: ILocationRepository,
  ) {}

  async execute(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute = false,
  ) {
    const resolved = await this.filtersResolver.resolve(filters);

    const grouped = await this.repo.getCityCounts(resolved, isProtectedRoute);

    if (grouped.length === 0) return [];

    const cities = await this.locationRepo.getCitiesByIds(  
      grouped.map(g => g.cityId)
    );

    const cityMap = new Map(cities.map(c => [c.id, c.name]));

    return grouped.map(g => ({
      cityId: g.cityId,
      cityName: cityMap.get(g.cityId) ?? null,
      count: g.count,
    }));
  }
}