import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
// import { SetMetadata } from '@nestjs/common';
// import { AgentPermissions } from '../types/permision.type';

// export const PERMISSIONS_KEY = 'permissions';

// // Only allow keys from AgentPermissions
// export const Permissions = (permissions: (keyof AgentPermissions)[]) =>
//   SetMetadata(PERMISSIONS_KEY, permissions);