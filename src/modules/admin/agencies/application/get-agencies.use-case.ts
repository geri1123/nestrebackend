import { Inject, Injectable } from "@nestjs/common";
import { AGENCY_REPO, IAgencyDomainRepository } from "../../../agency/domain/repositories/agency.repository.interface";
import { GetAllAgenciesAdminDto } from "../dto/get-all-agencies-admin.query.dto";
import { AgencyAdminListResponse } from "../../../agency/domain/types/agency-query.types";

@Injectable()
export class GetAllAgenciesAdminUseCase {
  private readonly LIMIT = 10; 

  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(dto: GetAllAgenciesAdminDto): Promise<AgencyAdminListResponse> {
    const { page = 1, search, status, sortBy, sortOrder } = dto;
    const skip = (page - 1) * this.LIMIT;

    const [agencies, total] = await Promise.all([
      this.agencyRepo.getAllAgenciesAdminPaginated({ skip, limit: this.LIMIT, search, status, sortBy, sortOrder }),
      this.agencyRepo.countAgenciesAdmin(search, status),
    ]);

    return {
      data: agencies,
      meta: {
        total,
        page,
        limit: this.LIMIT,
        totalPages: Math.ceil(total / this.LIMIT),
      },
    };
  }
}