

import { Request } from 'express';
import { SupportedLang } from '../../locales';
import { BaseUserInfo } from '../../modules/users/types/base-user-info';
import { AgentPermissions } from './permision.type';
import { agencyagent_status } from '@prisma/client';
import { User } from '../../modules/users/domain/entities/user.entity';

export interface RequestWithUser extends Request {
  language: SupportedLang;
user?:User;
  userId: number;
  // user: BaseUserInfo;

  agencyId?: number | null;
  agencyAgentId?: number | null;
  agentPermissions?: AgentPermissions; 
  agentStatus?:agencyagent_status;
}