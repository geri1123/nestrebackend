// import { registrationrequest_status } from '@prisma/client';

// export type RegistrationRequestInfo = {
//   id: number;
//   requestType: string;
//   idCardNumber?: string | null;
//   agencyName?: string | null;
//   supportingDocuments?: string | null;
//   status: registrationrequest_status;
//   reviewNotes?: string | null;
//   reviewedAt?: Date | null;
//   requestedRole?: string | null;
//   licenseNumber?: string | null;
//   createdAt: Date;
//   updatedAt?: Date | null;
//   user: {
//     id: number;
//     username: string;
//     email: string;
//     firstName?: string | null;
//     lastName?: string | null;
//     role?: string;
//   };
//   agency?: {
//     id: number;
//     agencyName: string;
//     licenseNumber: string;
//   } | null;
//   reviewedByUser?: {
//     id: number;
//     username: string;
//     email: string;
//   } | null;
// };