export type PartialUserForLogin = {
  id: number;
  username: string;
  email: string;
  password: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  role: 'user' | 'agent' | 'agency_owner';
  email_verified: boolean;
  first_name?: string | null;
};
export type PartialUserByToken = {
  id: number;
  role: 'user' | 'agent' | 'agency_owner';
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
};