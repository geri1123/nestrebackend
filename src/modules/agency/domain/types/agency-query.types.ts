import { AgencyStatus } from '@prisma/client';

export interface AgencyAdminListItem {
  id: number;
  agencyName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  agencyEmail: string | null;
  publicCode: string | null;
  status: AgencyStatus;
  ownerUserId: number;
  createdAt: Date;
  user: {
    username: string;
    email: string;
  };
}

export interface AgencyAdminPaginatedQuery {
  skip: number;
  limit: number;
  search?: string;
  status?: AgencyStatus;
  sortBy?: 'createdAt' | 'agencyName';
  sortOrder?: 'asc' | 'desc';
}

export interface AgencyAdminListResponse {
  data: AgencyAdminListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}