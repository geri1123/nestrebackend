import { SetMetadata } from '@nestjs/common';
import { AgentPermissionKey } from '../types/permision.type';

export const PERMISSIONS_KEY = 'permissions';



export const Permissions = (...permissions: AgentPermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
