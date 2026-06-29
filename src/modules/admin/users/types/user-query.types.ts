
import { UserRole, UserStatus } from '@prisma/client';

export interface GetAllUsersAdminQuery {
  status?: UserStatus | 'deleted' | 'all';
  role?: UserRole;
  search?: string;
  sortBy?: 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}