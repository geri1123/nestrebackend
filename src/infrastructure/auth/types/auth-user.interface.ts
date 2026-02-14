import { userRole } from '../../../modules/users/domain/types/user-role.type';
import { userStatus } from '../../../modules/users/domain/types/user-status.type';

export interface AuthUser {
  id: number;
  username: string;
  role: userRole;
  email:string;
  status: userStatus;
  profileImgUrl:string | null;
  emailVerified: boolean;
  createdAt:string;
}