import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupportedLang, t } from '../../../../locales';
import { ContactPlatformDto } from '../../dto/contact.dto';
import {
  EMAIL_EVENTS,
  EmailSupportMessageEvent,
} from '../../../../infrastructure/events/email/email.events';

@Injectable()
export class SendSupportMessageUseCase {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(dto: ContactPlatformDto, lang: SupportedLang) {
    this.eventEmitter.emit(
      EMAIL_EVENTS.SUPPORT_MESSAGE,
      new EmailSupportMessageEvent({
        senderName: dto.name ?? '',
        senderEmail: dto.email ?? '',
        senderPhone: dto.phone ?? '',
        subject: dto.subject,
        message: dto.message,
      }),
    );

    return {
      success: true,
      message: t('messagesendsuccessfully', lang),
    };
  }
}