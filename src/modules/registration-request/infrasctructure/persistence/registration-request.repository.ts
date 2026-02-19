import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";
import { Prisma, RegistrationRequestStatus } from "@prisma/client";
import { RequestUserVO } from "../../domain/value-objects/request-user.vo";

@Injectable()
export class RegistrationRequestRepository implements IRegistrationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): RegistrationRequestEntity {
    return new RegistrationRequestEntity(
      data.id,
      data.userId,
      data.agencyId,
      data.requestType,
      data.status,
      data.requestedRole,
      data.createdAt,
      data.reviewedBy,
      data.reviewNotes,
      data.reviewedAt,
      // Add user mapping here
      data.user ? new RequestUserVO(
        data.user.email,
        data.user.firstName,  
        data.user.lastName,   
        data.user.role,
        data.user.status,
        data.user.username,
      ) : undefined,
      data.reviewedByUser
        ? new RequestUserVO(
            data.reviewedByUser.email,
            undefined,
            undefined,
            data.reviewedByUser.role,
            undefined,
            data.reviewedByUser.username,
          )
        : undefined
    );
  }

  async create(req: RegistrationRequestEntity, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.registrationRequest.create({
      data: {
        userId: req.userId,
        agencyId: req.agencyId,
        requestType: req.requestType,
        requestedRole: req.requestedRole,
        status: req.status,
      },
      select: { id: true },
    });

    return result.id;
  }
async findActiveRequestByUserId(userId: number): Promise<RegistrationRequestEntity | null> {
  const data = await this.prisma.registrationRequest.findFirst({
    where: { 
      userId,
      status: { in: [RegistrationRequestStatus.approved , RegistrationRequestStatus.pending , RegistrationRequestStatus.under_review] }
    },
    orderBy: { createdAt: "desc" }
  });

  return data ? this.mapToEntity(data) : null;
}
  // async findByUserId(userId: number): Promise<RegistrationRequestEntity[]> {
  //   const data = await this.prisma.registrationRequest.findMany({
  //     where: { userId: userId },
  //     orderBy: { createdAt: "desc" }
  //   });

  //   return data.map(d => this.mapToEntity(d));
  // }

  async findById(id: number): Promise<RegistrationRequestEntity | null> {
    const result = await this.prisma.registrationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        },
      },
    });

    return result ? this.mapToEntity(result) : null;
  }

  // async findByAgencyIdAndStatus(
  //   agencyId: number,
  //   status?: RegistrationRequestStatus,
  //   skip = 0,
  //   take = 10
  // ): Promise<RegistrationRequestEntity[]> {
  //   const results = await this.prisma.registrationRequest.findMany({
  //     where: {
  //       agencyId: agencyId,
  //       ...(status
  //         ? { status }
  //         : { status: { not: "pending" } }),  
  //     },
  //     orderBy: { createdAt: "desc" },
  //     skip,
  //     take,
  //     include: {
  //       user: {
  //         select: {
  //           email: true,
  //           firstName: true,
  //           lastName: true,
  //           username: true,
  //           role: true,      
  //           status: true,    
  //         },
  //       },
  //       reviewedByUser: { 
  //         select: {
  //           email: true,
  //           username: true,
  //           role: true,
  //         },
  //       },
  //     },
  //   });

  //   return results.map(r => this.mapToEntity(r));
  // }

async findByAgencyIdAndStatus(
  agencyId: number,
  status?: RegistrationRequestStatus,
  skip = 0,
  take = 10,
  search?: string,
): Promise<RegistrationRequestEntity[]> {
   const searchFilter = search
    ? {
        OR: [
          { user: { firstName: { contains: search } } },
          { user: { lastName: { contains: search} } },
          { user: { email: { contains: search } } },
          { user: { username: { contains: search} } },
        ],
      }
    : {};

  const results = await this.prisma.registrationRequest.findMany({
    where: {
      agencyId,
      ...(status ? { status } : { status: { not: "pending" } }),
      ...searchFilter,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          status: true,
        },
      },
      reviewedByUser: {
        select: {
          email: true,
          username: true,
          role: true,
        },
      },
    },
  });

  return results.map(r => this.mapToEntity(r));
}

async countRequests(
  agencyId: number,
  status?: RegistrationRequestStatus,
  search?: string,
): Promise<number> {
 const searchFilter = search
    ? {   
      OR: [
          { user: { firstName: { contains: search } } },
          { user: { lastName: { contains: search} } },
          { user: { email: { contains: search} } },
          { user: { username: { contains: search} } },
        ],
      }
    : {};

  return this.prisma.registrationRequest.count({
    where: {
      agencyId,
      ...(status ? { status } : { NOT: { status: "pending" } }),
      ...searchFilter,
    },
  });
}
  // async countRequests(agencyId: number, status?: RegistrationRequestStatus): Promise<number> {
  //   return this.prisma.registrationRequest.count({
  //     where: {
  //       agencyId: agencyId,
  //       ...(status ? { status } : { NOT: { status: "pending" } }),
  //     },
  //   });
  // }

  async setLatestUnderReview(
    userId: number,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const client = tx ?? this.prisma;

    const last = await client.registrationRequest.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    if (!last) return false;

    await client.registrationRequest.update({
      where: { id: last.id },
      data: { status: "under_review" },
    });

    return true;
  }

  async updateStatus(
    id: number,
    status: RegistrationRequestStatus,
    reviewedBy?: number,
    reviewNotes?: string,
    tx?: Prisma.TransactionClient
  ): Promise<RegistrationRequestEntity> {
    const client = tx ?? this.prisma;
    const updated = await client.registrationRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewedBy || null,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async deleteByUserId(userId: number): Promise<number> {
    const result = await this.prisma.registrationRequest.deleteMany({
      where: { userId: userId },
    });
    return result.count;
  }
}