import { Injectable } from "@nestjs/common";
import { RegistrationRequestStatus } from "@prisma/client";
import { GetRequestCountUseCase } from "../../../registration-request/application/use-cases/get-request-count.use-case";
import { GetRequestsUseCase } from "../../../registration-request/application/use-cases/get-request.use-case";
import { PaginatedRegistrationRequestResponseDto } from "../../dto/paginated-registration-request-response.dto";

@Injectable()
export class GetAgencyRequestsUseCase {
  constructor(
    private readonly getRequestCount: GetRequestCountUseCase,
    private readonly getRequests: GetRequestsUseCase,
  ) {}
async execute(
  agencyId: number,
  page = 1,
  status?: RegistrationRequestStatus,
  search?: string,
): Promise<PaginatedRegistrationRequestResponseDto> {
  const limit = 6;
  const skip = (page - 1) * limit;

  const [total, requests] = await Promise.all([
    this.getRequestCount.execute(agencyId, status, search),
    this.getRequests.execute(agencyId, page, limit, status, search),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    requests,
  };
}
}