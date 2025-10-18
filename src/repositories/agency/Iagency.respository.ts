import {  agency   } from '@prisma/client';
import { PlainAgencyInput } from '../../agency/types/agency-create-input.js'
import { AgencyInfo } from '../../agency/types/agency-info.js';
export interface IAgencyRepository {

  licenseExists(license: string): Promise<boolean>;
  findAgencyByUserId(userId: number): Promise<AgencyInfo | null>;
  findByOwnerUserId(ownerUserId: number): Promise<{ id: number } | null>;
  findByPublicCode(publicCode: string): Promise<agency | null>;
  findLogoById(agencyId: number): Promise<{ logo: string | null } | null>;
  findWithOwnerById(agencyId: number): Promise<{ id: number; agency_name: string; owner_user_id: number } | null>;
  agencyNameExist(agencyName: string): Promise<boolean>;
  create(agencyData: AgencyInfo): Promise<number> ;
  activateAgency(agencyId: number): Promise<void>;
  updateAgencyFields(
    agencyId: number,
      fields: Partial<PlainAgencyInput>
  ): Promise<void>;
}