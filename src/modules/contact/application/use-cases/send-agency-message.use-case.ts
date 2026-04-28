// send-message-to-agency.use-case.ts
import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { EmailQueueService } from "../../../../infrastructure/queue/services/email-queue.service";
import { SendMessageToAgencyDto } from "../../dto/contact.dto";
import { AGENCY_REPO, IAgencyDomainRepository } from "../../../agency/domain/repositories/agency.repository.interface";

@Injectable()
export class SendMessageToAgencyUseCase {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository
  ) {}

  async execute(dto: SendMessageToAgencyDto, lang: SupportedLang) {
    const agency = await this.agencyRepository.getAgencyInfoByOwner(dto.agencyId);
    if (!agency) {
      throw new BadRequestException(t("agencyNotFound", lang));
    }

    const recipientEmail = agency.ownerEmail;
    if (!recipientEmail) {
      throw new BadRequestException(t("agencyOrOwnerNotFound", lang));
    }

    await this.emailQueueService.sendAgencyMessageEmail({
      senderName: dto.name ?? "",
      senderEmail: dto.email ?? "",
      recipientEmail,
      message: dto.message,
      phone: dto.phone ?? "",
      agencyName: agency.agencyName,
    });

    return {
      success: true,
      message: t("messagesendsuccessfully", lang),
    };
  }
}