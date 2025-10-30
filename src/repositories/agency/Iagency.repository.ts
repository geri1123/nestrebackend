import { agency } from '@prisma/client';
import { AgencyInfo } from '../../agency/types/agency-info.js';
import { PlainAgencyInput } from '../../agency/types/agency-create-input.js';

export interface IAgencyRepository {
  licenseExists(license: string): Promise<boolean>;

  getAgencyInfoByOwner(userId: number): Promise<AgencyInfo | null>;

  findByOwnerUserId(ownerUserId: number): Promise<{ id: number } | null>;

  findByPublicCode(publicCode: string): Promise<agency | null>;

  findLogoById(agencyId: number): Promise<{ logo: string | null } | null>;

  findWithOwnerById(
    agencyId: number
  ): Promise<{ id: number; agency_name: string; owner_user_id: number } | null>;

  agencyNameExist(agencyName: string): Promise<boolean>;

  create(
    agencyData: Omit<PlainAgencyInput, 'id' | 'public_code' | 'status'>
  ): Promise<number>;
 getAllAgencies(skip: number, take: number): Promise<agency[]> 
  activateAgency(agencyId: number): Promise<void>;
countAgencies(): Promise<number>;
  updateAgencyFields(
    agencyId: number,
    fields: Partial<
      Omit<PlainAgencyInput, 'id' | 'created_at' | 'public_code' | 'updated_at'>
    >
  ): Promise<void>;
}
