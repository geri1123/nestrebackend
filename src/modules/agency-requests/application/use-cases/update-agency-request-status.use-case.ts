

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
     

      // Find the request
      
      const request = await this.findRequestById.execute(requestId, language);
      

      console.log('Validating agency ownership...');
      if (request.agencyId !== agencyId) {
        throw new ForbiddenException({
          success: false,
          message: t('cannotApproveOtherAgency', language),
          errors: { general: [t('cannotApproveOtherAgency', language)] }
        });
      }
     

      if (dto.action === 'approved') {
       
        if (!dto.roleInAgency) {
          throw new Error('roleInAgency is required when approving');
        }

       

        await this.approveRequest.execute({
          request,
          agencyId,
          approvedBy,
          roleInAgency: dto.roleInAgency,
          commissionRate: dto.commissionRate,
          permissions: dto.permissions,
        }, language);
        
      
      } 
      // Handle rejection
      else if (dto.action === "rejected") {
        await this.rejectRequest.execute(request);
       
      }

      // Update request status
      await this.updateRequestStatus.execute({
        requestId,
        status: dto.action,
        reviewedBy: approvedBy,
        reviewNotes: dto.reviewNotes,
      });
     

      const message =
        dto.action === 'approved'
          ? t('registrationApprovedSuccessfully', language)
          : t('registrationRejectedSuccessfully', language);

      
      return {
        success: true,
        message,
      };
    } catch (error:any) {
      console.error('=== ERROR in UpdateAgencyRequestStatusUseCase ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      throw error;
    }
  }
}
