import { AgencyStatus } from '../../domain/types/agency-status.type';
 
export interface AgencyData {
  id: number;
  name: string;
  email: string | null;
  logo: string | null;
  status: AgencyStatus;
  address: string | null;
  phone: string | null;
  website: string | null;
  licenseNumber: string;
  publicCode: string | null;
}
 
export const AGENCY_OWNER_PROFILE_PORT = Symbol('AGENCY_OWNER_PROFILE_PORT');
 
export interface IAgencyOwnerProfilePort {
  getAgencyData(userId: number, lang: string): Promise<AgencyData>;
}
 