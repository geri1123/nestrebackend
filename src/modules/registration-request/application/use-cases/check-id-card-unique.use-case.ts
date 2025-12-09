import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class CheckIdCardUniqueForRegistrationUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly regReqRepo: IRegistrationRequestRepository,
  ) {}

  async execute(idCard: string, lang: SupportedLang) {
    const exists = await this.regReqRepo.idCardExists(idCard);

    if (exists) {
      throw new BadRequestException({
        id_card_number: [t("idCardExists", lang)],
      });
    }
  }
}