import {
  registrationrequest_status,
  registrationrequest_request_type,
  registrationrequest_requested_role,
} from '@prisma/client';

export type RegistrationRequestCreateInput = {
  requestType: registrationrequest_request_type;
  userId: number;
  agencyId?: number;
  idCardNumber?: string | null;
  agencyName?: string | null;
  supportingDocuments?: string | null;
  status?: registrationrequest_status; 
  requestedRole?: registrationrequest_requested_role | null; 
  licenseNumber?: string | null;
};