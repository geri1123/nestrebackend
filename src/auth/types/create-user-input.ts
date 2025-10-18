import { user_status } from '@prisma/client';

export interface BaseRegistration {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserRegistration extends BaseRegistration {
  role: 'user';
  terms_accepted: true;
  repeatPassword: string;
}

export interface AgencyOwnerRegistration extends BaseRegistration {
  role: 'agency_owner';
  terms_accepted: true;
  repeatPassword: string;
  agency_name: string;
  license_number: string;
  address: string;
}

export interface AgentRegistration extends BaseRegistration {
  role: 'agent';
  terms_accepted: true;
  repeatPassword: string;
  public_code: string;
  id_card_number: string;
  requested_role: 'agent' | 'senior_agent' | 'team_lead';
}
export type RegistrationInput =
  | BaseRegistration
  | AgencyOwnerRegistration
  | AgentRegistration;
// Raw input (before validation)
// export interface RegistrationInput {
//   username: string;
//   email: string;
//   password: string;
//   repeatPassword: string;
//   first_name: string;
//   last_name: string;
//   terms_accepted: boolean;
//   role: 'user' | 'agency_owner' | 'agent';

//   agency_name?: string;
//   license_number?: string;
//   address?: string;
//   public_code?: string;
//   id_card_number?: string;
//   requested_role?: 'agent' | 'senior_agent' | 'team_lead';
// }

// Type used for DB creation — generalized for all roles
export type UserCreationData = Omit<BaseRegistration & { role: 'user' | 'agency_owner' | 'agent' }, 'repeatPassword' | 'terms_accepted'> & {
  status: user_status;
  verification_token: string;
  verification_token_expires: Date;
};