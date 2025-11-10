export type AgencyInfo = {
  id: number;
  agency_name: string;
  public_code?: string | null;
  logo?: string | null;
  license_number: string;
  agency_email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  owner_user_id: number;
  created_at: Date;
  updated_at: Date | null;

  // Nested user info
  user: {
    username: string;
    first_name: string | null;
    last_name: string | null;
    role:string | null
  };
};