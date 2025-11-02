import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentRequestQueryResult } from '../../registration-request/type/agent-request-query-result';
import { IRegistrationRequestRepository } from './Iregistration-request.respository';
import { RegistrationRequestCreateInput } from '../../registration-request/type/registration-request-create';
import { registrationrequest, registrationrequest_status } from '@prisma/client';

@Injectable()
export class RegistrationRequestRepository implements IRegistrationRequestRepository {
 constructor(private prisma: PrismaService) {}
   async create(data:RegistrationRequestCreateInput): Promise<number> {
    const result = await this.prisma.registrationrequest.create({
      data: {
            user_id: data.userId,    
        request_type: data.requestType,
        id_card_number: data.idCardNumber,
        agency_name: data.agencyName,
        agency_id: data.agencyId,
        supporting_documents: data.supportingDocuments,
        status: data.status || 'pending',
        requested_role: data.requestedRole,
        license_number: data.licenseNumber,
      },
    });
    
    return result.id;
  }
   async idCardExists(idCard: string): Promise<boolean> {
    const result = await this.prisma.registrationrequest.findFirst({
      where: {
        id_card_number: idCard,
      },
      select: { id: true },
    });

    return result !== null;
  }

async findByAgencyIdAndStatus(
  agencyId: number,
  status?: registrationrequest_status,
  skip = 0,
  take = 10,
) {
  return this.prisma.registrationrequest.findMany({
    where: {
      agency_id: agencyId,
      ...(status ? { status } : { NOT: { status: 'pending' } }),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    skip,
    take,
  });
}
 async countAgentRequestsByAgencyId(
  agencyId: number,
  status?: registrationrequest_status, 
): Promise<number> {
  return this.prisma.registrationrequest.count({
    where: {
      agency_id: agencyId,
      ...(status ? { status } : { NOT: { status: 'pending' } }),
    },
  });
}
async setUnderReview(userId: number): Promise<registrationrequest | null> {
  const latestRequest = await this.prisma.registrationrequest.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  if (!latestRequest) return null;

  return this.prisma.registrationrequest.update({
    where: { id: latestRequest.id },
    data: { status: registrationrequest_status.under_review },
  });
}
//    async UpdateRequestFields(
//   id: number,
//   status: registrationrequest_status,
//   reviewedBy?: number,
//   reviewNotes?: string,
// ) {
//   return this.prisma.registrationrequest.update({
//     where: { id },
//     data: {
//       status,
//       ...(reviewedBy && { reviewed_by: reviewedBy }),
//       ...(reviewNotes && { review_notes: reviewNotes }),
//       reviewed_at: new Date(),
//     },
//   });
// }

async UpdateRequestFields(
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
}> {
  return this.prisma.registrationrequest.update({
    where: { id },
    data: {
      status,
      ...(reviewedBy && { reviewed_by: reviewedBy }),
      ...(reviewNotes && { review_notes: reviewNotes }),
      reviewed_at: new Date(),
    },
    select: {
      id: true,
      status: true,
      reviewed_by: true,
      review_notes: true,
      reviewed_at: true,
    },
  });
}
   async findByUserId(userId: number) {
    return await this.prisma.registrationrequest.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

// async findRequestById(id: number): Promise<{ id: number; user_id: number } | null> {
//   return this.prisma.registrationrequest.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       user_id: true,
//     },
//   });
// }
async findRequestById(id: number): Promise<{
  id: number;
  user_id: number;
  user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
} | null> {
  return this.prisma.registrationrequest.findUnique({
    where: { id },
    select: {
      id: true,
      user_id: true,
      user: {
        select: {
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}
}
//findById
  //   async findById(id: number) {
  //   return await this.prisma.registrationrequest.findUnique({
  //     where: { id },
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           username: true,
  //           email: true,
  //           first_name: true,
  //           last_name: true,
  //           role: true,
  //         },
  //       },
  //       agency: {
  //         select: {
  //           id: true,
  //           agency_name: true,
  //           license_number: true,
  //         },
  //       },
  //       reviewedByUser: {
  //         select: {
  //           id: true,
  //           username: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });
  // }
   /**
   * Get all pending registration requests
   */
  //  async findPendingRequests(limit?: number) {
  //   return await this.prisma.registrationrequest.findMany({
  //     where: {
  //       status: 'pending',
  //     },
  //     include: {
  //       user: {
  //         select: {
  //           username: true,
  //           email: true,
  //           first_name: true,
  //           last_name: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       created_at: 'asc', 
  //     },
  //     ...(limit && { take: limit }),
  //   });
  // }

  //find byUserId