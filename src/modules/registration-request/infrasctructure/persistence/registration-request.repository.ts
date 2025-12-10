import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";
import { Prisma, registrationrequest_status } from "@prisma/client";
import { RequestUserVO } from "../../domain/value-objects/request-user.vo";

@Injectable()
export class RegistrationRequestRepository implements IRegistrationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}


  private mapToEntity(data: any): RegistrationRequestEntity {
    return new RegistrationRequestEntity(
      data.id,
      data.user_id,
      data.agency_id,
      // data.agency_name,
      // data.id_card_number,
      data.request_type,
      data.status,
      data.requested_role,
      data.created_at,
      data.reviewed_by,
      data.review_notes,
      data.reviewed_at,
      // Add user mapping here
    data.user ? new RequestUserVO(
  data.user.email,
  data.user.first_name,  
  data.user.last_name,   
  data.user.role,
  data.user.status
) : undefined
    );
  }

  async create(req: RegistrationRequestEntity,   tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.registrationrequest.create({
      data: {
        user_id: req.userId,
        agency_id: req.agencyId,
        // agency_name: req.agencyName,
        // id_card_number: req.idCardNumber,
        request_type: req.requestType,
        requested_role: req.requestedRole,
        status: req.status,
      },
      select: { id: true },
    });

    return result.id;
  }

  // async idCardExists(idCard: string): Promise<boolean> {
  //   return !!(
  //     await this.prisma.registrationrequest.findFirst({
  //       where: { id_card_number: idCard },
  //     })
  //   );
  // }

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

  async findByAgencyIdAndStatus(
    agencyId: number,
    status?: registrationrequest_status,
    skip = 0,
    take = 10
  ): Promise<RegistrationRequestEntity[]> {
    const results = await this.prisma.registrationrequest.findMany({
      where: {
        agency_id: agencyId,
        ...(status
          ? { status }
          : { status: { not: "pending" } }),  
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

  async setLatestUnderReview(userId: number , tx?:Prisma.TransactionClient): Promise<RegistrationRequestEntity | null> {
   const client =tx ?? this.prisma;
    const last = await client.registrationrequest.findFirst({
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
    reviewNotes?: string,
    tx?: Prisma.TransactionClient
  ): Promise<RegistrationRequestEntity> {
    const client =tx ?? this.prisma
    const updated = await client.registrationrequest.update({
      where: { id },
      data: {
        status,
        reviewed_by: reviewedBy || null,
        review_notes: reviewNotes || null,
        reviewed_at: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async deleteByUserId(userId: number): Promise<number> {
    const result = await this.prisma.registrationrequest.deleteMany({
      where: { user_id: userId },
    });
    return result.count;
  }
}