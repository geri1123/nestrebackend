import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";
import { registrationrequest_status } from "@prisma/client";

@Injectable()
export class RegistrationRequestRepository implements IRegistrationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): RegistrationRequestEntity {
    return new RegistrationRequestEntity(
      data.id,
      data.user_id,
      data.agency_id,
      data.agency_name,
      data.id_card_number,
      data.request_type,
      data.status,
      data.requested_role,
      data.created_at,
      data.reviewed_by,
      data.review_notes,
      data.reviewed_at,
    );
  }

  async create(req: RegistrationRequestEntity): Promise<number> {
    const result = await this.prisma.registrationrequest.create({
      data: {
        user_id: req.userId,
        agency_id: req.agencyId,
        agency_name: req.agencyName,
        id_card_number: req.idCardNumber,
        request_type: req.requestType,
        requested_role: req.requestedRole,
        status: req.status,
      },
      select: { id: true },
    });

    return result.id;
  }

  async idCardExists(idCard: string): Promise<boolean> {
    return !!(
      await this.prisma.registrationrequest.findFirst({
        where: { id_card_number: idCard },
      })
    );
  }

  async findByUserId(userId: number): Promise<RegistrationRequestEntity[]> {
    const data = await this.prisma.registrationrequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" }
    });

    return data.map(d => this.mapToEntity(d));
  }
async findById(id: number): Promise<RegistrationRequestEntity | null> {
  const result = await this.prisma.registrationrequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return result ? this.mapToEntity(result) : null;
}
  // async findById(id: number): Promise<RegistrationRequestEntity | null> {
  //   const result = await this.prisma.registrationrequest.findUnique({
  //     where: { id },
  //   });

  //   return result ? this.mapToEntity(result) : null;
  // }

  async findByAgencyIdAndStatus(
    agencyId: number,
    status?: registrationrequest_status,
    skip = 0,
    take = 10
  ): Promise<RegistrationRequestEntity[]> {
    const results = await this.prisma.registrationrequest.findMany({
      where: {
        agency_id: agencyId,
        ...(status ? { status } : { NOT: { status: "pending" } }),
      },
      orderBy: { created_at: "desc" },
      skip,
      take,
    });

    return results.map(r => this.mapToEntity(r));
  }

  async countRequests(agencyId: number, status?: registrationrequest_status): Promise<number> {
    return this.prisma.registrationrequest.count({
      where: {
        agency_id: agencyId,
        ...(status ? { status } : { NOT: { status: "pending" } }),
      },
    });
  }

  async setLatestUnderReview(userId: number): Promise<RegistrationRequestEntity | null> {
    const last = await this.prisma.registrationrequest.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!last) return null;

    const updated = await this.prisma.registrationrequest.update({
      where: { id: last.id },
      data: { status: "under_review" },
    });

    return this.mapToEntity(updated);
  }

  async updateStatus(
    id: number,
    status: registrationrequest_status,
    reviewedBy?: number,
    reviewNotes?: string
  ): Promise<RegistrationRequestEntity> {
    const updated = await this.prisma.registrationrequest.update({
      where: { id },
      data: {
        status,
        reviewed_by: reviewedBy || null,
        review_notes: reviewNotes || null,
        reviewed_at: new Date(),
      },
    });

    return this.mapToEntity(updated);
  };
    async deleteByUserId(userId: number): Promise<number> {
    const result = await this.prisma.registrationrequest.deleteMany({
      where: { user_id: userId },
    });
    return result.count;
  }
}


// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../infrastructure/prisma/prisma.service';
// import { AgentRequestQueryResult } from '../../modules/registration-request/type/agent-request-query-result';
// import { IRegistrationRequestRepository } from './Iregistration-request.respository';
// import { RegistrationRequestCreateInput } from '../../modules/registration-request/type/registration-request-create';
// import { registrationrequest, registrationrequest_status, user_role, user_status } from '@prisma/client';

// @Injectable()
// export class RegistrationRequestRepository implements IRegistrationRequestRepository {
//  constructor(private prisma: PrismaService) {}
//    async create(data:RegistrationRequestCreateInput): Promise<number> {
//     const result = await this.prisma.registrationrequest.create({
//       data: {
//             user_id: data.userId,    
//         request_type: data.requestType,
//         id_card_number: data.idCardNumber,
//         agency_name: data.agencyName,
//         agency_id: data.agencyId,
//         supporting_documents: data.supportingDocuments,
//         status: data.status || 'pending',
//         requested_role: data.requestedRole,
//         license_number: data.licenseNumber,
//       },
//     });
    
//     return result.id;
//   }
//    async idCardExists(idCard: string): Promise<boolean> {
//     const result = await this.prisma.registrationrequest.findFirst({
//       where: {
//         id_card_number: idCard,
//       },
//       select: { id: true },
//     });

//     return result !== null;
//   }

// async findByAgencyIdAndStatus(
//   agencyId: number,
//   status?: registrationrequest_status,
//   skip = 0,
//   take = 10,
// ) {
//   return this.prisma.registrationrequest.findMany({
//     where: {
//       agency_id: agencyId,
//       ...(status ? { status } : { NOT: { status: 'pending' } }),
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           email: true,
//           username: true,
//         },
//       },
//     },
//     orderBy: { created_at: 'desc' },
//     skip,
//     take,
//   });
// }
//  async countAgentRequestsByAgencyId(
//   agencyId: number,
//   status?: registrationrequest_status, 
// ): Promise<number> {
//   return this.prisma.registrationrequest.count({
//     where: {
//       agency_id: agencyId,
//       ...(status ? { status } : { NOT: { status: 'pending' } }),
//     },
//   });
// }
// async setUnderReview(userId: number): Promise<registrationrequest | null> {
//   const latestRequest = await this.prisma.registrationrequest.findFirst({
//     where: { user_id: userId },
//     orderBy: { created_at: 'desc' },
//   });

//   if (!latestRequest) return null;

//   return this.prisma.registrationrequest.update({
//     where: { id: latestRequest.id },
//     data: { status: registrationrequest_status.under_review },
//   });
// }

// async UpdateRequestFields(
//   id: number,
//   status: registrationrequest_status,
//   reviewedBy?: number,
//   reviewNotes?: string,
// ): Promise<{
//   id: number;
//   status: registrationrequest_status;
//   reviewed_by: number | null;
//   review_notes: string | null;
//   reviewed_at: Date | null;
// }> {
//   return this.prisma.registrationrequest.update({
//     where: { id },
//     data: {
//       status,
//       ...(reviewedBy && { reviewed_by: reviewedBy }),
//       ...(reviewNotes && { review_notes: reviewNotes }),
//       reviewed_at: new Date(),
//     },
//     select: {
//       id: true,
//       status: true,
//       reviewed_by: true,
//       review_notes: true,
//       reviewed_at: true,
//     },
//   });
// }
//    async findByUserId(userId: number) {
//     return await this.prisma.registrationrequest.findMany({
//       where: {
//         user_id: userId,
//       },
//       orderBy: {
//         created_at: 'desc',
//       },
//     });
//   }


// async findRequestById(id: number): Promise<{
//   id: number;
//   user_id: number;
//   agency_id: number | null;
//   id_card_number: string | null;
//   user: {
//     email: string;
//     first_name: string | null;
//     last_name: string | null;
//     role:user_role;
//     status:user_status;
//   };
// } | null> {
//   return this.prisma.registrationrequest.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       user_id: true,
//       agency_id: true,
//       id_card_number:true,
//       user: {
//         select: {
//           email: true,
//           first_name: true,
//           last_name: true,
//           role:true,
//           status:true,
//         },
//       },
//     },
//   });
// } 
//   async deleteByUserId(userId: number): Promise<number> {
//     const result = await this.prisma.registrationrequest.deleteMany({
//       where: { user_id: userId },
//     });
//     return result.count;
//   }
// }
