import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupportedLang, t } from '../../../../locales';
import { SendMessageToAgencyDto } from '../../dto/contact.dto';
import {
  AGENCY_REPO,
  IAgencyDomainRepository,
} from '../../../agency/domain/repositories/agency.repository.interface';
import {
  EMAIL_EVENTS,
  EmailAgencyMessageEvent,
} from '../../../../infrastructure/events/email/email.events';

@Injectable()
export class SendMessageToAgencyUseCase {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
  ) {}

  async execute(dto: SendMessageToAgencyDto, lang: SupportedLang) {
    const agency = await this.agencyRepository.getAgencyInfoByOwner(
      dto.agencyId,
    );
    if (!agency) {
      throw new BadRequestException(t('agencyNotFound', lang));
    }

    const recipientEmail = agency.ownerEmail;
    if (!recipientEmail) {
      throw new BadRequestException(t('agencyOrOwnerNotFound', lang));
    }

    this.eventEmitter.emit(
      EMAIL_EVENTS.AGENCY_MESSAGE,
      new EmailAgencyMessageEvent({
        senderName: dto.name ?? '',
        senderEmail: dto.email ?? '',
        recipientEmail,
        message: dto.message,
        phone: dto.phone ?? '',
        agencyName: agency.agencyName,
      }),
    );

    return {
      success: true,
      message: t('messagesendsuccessfully', lang),
    };
  }
}