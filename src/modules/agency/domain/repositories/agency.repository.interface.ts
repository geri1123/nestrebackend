
import { agency_status, Prisma } from '@prisma/client';
import { Agency } from '../entities/agency.entity';
import { AgencyInfoVO } from '../value-objects/agency-info.vo';

export const AGENCY_REPO = Symbol('AGENCY_REPO');

export interface IAgencyDomainRepository {
  // Query methods
  findById(id: number): Promise<Agency | null>;
  findByOwnerUserId(ownerUserId: number): Promise<Agency | null>;
  findByPublicCode(publicCode: string): Promise<Agency | null>;
  getAgencyInfoByOwner(agencyId: number): Promise<AgencyInfoVO | null>;
  findLogoById(agencyId: number): Promise<{ 
    logo: string | null; 
    logoPublicId: string | null; 
  } | null>;
  getAllAgencies(skip: number, limit: number, search?: string): Promise<any[]>;
  countAgencies(search?: string): Promise<number>;
  getAgencyWithOwnerById(id: number): Promise<{
    id: number;
    agency_name: string;
    owner_user_id: number;
  } | null>;

  // Validation methods
  agencyNameExists(agencyName: string): Promise<boolean>;
  licenseExists(licenseNumber: string): Promise<boolean>;

  // Command methods
  create(
    data: {
      agency_name: string;
      license_number: string;
      address: string;
      owner_user_id: number;
      status: agency_status;
    },
    tx?: Prisma.TransactionClient
  ): Promise<number>;

  updateFields(agencyId: number, data: any): Promise<Agency>;
  activateAgency(agencyId: number, tx?: Prisma.TransactionClient): Promise<void>;
  deleteLogo(agencyId: number): Promise<void>;
  deleteByOwnerUserId(ownerUserId: number): Promise<number>;
}