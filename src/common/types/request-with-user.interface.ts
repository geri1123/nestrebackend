

import { Request } from 'express';
import { SupportedLang } from '../../locales';

import { AgentPermissionEntity } from '../../modules/agent/domain/entities/agent-permission.entity';

import { agencyagent_status } from '@prisma/client';
import { User } from '../../modules/users/domain/entities/user.entity';

export interface RequestWithUser extends Request {
  language: SupportedLang;
user?:User;
  userId: number;
  // user: BaseUserInfo;

  agencyId?: number | null;
  agencyAgentId?: number | null;
agentPermissions?: AgentPermissionEntity | null
  agentStatus?:agencyagent_status;
}