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

  UpdateRequestFields(
  id: number,
  status: registrationrequest_status,
  reviewedBy?: number,
  reviewNotes?: string,
): Promise<{
  id: number;
  status: registrationrequest_status;
  reviewed_by: number | null;
  review_notes: string | null;
  reviewed_at: Date | null;
}>

  // findPendingRequests(limit?: number):any;

  findByUserId(userId: number):any;
findRequestById(id: number): Promise<{ id: number; user_id: number } | null>  ;
  // findById(id: number):any;
}
