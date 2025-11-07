

export type PlainAgencyInput = {
  agency_name: string;
  license_number: string;
  address?: string;
  logo?: string | null;
  agency_email?: string | null;
  phone?: string | null;
  website?: string | null;
  owner_user_id: number;
};