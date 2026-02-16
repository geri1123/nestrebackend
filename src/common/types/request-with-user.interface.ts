

import { Request } from 'express';
import { SupportedLang } from '../../locales';

import { AgentPermissionEntity } from '../../modules/agent/domain/entities/agent-permission.entity';

import { AgencyStatus, AgencyAgentStatus } from '@prisma/client';
import { AuthUser } from '../../infrastructure/auth/types/auth-user.interface';
import { AgentPermissions } from './permision.type';

export interface RequestWithUser extends Request {
  language: SupportedLang;
user?:AuthUser;
  userId: number;
 

  agencyId?: number | null;
  agencyAgentId?: number | null;
 agentPermissions?: AgentPermissions | null;
  agentStatus?:AgencyAgentStatus;
  agencyStatus?: AgencyStatus;
  isAgencyOwner?:boolean ;
}