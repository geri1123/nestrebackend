import { agency_status } from '@prisma/client';
import { Agency } from '../entities/agency.entity';
import { AgencyInfoVO } from '../value-objects/agency-info.vo';

export interface IAgencyDomainRepository {
  // Query methods
  findById(id: number): Promise<Agency | null>;
  findByOwnerUserId(ownerUserId: number): Promise<Agency | null>;
  findByPublicCode(publicCode: string): Promise<Agency | null>;
  getAgencyInfoByOwner(agencyId: number): Promise<AgencyInfoVO | null>;
  findLogoById(agencyId: number): Promise<{ logo: string | null } | null>
  getAllAgencies(skip: number, limit: number): Promise<any[]>;
  countAgencies(): Promise<number>;

  // Validation methods
  agencyNameExists(agencyName: string): Promise<boolean>;
  licenseExists(licenseNumber: string): Promise<boolean>;

  // Command methods
  create(data: {
    agency_name: string;
    license_number: string;
    address: string;
    owner_user_id: number;
    status: agency_status;
  }): Promise<number>;

  updateFields(agencyId: number, data: any): Promise<Agency>;
  activateAgency(agencyId: number): Promise<void>;
  deleteLogo(agencyId: number): Promise<void>;
}
