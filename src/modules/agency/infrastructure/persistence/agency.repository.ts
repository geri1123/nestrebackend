import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { Agency } from '../../domain/entities/agency.entity';
import { AgencyInfoVO } from '../../domain/value-objects/agency-info.vo';
import { agency_status } from '@prisma/client';
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
    address: agency.address,                 // string | null
    status: agency.status,
    publicCode: agency.public_code,
    agencyEmail: agency.agency_email,        // string | null
    phone: agency.phone,                     // string | null
    website: agency.website,                 // string | null
    logo: agency.logo,                       // string | null
    ownerUserId: agency.owner_user_id,
    ownerName: agency.user
      ? `${agency.user.first_name} ${agency.user.last_name}`
      : undefined,
    ownerEmail: agency.user?.email ?? undefined,
    createdAt: agency.created_at,
  };
}

  async findLogoById(agencyId: number): Promise<{ logo: string | null } | null> {
  return this.prisma.agency.findUnique({
    where: { id: agencyId },
    select: { logo: true },
  });
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

  async create(data: {
    agency_name: string;
    license_number: string;
    address: string;
    owner_user_id: number;
    status: agency_status;
  }): Promise<number> {
    let publicCode: string;

    do {
      publicCode = generatePublicCode();
    } while (await this.publicCodeExists(publicCode));

    const newAgency = await this.prisma.agency.create({
      data: {
        ...data,
        public_code: publicCode,
      },
      select: { id: true },
    });

    return newAgency.id;
  }

  async updateFields(agencyId: number, data: any): Promise<Agency> {
    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data,
    });

    return this.mapToEntity(updated);
  }

  async activateAgency(agencyId: number): Promise<void> {
    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { status: agency_status.active },
    });
  }

  async deleteLogo(agencyId: number): Promise<void> {
    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { logo: null },
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

  private mapToEntity(data: any): Agency {
    return Agency.create({
      id: data.id,
      agencyName: data.agency_name,
      licenseNumber: data.license_number,
      address: data.address,
      ownerUserId: data.owner_user_id,
      status: data.status,
      publicCode: data.public_code,
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
// import { Injectable } from '@nestjs/common';
// import { generatePublicCode } from '../../common/utils/hash';
// import {   agency   } from '@prisma/client';
// import { AgencyInfo } from '../../modules/agency/types/agency-info';
// import { PrismaService } from '../../infrastructure/prisma/prisma.service';
// import { PlainAgencyInput } from '../../modules/agency/types/agency-create-input';
// import { IAgencyRepository } from './Iagency.repository';
// @Injectable()
// export class AgencyRepository implements IAgencyRepository {
//   constructor(private prisma : PrismaService) {}
//  async getAgencyInfoByOwner(agencyId: number): Promise<AgencyInfo | null> {
//   const agency = await this.prisma.agency.findUnique({
//     where: { id: agencyId },
//     select: {
//       id: true,
//       agency_name: true,
//       logo: true,
//       license_number: true,
//       phone: true,
//       website: true,
//       status: true,
//       public_code: true,
//       agency_email: true,
//       address: true,
//       owner_user_id: true,
//       created_at: true,
//       updated_at: true,
//       user: { 
//         select: {
//           username: true,
//           first_name: true,
//           last_name: true,
//         },
//       },
//     },
//   });

//   if (!agency) return null;

//   return agency as AgencyInfo;
// }

//   async licenseExists(license: string): Promise<boolean> {
//     const agency = await this.prisma.agency.findFirst({
//       where: { license_number: license },
//       select: { id: true },
//     });
//     return agency !== null;
//   }
// async findLogoById(agencyId: number): Promise<{ logo: string | null } | null> {
//   return this.prisma.agency.findUnique({
//     where: { id: agencyId },
//     select: { logo: true },
//   });
// }
// async findWithOwnerById(
//   agencyId: number
// ): Promise<{ id: number; agency_name: string; owner_user_id: number; status: string; } | null> {
  
//   return this.prisma.agency.findUnique({
//     where: { id: agencyId },
//     select: {
//       id: true,
//       agency_name: true,
//       owner_user_id: true,
//       status: true,
      
//     },
//   });
// }
//   async findByOwnerUserId(ownerUserId: number): Promise<{ id: number } | null> {
//   const agency = await this.prisma.agency.findFirst({
//     where: { owner_user_id: ownerUserId },
//     select: { id: true },
//   });
//   return agency || null;
// }
  
//   async findByPublicCode(publicCode: string): Promise<agency | null> {
//     return this.prisma.agency.findUnique({
//       where: { public_code: publicCode },
//     });
//   }

//   async agencyNameExist(agencyName: string): Promise<boolean> {
//     const agency = await this.prisma.agency.findFirst({
//       where: { agency_name: agencyName },
//       select: { id: true },
//     });
//     return agency !== null;
//   }

//  async create(agencyData: PlainAgencyInput): Promise<number> {
//   let publicCode: string;
//   do {
//     publicCode = generatePublicCode();
//   } while (await this.publicCodeExists(publicCode));

//   const newAgency = await this.prisma.agency.create({
//     data: {
//       ...agencyData,
//       public_code: publicCode,
//       // status: 'inactive',
//       status: agencyData.status ?? 'inactive',
//     },
//     select: { id: true },
//   });

//   return newAgency.id;
// }
//   private async publicCodeExists(publicCode: string): Promise<boolean> {
//     const existing = await this.prisma.agency.findUnique({
//       where: { public_code: publicCode },
//       select: { id: true },
//     });
//     return existing !== null;
//   }
// async activateAgency(agencyId: number): Promise<void> {
//   await this.prisma.agency.update({
//     where: { id: agencyId },
//     data: { status: 'active' },
//   });
// }
  
// async getAllAgencies(skip: number, take: number): Promise<agency[]> {
//   return this.prisma.agency.findMany({
//     where: { status: 'active' },
//     orderBy: { created_at: 'desc' },
//     skip,
//     take,
//   });
// } async countAgencies(): Promise<number> {
//     return this.prisma.agency.count({
//       where: { status: 'active' },
//     });
//   }
//   async updateAgencyFields(
//     agencyId: number,
//     fields: Partial<PlainAgencyInput>
//   ): Promise<void> {
//     const allowedFields = [
//       'agency_name',
//       'logo',
//       'license_number',
//       'agency_email',
//       'phone',
//       'address',
//       'website',
//       'status',
//     ] as const;

//     const filteredData = Object.fromEntries(
//       Object.entries(fields).filter(
//         ([key, val]) => val !== undefined && allowedFields.includes(key as typeof allowedFields[number])
//       )
//     ) as Partial<PlainAgencyInput>;

//     if (Object.keys(filteredData).length === 0) return;

//     await this.prisma.agency.update({
//       where: { id: agencyId },
//       data: { ...filteredData },
//     });
//   }
//  async deleteLogo(agencyId: number): Promise<void> {
//   await this.prisma.agency.update({
//     where: { id: agencyId },
//     data: {
//       logo: null,
//     },
//   });
// };
// async deleteByOwnerUserId(ownerUserId: number): Promise<number> {
//     const result = await this.prisma.agency.deleteMany({
//       where: { owner_user_id: ownerUserId },
//     });
//     return result.count;
//   }

// }
