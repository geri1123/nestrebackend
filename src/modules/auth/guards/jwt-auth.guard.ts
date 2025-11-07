import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RequestWithLang } from '../../../middlewares/language.middleware';
import { UserRepository } from '../../../repositories/user/user.repository';
import { AgencyRepository } from '../../../repositories/agency/agency.repository';
import { t } from '../../../locales';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { AgentService } from '../../agent/agent.service';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly agentService:AgentService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang = req.language;

    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      throw new UnauthorizedException(
      
        t('noTokenProvided', lang),
        );
    }
try {
  const decoded = this.jwtService.verify(token, {
    secret: this.config.get<string>('JWT_SECRET'),
  });

  req['user'] = decoded;
  req['userId'] = decoded.userId;

  const agencyId = decoded.agencyId;
  req['agencyId'] = agencyId;

  // Populate agencyAgentId only for agents (not owners)
  if (decoded.role === 'agent') {
    const agentRecord = await this.agentService.findByAgencyAndAgent(agencyId, decoded.userId , lang);
    if (!agentRecord) {
      throw new UnauthorizedException(
       
      t('userNotAssociatedWithAgency', req.language),
      
      );
    }
    req['agencyAgentId'] = agentRecord.id; 
  }

  // Owners don't need agencyAgentId
  if (decoded.role === 'agency_owner') {
    req['agencyAgentId'] = null;
  }

  await this.userRepo.updateFieldsById(decoded.userId, { last_active: new Date() });

  return true;
} catch (error) {
  throw new UnauthorizedException(
   
   t('invalidOrExpiredToken', req.language),
  );
}
  
  }
}