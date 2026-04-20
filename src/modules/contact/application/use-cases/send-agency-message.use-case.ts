import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { EmailService } from "../../../../infrastructure/email/email.service";

import { SendMessageToAgencyDto } from "../../dto/contact.dto";
import { AGENCY_REPO, IAgencyDomainRepository } from "../../../agency/domain/repositories/agency.repository.interface";

@Injectable()
export class SendMessageToAgencyUseCase {
  constructor(
    private readonly emailService: EmailService,
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository
  ) {}

  async execute(dto: SendMessageToAgencyDto, lang: SupportedLang) {
    
    // 1. Get agency + owner info
    const agency = await this.agencyRepository.getAgencyInfoByOwner(dto.agencyId);

    if (!agency) {
      throw new BadRequestException(t("agencyNotFound", lang));
    }

    // 2. Get owner email
    const recipientEmail = agency.ownerEmail;

    if (!recipientEmail) {
      throw new BadRequestException(t("agencyOrOwnerNotFound", lang));
    }

    // 3. Send email
    const emailSent = await this.emailService.sendAgencyMessageEmail({
      senderName: dto.name ?? "",
      senderEmail: dto.email ?? "",
      recipientEmail,
      message: dto.message,
      phone: dto.phone ?? "",
      agencyName: agency.agencyName,
    });

    if (!emailSent) {
      throw new BadRequestException(t("emailSendFailed", lang));
    }

    return {
      success: true,
      message: t("messagesendsuccessfully", lang),
    };
  }
}