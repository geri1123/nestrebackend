import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import { SupportedLang, t } from "../../../../locales";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { Prisma } from "@prisma/client";

@Injectable()
export class SetUnderReviewUseCase {
  constructor(@Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository) {}

  async execute(userId: number, lang: SupportedLang , tx?:Prisma.TransactionClient) {
    const updated = await this.repo.setLatestUnderReview(userId , tx);

    if (!updated) {
      throw new BadRequestException(t("couldNotUpdateRequest", lang));
    }
  }
}