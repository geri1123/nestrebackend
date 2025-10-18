import { Injectable } from '@nestjs/common';
import {  registrationrequest_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AgentRequestQueryResult } from '../../registration-request/type/agent-request-query-result.js';
import { IRegistrationRequestRepository } from './Iregistration-request.respository.js';
import { RegistrationRequestCreateInput } from '../../registration-request/type/registration-request-create.js';
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
//findagentRequestsByAgencyId
 async findAgentRequestsByAgencyId(
    agencyId: number,
    limit: number,
    offset: number
  ): Promise<{ data: AgentRequestQueryResult[]; total: number }> {

    const whereCondition = {
      agency_id: agencyId,
      user: {
        email_verified: true,
      },
    };

    const [registrationRequests, totalCount] = await Promise.all([
      this.prisma.registrationrequest.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              first_name: true,
              last_name: true,
              email_verified: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      
      this.prisma.registrationrequest.count({
        where: whereCondition,
      }),
    ]);

    const formattedData: AgentRequestQueryResult[] = registrationRequests.map((request) => ({
      id: request.id,
      requestType: request.request_type,
      idCardNumber: request.id_card_number,
      status: request.status,
      username: request.user.username,
      email: request.user.email,
      firstName: request.user.first_name,
      lastName: request.user.last_name,
      emailVerified: request.user.email_verified,
      createdAt: request.created_at,
    }));

    return {
      data: formattedData,
      total: totalCount,
    };
  }
 
   async countAgentRequestsByAgencyId(agencyId: number): Promise<number> {
    return await this.prisma.registrationrequest.count({
      where: {
        // request_type: 'agent_license_verification',
        user: {
          email_verified: true,
           agencyAgentAgent: {
            some: {
              agency_id: agencyId,
            },
          },
        },
      },
    });
  }

  

   async updateStatus(
    id: number,
    status: registrationrequest_status,
    reviewedBy?: number,
    reviewNotes?: string
  ) {
    return await this.prisma.registrationrequest.update({
      where: { id },
      data: {
        status,
        reviewed_by: reviewedBy,
        review_notes: reviewNotes,
        reviewed_at: new Date(),
      },
    });
  }

  /**
   * Get all pending registration requests
   */
   async findPendingRequests(limit?: number) {
    return await this.prisma.registrationrequest.findMany({
      where: {
        status: 'pending',
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc', 
      },
      ...(limit && { take: limit }),
    });
  }

  //find byUserId
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
//findById
    async findById(id: number) {
    return await this.prisma.registrationrequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
        agency: {
          select: {
            id: true,
            agency_name: true,
            license_number: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}

 