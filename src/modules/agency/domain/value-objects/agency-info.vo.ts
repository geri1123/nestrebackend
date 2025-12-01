import { agency_status } from "@prisma/client";

export interface AgencyInfoVO {
  id: number;
  agencyName: string;
  licenseNumber: string;

  address: string | null;
  status: agency_status;
  publicCode: string | null;

  agencyEmail: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;

  ownerUserId: number;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: Date;
}