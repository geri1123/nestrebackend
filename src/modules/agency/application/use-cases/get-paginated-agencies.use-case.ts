import { Inject, Injectable } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { PaginatedAgenciesVO } from '../../domain/value-objects/paginated-agencies.vo';
import { PaginatedAgenciesResponse } from '../../responses/paginated-agencies.response';

@Injectable()
export class GetPaginatedAgenciesUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
  ) {}

  async execute(page: number = 1, limit: number = 12 , search?: string): Promise<PaginatedAgenciesResponse>  {
    const skip = (page - 1) * limit;

    const [agencies, total] = await Promise.all([
      this.agencyRepository.getAllAgenciesPaginated(skip, limit, search),
      this.agencyRepository.countAgencies(search),
    ]);
const total_pages = Math.ceil(total / limit);
    return {
  total,
  total_pages,
  page,
  limit,
  agencies: agencies.map(agency => ({
    id: agency.id,
    agency_name: agency.agency_name,
    logo: agency.logo,
    address: agency.address,
    public_code: agency.public_code,
    created_at: agency.created_at.toISOString(),
  })),
};
  }
}