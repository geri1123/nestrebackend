import { Inject, Injectable } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { PaginatedAgenciesVO } from '../../domain/value-objects/paginated-agencies.vo';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class GetPaginatedAgenciesUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(page: number = 1, limit: number = 12): Promise<PaginatedAgenciesVO> {
    const skip = (page - 1) * limit;

    const [agencies, total] = await Promise.all([
      this.agencyRepository.getAllAgencies(skip, limit),
      this.agencyRepository.countAgencies(),
    ]);

    return {
      total,
      page,
      limit,
      agencies: agencies.map(a => ({
        id: a.id,
        name: a.agency_name,
        logo: a.logo ? this.firebaseService.getPublicUrl(a.logo) : null,
        address: a.address,
        created_at: a.created_at.toLocaleDateString('en-GB'),
      })),
    };
  }
}