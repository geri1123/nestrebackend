import { SetMetadata } from '@nestjs/common'; 
import { agencyagent_role_in_agency } from '@prisma/client'; 


export const AgencyAgentRoles = (...roles: agencyagent_role_in_agency[]) => SetMetadata('agencyAgentRoles', roles)