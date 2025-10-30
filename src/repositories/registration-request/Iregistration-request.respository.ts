import {
  registrationrequest,
  registrationrequest_status,
} from '@prisma/client';
import { RegistrationRequestCreateInput } from '../../registration-request/type/registration-request-create.js';
import { AgentRequestQueryResult } from '../../registration-request/type/agent-request-query-result.js';

export interface IRegistrationRequestRepository {
  create(data: RegistrationRequestCreateInput): Promise<number>;

  idCardExists(idCard: string): Promise<boolean>;

  // findAgentRequestsByAgencyId(
  //   agencyId: number,
  //   limit: number,
  //   offset: number,
  // ): Promise<{ data: AgentRequestQueryResult[]; total: number }>;

  countAgentRequestsByAgencyId(agencyId: number): Promise<number>;
setUnderReview(userId: number): Promise<registrationrequest | null>;
  agencyReviewStatus(
    id: number,
    status: registrationrequest_status,
    reviewedBy?: number,
    reviewNotes?: string,
  ): Promise<unknown>;

  // findPendingRequests(limit?: number):any;

  findByUserId(userId: number):any;

  findById(id: number):any;
}
