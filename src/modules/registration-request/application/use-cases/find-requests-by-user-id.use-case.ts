import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupportedLang, t } from '../../../../locales';
import { REG_REQ_REPO } from '../../domain/repositories/registration-request.repository.interface';
import {type IRegistrationRequestRepository } from '../../domain/repositories/registration-request.repository.interface';
import { REG_REQ_TOKEN } from '../../domain/repositories/reg-req.repository.token';

@Injectable()
export class FindRequestsByUserIdUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly repo: IRegistrationRequestRepository
  ) {}

  async execute(userId: number, lang: SupportedLang) {
    const requests = await this.repo.findByUserId(userId);

    if (!requests || requests.length === 0) {
      throw new NotFoundException({
        success: false,
        message: t('noRegistrationRequest', lang),
      });
    }

    return requests;
  }
}