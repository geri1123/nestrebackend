import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { NotificationTemplateService } from "../../../notification/notifications-template.service";
import { NotificationService } from "../../../notification/notification.service";
import { GetAgencyWithOwnerByIdUseCase } from "../../../agency/application/use-cases/get-agency-with-owner-byid.use-case";

@Injectable()
export class SendQuickRequestUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository,
   private readonly GetAgencyWithOwnerById:GetAgencyWithOwnerByIdUseCase,
    private readonly notificationService: NotificationService,
    private readonly templateService: NotificationTemplateService,
  ) {}

  async execute(userId: number, agencyId: number, username: string, lang: SupportedLang) {
    const agency = await this.GetAgencyWithOwnerById.execute(agencyId , lang);

    if (!agency) throw new BadRequestException(t("invalidAgencyId", lang));

    const entity = RegistrationRequestEntity.createNew({
      userId,
      agencyId: agency.id,
      // agencyName: agency.agency_name,
      // idCardNumber: null,
      requestedRole: "agent",
      requestType: "agent_license_verification",
      status: "under_review",  
    });

    await this.repo.create(entity);
await this.notificationService.sendNotification({
  userId: agency.owner_user_id,
  type: "user_send_request",
  templateData: { username }, // Translations will be auto-generated from this
  metadata: { username }, 
});
    // const translations = this.templateService.getAllTranslations("user_send_request", { username });

    // await this.notificationService.sendNotification({
    //   userId: agency.owner_user_id,
    //   type: "user_send_request",
    //   translations,
    //   metadata: { username }, 
    // });
  }
}