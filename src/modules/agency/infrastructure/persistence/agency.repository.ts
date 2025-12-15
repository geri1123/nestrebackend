import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { Agency } from '../../domain/entities/agency.entity';
import { AgencyInfoVO } from '../../domain/value-objects/agency-info.vo';
import { agency_status, Prisma } from '@prisma/client';
import { generatePublicCode } from '../../../../common/utils/hash';

@Injectable()
export class AgencyRepository implements IAgencyDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // QUERY METHODS
  // ---------------------------------------------------------------------------

  async findById(id: number): Promise<Agency | null> {
    const data = await this.prisma.agency.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async getAgencyWithOwnerById(id: number): Promise<{
    id: number;
    agency_name: string;
    owner_user_id: number;
  } | null> {
    return this.prisma.agency.findUnique({
      where: { id },
      select: {
        id: true,
        agency_name: true,
        owner_user_id: true,
      },
    });
  }

  async findByOwnerUserId(ownerUserId: number): Promise<Agency | null> {
    const data = await this.prisma.agency.findFirst({
      where: { owner_user_id: ownerUserId },
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findByPublicCode(publicCode: string): Promise<Agency | null> {
    const data = await this.prisma.agency.findUnique({
      where: { public_code: publicCode },
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
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!agency) return null;

    return {
      id: agency.id,
      agencyName: agency.agency_name,
      licenseNumber: agency.license_number,
      address: agency.address,
      status: agency.status,
      publicCode: agency.public_code,
      agencyEmail: agency.agency_email,
      phone: agency.phone,
      website: agency.website,
      logo: agency.logo,
      ownerUserId: agency.owner_user_id,
      ownerName: agency.user
        ? `${agency.user.first_name} ${agency.user.last_name}`
        : undefined,
      ownerEmail: agency.user?.email ?? undefined,
      createdAt: agency.created_at,
    };
  }

  // 👇 UPDATED METHOD
  async findLogoById(agencyId: number): Promise<{ 
    logo: string | null; 
    logoPublicId: string | null; 
  } | null> {
    const result = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: { 
        logo: true,
        logo_public_id: true, 
      },
    });

    if (!result) return null;

    return {
      logo: result.logo,
      logoPublicId: result.logo_public_id,
    };
  }

  async getAllAgencies(skip: number, limit: number): Promise<any[]> {
    return this.prisma.agency.findMany({
      where: { status: agency_status.active },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });
  }

  async countAgencies(): Promise<number> {
    return this.prisma.agency.count({
      where: { status: agency_status.active },
    });
  }

  // ---------------------------------------------------------------------------
  // VALIDATION METHODS
  // ---------------------------------------------------------------------------

  async agencyNameExists(name: string): Promise<boolean> {
    const exists = await this.prisma.agency.findFirst({
      where: { agency_name: name },
      select: { id: true },
    });
    return exists !== null;
  }

  async licenseExists(license: string): Promise<boolean> {
    const exists = await this.prisma.agency.findFirst({
      where: { license_number: license },
      select: { id: true },
    });
    return exists !== null;
  }

  // ---------------------------------------------------------------------------
  // COMMAND METHODS
  // ---------------------------------------------------------------------------

  async create(
    data: {
      agency_name: string;
      license_number: string;
      address: string;
      owner_user_id: number;
      status: agency_status;
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
        ...data,
        public_code: publicCode,
      },
      select: { id: true },
    });

    return newAgency.id;
  }

  async updateFields(agencyId: number, data: any): Promise<Agency> {
    // Map camelCase to snake_case for Prisma
    const prismaData: any = {};
    
    if (data.logo !== undefined) prismaData.logo = data.logo;
    if (data.logoPublicId !== undefined) prismaData.logo_public_id = data.logoPublicId;
    if (data.agencyName !== undefined) prismaData.agency_name = data.agencyName;
    if (data.agencyEmail !== undefined) prismaData.agency_email = data.agencyEmail;
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
      data: { status: agency_status.active },
    });
  }

  
  async deleteLogo(agencyId: number): Promise<void> {
    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { 
        logo: null,
        logo_public_id: null, 
      },
    });
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private async publicCodeExists(publicCode: string): Promise<boolean> {
    const existing = await this.prisma.agency.findUnique({
      where: { public_code: publicCode },
      select: { id: true },
    });
    return existing !== null;
  }

  // 👇 UPDATED METHOD
  private mapToEntity(data: any): Agency {
    return Agency.create({
      id: data.id,
      agencyName: data.agency_name,
      licenseNumber: data.license_number,
      address: data.address,
      ownerUserId: data.owner_user_id,
      status: data.status,
      publicCode: data.public_code,
      logoPublicId: data.logo_public_id, 
      agencyEmail: data.agency_email,
      phone: data.phone,
      website: data.website,
      logo: data.logo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  async deleteByOwnerUserId(ownerUserId: number): Promise<number> {
    const result = await this.prisma.agency.deleteMany({
      where: { owner_user_id: ownerUserId },
    });
    return result.count;
  }
}