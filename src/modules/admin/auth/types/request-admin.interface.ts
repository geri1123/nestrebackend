import { Request } from 'express';
import { AuthAdmin } from './auth-admin.interface';

export interface RequestAdmin extends Request {

  admin: AuthAdmin;
  adminId: number;
  adminRole: AuthAdmin['role'];
}