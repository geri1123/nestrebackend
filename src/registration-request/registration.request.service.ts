import { Injectable, BadRequestException } from "@nestjs/common";
import { RegistrationRequestRepository } from "../repositories/registration-request/registration-request.repository";
import { NotificationService } from "../notification/notification.service";
import { SupportedLang, t } from "../locales";
import { RegisterAgentDto } from "../auth/dto/register-agent.dto";
import { AgencyRepository } from "../repositories/agency/agency.repository";

@Injectable()
export class RegistrationRequestService {
  constructor(
    private readonly requestRepo: RegistrationRequestRepository,
    private readonly agencyRepo: AgencyRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createAgentRequest(
    userId: number,
    dto: RegisterAgentDto,
    language: SupportedLang = "al"
  ) {
    const errors: Record<string, string[]> = {};

   
    const agency = await this.agencyRepo.findByPublicCode(dto.public_code);
    if (!agency) {
      errors.public_code = [t("invalidPublicCode", language)];
      throw new BadRequestException(errors);
    }

    if (await this.requestRepo.idCardExists(dto.id_card_number)) {
      errors.id_card_number = [t("idCardExists", language)];
      throw new BadRequestException(errors);
    }

    await this.requestRepo.create({
      userId,
      idCardNumber: dto.id_card_number,
      status: "pending",
      agencyName: agency.agency_name,
      agencyId: agency.id,
      requestedRole: dto.requested_role,
      requestType: "agent_license_verification",
    });

    
  }
}


// await this.notificationService.sendNotification({
    //   userId: agency.owner_user_id,
    //   type: "registration_request",
    //   translations: [
    //     {
    //       languageCode: "al",
    //       message: `Agjenti i ri ${dto.first_name} ${dto.last_name} kërkoi të bashkohet me agjencinë tuaj.`,
    //     },
    //     {
    //       languageCode: "en",
    //       message: `New agent ${dto.first_name} ${dto.last_name} requested to join your agency.`,
    //     },
    //     {
    //       languageCode: "it",
    //       message: `Il nuovo agente ${dto.first_name} ${dto.last_name} ha richiesto di unirsi alla tua agenzia.`,
    //     },
    //   ],
    // });