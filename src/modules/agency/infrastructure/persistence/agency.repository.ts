import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { Agency } from '../../domain/entities/agency.entity';
import { AgencyInfoVO } from '../../domain/value-objects/agency-info.vo';
import { AgencyStatus, Prisma } from '@prisma/client';
import { generatePublicCode } from '../../../../common/utils/hash';

@Injectable()
export class AgencyRepository implements IAgencyDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  // QUERY METHODS

  async findById(id: number): Promise<Agency | null> {
    const data = await this.prisma.agency.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async getAgencyWithOwnerById(id: number): Promise<{
    id: number;
    agency_name: string;
    owner_user_id: number;
  } | null> {
    const result = await this.prisma.agency.findUnique({
      where: { id },
      select: {
        id: true,
        agencyName: true,
        ownerUserId: true,
      },
    });

    if (!result) return null;

    // Map camelCase to snake_case
    return {
      id: result.id,
      agency_name: result.agencyName,
      owner_user_id: result.ownerUserId,
    };
  }

  async findByOwnerUserId(ownerUserId: number): Promise<Agency | null> {
    const data = await this.prisma.agency.findFirst({
      where: { ownerUserId: ownerUserId },
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findByPublicCode(publicCode: string): Promise<Agency | null> {
    const data = await this.prisma.agency.findUnique({
      where: { publicCode: publicCode },
    });
    return data ? this.mapToEntity(data) : null;
  }

  async getAgencyInfoByOwner(agencyId: number): Promise<AgencyInfoVO | null> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!agency) return null;

    return {
      id: agency.id,
      agencyName: agency.agencyName,
      licenseNumber: agency.licenseNumber,
      address: agency.address,
      status: agency.status,
      publicCode: agency.publicCode,
      agencyEmail: agency.agencyEmail,
      phone: agency.phone,
      website: agency.website,
      logo: agency.logo,
      ownerUserId: agency.ownerUserId,
      ownerName: agency.user
        ? `${agency.user.firstName} ${agency.user.lastName}`
        : undefined,
      ownerEmail: agency.user?.email ?? undefined,
      createdAt: agency.createdAt,
    };
  }

  async findLogoById(agencyId: number): Promise<{ 
    logo: string | null; 
    logoPublicId: string | null; 
  } | null> {
    const result = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: { 
        logo: true,
        logoPublicId: true, 
      },
    });

    if (!result) return null;

    return {
      logo: result.logo,
      logoPublicId: result.logoPublicId,
    };
  }

  async getAllAgenciesPaginated(
    skip: number,
    limit: number,
    search?: string,
  ): Promise<{
    id: number;
    agency_name: string;
    logo: string | null;
    address: string | null;
    phone: string | null;
    agency_email: string | null;
    public_code: string | null;
    created_at: Date;
  }[]> {
    const words =
      search && search.trim().length >= 3
        ? search.trim().toLowerCase().split(/\s+/)
        : undefined;

    const results = await this.prisma.agency.findMany({
      where: {
        status: AgencyStatus.active,
        ...(words && {
          AND: words.map(word => ({
            OR: [
              { 
                agencyName: { 
                  contains: word,
                } 
              },
              { 
                address: { 
                  contains: word,
                } 
              },
            ],
          })),
        }),
      },
      select: {
        id: true,
        agencyName: true,
        logo: true,
        address: true,
        phone: true,           
        agencyEmail: true,    
        publicCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Map camelCase to snake_case
    return results.map(result => ({
      id: result.id,
      agency_name: result.agencyName,
      logo: result.logo,
      address: result.address,
      phone: result.phone,
      agency_email: result.agencyEmail,
      public_code: result.publicCode,
      created_at: result.createdAt,
    }));
  }

  async countAgencies(search?: string): Promise<number> {
    const words =
      search && search.trim().length >= 3
        ? search.trim().split(/\s+/)
        : undefined;

    return this.prisma.agency.count({
      where: {
        status: AgencyStatus.active,
        ...(words && {
          AND: words.map(word => ({
            OR: [
              { agencyName: { contains: word } },
              { address: { contains: word } },
            ],
          })),
        }),
      },
    });
  }

  // VALIDATION METHODS

  async agencyNameExists(name: string): Promise<boolean> {
    const exists = await this.prisma.agency.findFirst({
      where: { agencyName: name },
      select: { id: true },
    });
    return exists !== null;
  }

  async licenseExists(license: string): Promise<boolean> {
    const exists = await this.prisma.agency.findFirst({
      where: { licenseNumber: license },
      select: { id: true },
    });
    return exists !== null;
  }

  // COMMAND METHODS

  async create(
    data: {
      agency_name: string;
      license_number: string;
      address: string;
      owner_user_id: number;
      status: AgencyStatus;
    },
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx ?? this.prisma;
    let publicCode: string;

    do {
      publicCode = generatePublicCode();
    } while (await this.publicCodeExists(publicCode));

    const newAgency = await client.agency.create({
      data: {
        agencyName: data.agency_name,        
        licenseNumber: data.license_number,  
        address: data.address,
        ownerUserId: data.owner_user_id,     
        status: data.status,
        publicCode: publicCode,
      },
      select: { id: true },
    });

    return newAgency.id;
  }

  async updateFields(agencyId: number, data: any): Promise<Agency> {
    const prismaData: any = {};
    
    if (data.logo !== undefined) prismaData.logo = data.logo;
    if (data.logoPublicId !== undefined) prismaData.logoPublicId = data.logoPublicId;
    if (data.agencyName !== undefined) prismaData.agencyName = data.agencyName;
    if (data.agencyEmail !== undefined) prismaData.agencyEmail = data.agencyEmail;
    if (data.phone !== undefined) prismaData.phone = data.phone;
    if (data.address !== undefined) prismaData.address = data.address;
    if (data.website !== undefined) prismaData.website = data.website;
    if (data.status !== undefined) prismaData.status = data.status;

    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data: prismaData,
    });

    return this.mapToEntity(updated);
  }

  async activateAgency(agencyId: number, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prisma;
    await client.agency.update({
      where: { id: agencyId },
      data: { status: AgencyStatus.active },
    });
  }

  async deleteLogo(agencyId: number): Promise<void> {
    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { 
        logo: null,
        logoPublicId: null, 
      },
    });
  }

  // PRIVATE HELPERS

  private async publicCodeExists(publicCode: string): Promise<boolean> {
    const existing = await this.prisma.agency.findUnique({
      where: { publicCode: publicCode },
      select: { id: true },
    });
    return existing !== null;
  }

  // Map Prisma camelCase to entity snake_case
  private mapToEntity(data: any): Agency {
    return Agency.create({
      id: data.id,
      agencyName: data.agencyName,
      licenseNumber: data.licenseNumber,
      address: data.address,
      ownerUserId: data.ownerUserId,
      status: data.status,
      publicCode: data.publicCode,
      logoPublicId: data.logoPublicId, 
      agencyEmail: data.agencyEmail,
      phone: data.phone,
      website: data.website,
      logo: data.logo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async deleteByOwnerUserId(ownerUserId: number): Promise<number> {
    const result = await this.prisma.agency.deleteMany({
      where: { ownerUserId: ownerUserId },
    });
    return result.count;
  }
}