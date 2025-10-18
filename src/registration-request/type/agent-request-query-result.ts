export type AgentRequestQueryResult = {
  id: number;
  requestType: 'agent_license_verification' | 'agency_registration' | 'role_change_request';
  idCardNumber: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | null;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean | null;
  createdAt: Date;
};