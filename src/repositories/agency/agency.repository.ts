import { Injectable } from '@nestjs/common';
import { generatePublicCode } from '../../common/utils/hash';
import {   agency   } from '@prisma/client';
import { AgencyInfo } from '../../modules/agency/types/agency-info';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PlainAgencyInput } from '../../modules/agency/types/agency-create-input';
import { IAgencyRepository } from './Iagency.repository';
@Injectable()
export class AgencyRepository implements IAgencyRepository {
  constructor(private prisma : PrismaService) {}
 async getAgencyInfoByOwner(agencyId: number): Promise<AgencyInfo | null> {
  const agency = await this.prisma.agency.findFirst({
    where: { id: agencyId },
    select: {
      id: true,
      agency_name: true,
      logo: true,
      license_number: true,
      phone: true,
      website: true,
      status: true,
      public_code: true,
      agency_email: true,
      address: true,
      owner_user_id: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!agency) return null;

  
  return agency as AgencyInfo;
}
 

  async licenseExists(license: string): Promise<boolean> {
    const agency = await this.prisma.agency.findFirst({
      where: { license_number: license },
      select: { id: true },
    });
    return agency !== null;
  }
async findLogoById(agencyId: number): Promise<{ logo: string | null } | null> {
  return this.prisma.agency.findUnique({
    where: { id: agencyId },
    select: { logo: true },
  });
}
async findWithOwnerById(agencyId: number): Promise<{ id: number; agency_name: string; owner_user_id: number } | null> {
  return this.prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      id: true,
      agency_name: true,
      owner_user_id: true,
      status:true,
    },
  });
}
  async findByOwnerUserId(ownerUserId: number): Promise<{ id: number } | null> {
  const agency = await this.prisma.agency.findFirst({
    where: { owner_user_id: ownerUserId },
    select: { id: true },
  });
  return agency || null;
}
  
  async findByPublicCode(publicCode: string): Promise<agency | null> {
    return this.prisma.agency.findUnique({
      where: { public_code: publicCode },
    });
  }

  async agencyNameExist(agencyName: string): Promise<boolean> {
    const agency = await this.prisma.agency.findFirst({
      where: { agency_name: agencyName },
      select: { id: true },
    });
    return agency !== null;
  }

 async create(agencyData: PlainAgencyInput): Promise<number> {
  let publicCode: string;
  do {
    publicCode = generatePublicCode();
  } while (await this.publicCodeExists(publicCode));

  const newAgency = await this.prisma.agency.create({
    data: {
      ...agencyData,
      public_code: publicCode,
      status: 'inactive',
    },
    select: { id: true },
  });

  return newAgency.id;
}
  private async publicCodeExists(publicCode: string): Promise<boolean> {
    const existing = await this.prisma.agency.findUnique({
      where: { public_code: publicCode },
      select: { id: true },
    });
    return existing !== null;
  }
async activateAgency(agencyId: number): Promise<void> {
  await this.prisma.agency.update({
    where: { id: agencyId },
    data: { status: 'active' },
  });
}
  
async getAllAgencies(skip: number, take: number): Promise<agency[]> {
  return this.prisma.agency.findMany({
    where: { status: 'active' },
    orderBy: { created_at: 'desc' },
    skip,
    take,
  });
} async countAgencies(): Promise<number> {
    return this.prisma.agency.count({
      where: { status: 'active' },
    });
  }
  async updateAgencyFields(
    agencyId: number,
    fields: Partial<PlainAgencyInput>
  ): Promise<void> {
    const allowedFields = [
      'agency_name',
      'logo',
      'license_number',
      'agency_email',
      'phone',
      'address',
      'website',
      'status',
    ] as const;

    const filteredData = Object.fromEntries(
      Object.entries(fields).filter(
        ([key, val]) => val !== undefined && allowedFields.includes(key as typeof allowedFields[number])
      )
    ) as Partial<PlainAgencyInput>;

    if (Object.keys(filteredData).length === 0) return;

    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { ...filteredData },
    });
  }
  
}
