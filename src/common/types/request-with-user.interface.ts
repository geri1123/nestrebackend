// import { Request } from 'express';
// import { SupportedLang } from '../../locales';

// export interface DecodedUser {
//   userId: number;
//   username: string;
//   email: string;
//   role: 'user' | 'agent' | 'agency_owner';
// }

// export interface RequestWithUser extends Request {
//   language: SupportedLang;
//   user: DecodedUser;
//   userId: number;
//   agencyId?: number; 
//  agencyAgentId?: number | null; 
// }


import { Request } from 'express';
import { SupportedLang } from '../../locales';
import { BaseUserInfo } from '../../modules/users/types/base-user-info';
import { AgentPermissions } from './permision.type';

export interface RequestWithUser extends Request {
  language: SupportedLang;

  userId: number;
  user: BaseUserInfo;

  agencyId?: number | null;
  agencyAgentId?: number | null;
  agentPermissions?: AgentPermissions; 
}