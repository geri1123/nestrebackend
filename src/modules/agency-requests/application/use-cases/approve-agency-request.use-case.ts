//fix this tomorrow with transaction

import { BadRequestException, Injectable } from "@nestjs/common";
import { agencyagent_role_in_agency, agencyagent_status, user_role, user_status } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import { FindExistingAgentUseCase } from "../../../agent/application/use-cases/find-existing-agent.use-case";
import { CreateAgentUseCase } from "../../../agent/application/use-cases/create-agent.use-case";
import { AddAgentPermissionsUseCase } from "../../../agent/application/use-cases/add-agenct-permissons.use-case";
import { UpdateUserFieldsUseCase } from "../../../users/application/use-cases/update-user-fields.use-case";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { RegistrationRequestEntity } from "../../../registration-request/domain/entities/registration-request.entity";
import { GetUserProfileUseCase } from "../../../users/application/use-cases/get-user-profile.use-case";
import { FindUserByIdUseCase } from "../../../users/application/use-cases/find-user-by-id.use-case";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { EnsureIdCardUniqueUseCase } from "../../../agent/application/use-cases/ensure-idcard-unique.use-case";

export interface ApproveRequestInput {
  request: RegistrationRequestEntity;
  agencyId: number;
  approvedBy: number;
  roleInAgency: agencyagent_role_in_agency;
  commissionRate?: number;
  permissions?: Record<string, any>;
}

@Injectable()
export class ApproveAgencyRequestUseCase {
  constructor(
     private readonly prisma: PrismaService,
    private readonly findExistingAgent: FindExistingAgentUseCase,
    private readonly createAgent: CreateAgentUseCase,
     private readonly ensureIdCardUnique: EnsureIdCardUniqueUseCase,
    private readonly addPermissions: AddAgentPermissionsUseCase,
    private readonly updateUserFields: UpdateUserFieldsUseCase,
    private readonly getuser:FindUserByIdUseCase,
    private readonly emailService: EmailService,
  ) {}
async execute(input: ApproveRequestInput, language: SupportedLang = "al") {
  const { request, agencyId, approvedBy, roleInAgency, commissionRate, permissions } = input;

  // Validate user
  const user = await this.getuser.execute(request.userId, language);

  if (!user.emailVerified) {
    throw new BadRequestException(t("emailNotVerified", language));
  }

  

  // Check if agent exists
  await this.findExistingAgent.execute(request.userId, language);

let idCardNumber = request.idCardNumber ?? null;

// Validate ID card only if provided
if (idCardNumber) {
  await this.ensureIdCardUnique.execute(idCardNumber, language);
}
  const agent = await this.prisma.$transaction(async (tx) => {

    // Create agent
    const agent = await this.createAgent.execute(
      {
        agencyId,
        agentId: request.userId,
        addedBy: approvedBy,
       idCardNumber ,
        roleInAgency,
        commissionRate,
        status: agencyagent_status.active,
      },
      tx
    );

    // Prepare user updates
    const updates: any = {};
    if (request.user?.role !== user_role.agent) updates.role = user_role.agent;
    if (request.user?.status !== user_status.active) updates.status = user_status.active;

    // Update user fields
    if (Object.keys(updates).length > 0) {
      await this.updateUserFields.execute(request.userId, updates, language, tx);
    }

    // Add permissions
    await this.addPermissions.execute(
      agent.id,
      agencyId,
      permissions ?? {},
      tx
    );

    return agent;
  });

  // Email must be OUTSIDE transaction
  const fullName = `${request.user?.firstName || ""} ${request.user?.lastName || ""}`.trim();
  await this.emailService.sendAgentWelcomeEmail(request.user?.email || "", fullName);

  return agent;
}
//   async execute(input: ApproveRequestInput, language: SupportedLang = "al") {
//     try {
      
//       const { request, agencyId, approvedBy, roleInAgency, commissionRate, permissions } = input;

    

//       const user=await this.getuser.execute(request.userId , language);
//      if (!user.emailVerified) {
//   throw new BadRequestException(t("emailNotVerified" , language));
// }

// if (user.status !== user_status.active) {
//   throw new BadRequestException(t("accountNotActive" , language));
// }
 
//       await this.findExistingAgent.execute(request.userId, language);
     

//       // Create agent
    
//       const agent = await this.createAgent.execute({
//         agencyId,
//         agentId: request.userId,
//         addedBy: approvedBy,
//         idCardNumber: request.idCardNumber || null,
//         roleInAgency,
//         commissionRate,
//         status: "active",
//       });
  
//       const updates: any = {};
//       if (request.user?.role !== user_role.agent) {
//         updates.role = user_role.agent;
//       }
//       if (request.user?.status !== user_status.active) {
//         updates.status = user_status.active;
//       }

 

//       if (Object.keys(updates).length > 0) {
//         await this.updateUserFields.execute(request.userId, updates);
        
//       } else {
//         console.log('No user updates needed');
//       }

     
      
//       await this.addPermissions.execute(
//         agent.id,
//         agencyId,
//         permissions && Object.keys(permissions).length > 0 ? permissions : {}
//       );
 

//       // Send welcome email
    
//       const fullName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim();
     

//       await this.emailService.sendAgentWelcomeEmail(
//         request.user?.email || "",
//         fullName
//       );
     
//       return agent;
//     } catch (error) {
    
//       throw error;
//     }
//   }
}