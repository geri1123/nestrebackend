export type UpdatableUserFields = {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string | null;
  last_name?: string | null;
  about_me?: string | null;
  profile_img?: string | null;
  phone?: string | null;
  website?: string | null;
  role?: 'user' | 'agent' | 'agency_owner';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  email_verified?: boolean;
  last_login?: Date | null;
  last_active?: Date | null;
};