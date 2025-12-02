import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";

@Injectable()
export class FindRequestByIdUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly repo: IRegistrationRequestRepository
  ) {}

  async execute(id: number, lang: SupportedLang) {
    const request = await this.repo.findById(id);

    if (!request) {
      throw new NotFoundException({
        success: false,
        message: t("requestNotFound", lang),
      });
    }

    return request;
  }
}
