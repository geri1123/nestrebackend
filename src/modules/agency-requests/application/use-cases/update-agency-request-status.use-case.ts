// import { ForbiddenException, Injectable } from "@nestjs/common";
// import { SupportedLang, t } from "../../../../locales";
// import { FindRequestByIdUseCase } from "../../../registration-request/application/use-cases/find-req-by-id.use-case";
// import { UpdateRequestStatusUseCase } from "../../../registration-request/application/use-cases/update-request-status.use-case";
// import { ApproveAgencyRequestUseCase } from "./approve-agency-request.use-case";
// import { RejectAgencyRequestUseCase } from "./reject-agency-request.use-case";
// import { UpdateRequestStatusDto } from "../../dto/agency-request.dto";

// @Injectable()
// export class UpdateAgencyRequestStatusUseCase {
//   constructor(
//     private readonly findRequestById: FindRequestByIdUseCase,
//     private readonly approveRequest: ApproveAgencyRequestUseCase,
//     private readonly rejectRequest: RejectAgencyRequestUseCase,
//     private readonly updateRequestStatus: UpdateRequestStatusUseCase,
//   ) {}

//   async execute(
//     requestId: number,
//     agencyId: number,
//     approvedBy: number,
//     dto: UpdateRequestStatusDto,
//     language: SupportedLang = "al"
//   ) {
//     // Find the request
//     const request = await this.findRequestById.execute(requestId, language);

//     // Validate agency ownership
//     if (request.agencyId !== agencyId) {
//       throw new ForbiddenException({
//         success: false,
//         message: t('cannotApproveOtherAgency', language),
//         errors: { general: [t('cannotApproveOtherAgency', language)] }
//       });
//     }

//     // Handle approval
//     if (dto.action === 'approved') {
//       if (!dto.roleInAgency) {
//         throw new Error('roleInAgency is required when approving');
//       }

//       await this.approveRequest.execute({
//         request,
//         agencyId,
//         approvedBy,
//         roleInAgency: dto.roleInAgency,
//         commissionRate: dto.commissionRate,
//         permissions: dto.permissions,
//       }, language);
//     } 
//     // Handle rejection
//     else if (dto.action === "rejected") {
//       await this.rejectRequest.execute(request);
//     }

//     // Update request status
//     await this.updateRequestStatus.execute({
//       requestId,
//       status: dto.action,
//       reviewedBy: approvedBy,
//       reviewNotes: dto.reviewNotes,
//     });

//     const message =
//       dto.action === 'approved'
//         ? t('registrationApprovedSuccessfully', language)
//         : t('registrationRejectedSuccessfully', language);

//     return {
//       success: true,
//       message,
//     };
//   }
// }

import { ForbiddenException, Injectable } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { FindRequestByIdUseCase } from "../../../registration-request/application/use-cases/find-req-by-id.use-case";
import { UpdateRequestStatusUseCase } from "../../../registration-request/application/use-cases/update-request-status.use-case";
import { ApproveAgencyRequestUseCase } from "./approve-agency-request.use-case";
import { RejectAgencyRequestUseCase } from "./reject-agency-request.use-case";
import { UpdateRequestStatusDto } from "../../dto/agency-request.dto";

@Injectable()
export class UpdateAgencyRequestStatusUseCase {
  constructor(
    private readonly findRequestById: FindRequestByIdUseCase,
    private readonly approveRequest: ApproveAgencyRequestUseCase,
    private readonly rejectRequest: RejectAgencyRequestUseCase,
    private readonly updateRequestStatus: UpdateRequestStatusUseCase,
  ) {}

  async execute(
    requestId: number,
    agencyId: number,
    approvedBy: number,
    dto: UpdateRequestStatusDto,
    language: SupportedLang = "al"
  ) {
    try {
      console.log('=== START UpdateAgencyRequestStatusUseCase ===');
      console.log('Input:', { requestId, agencyId, approvedBy, dto });

      // Find the request
      console.log('Step 1: Finding request by ID...');
      const request = await this.findRequestById.execute(requestId, language);
      console.log('Request found:', {
        id: request.id,
        userId: request.userId,
        agencyId: request.agencyId,
        hasUser: !!request.user,
        userEmail: request.user?.email,
        userFirstName: request.user?.firstName,
        userLastName: request.user?.lastName,
      });

      // Validate agency ownership
      console.log('Step 2: Validating agency ownership...');
      if (request.agencyId !== agencyId) {
        throw new ForbiddenException({
          success: false,
          message: t('cannotApproveOtherAgency', language),
          errors: { general: [t('cannotApproveOtherAgency', language)] }
        });
      }
      console.log('Agency validation passed');

      // Handle approval
      if (dto.action === 'approved') {
        console.log('Step 3: Processing approval...');
        if (!dto.roleInAgency) {
          throw new Error('roleInAgency is required when approving');
        }

        console.log('Approval input:', {
          userId: request.userId,
          agencyId,
          approvedBy,
          roleInAgency: dto.roleInAgency,
          commissionRate: dto.commissionRate,
          permissions: dto.permissions
        });

        await this.approveRequest.execute({
          request,
          agencyId,
          approvedBy,
          roleInAgency: dto.roleInAgency,
          commissionRate: dto.commissionRate,
          permissions: dto.permissions,
        }, language);
        
        console.log('Approval completed successfully');
      } 
      // Handle rejection
      else if (dto.action === "rejected") {
        console.log('Step 3: Processing rejection...');
        await this.rejectRequest.execute(request);
        console.log('Rejection completed successfully');
      }

      // Update request status
      console.log('Step 4: Updating request status...');
      await this.updateRequestStatus.execute({
        requestId,
        status: dto.action,
        reviewedBy: approvedBy,
        reviewNotes: dto.reviewNotes,
      });
      console.log('Status update completed');

      const message =
        dto.action === 'approved'
          ? t('registrationApprovedSuccessfully', language)
          : t('registrationRejectedSuccessfully', language);

      console.log('=== END UpdateAgencyRequestStatusUseCase SUCCESS ===');
      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('=== ERROR in UpdateAgencyRequestStatusUseCase ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      throw error;
    }
  }
}
