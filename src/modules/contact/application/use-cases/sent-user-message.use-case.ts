import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupportedLang, t } from '../../../../locales';
import { SendMessageToUserDto } from '../../dto/contact.dto';
import {
  IUserDomainRepository,
  USER_REPO,
} from '../../../users/domain/repositories/user.repository.interface';
import {
  EMAIL_EVENTS,
  EmailUserMessageEvent,
} from '../../../../infrastructure/events/email/email.events';
 
@Injectable()
export class SendMessageToUserUseCase {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
  ) {}
 
  async execute(dto: SendMessageToUserDto, lang: SupportedLang) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new BadRequestException(t('userNotFound', lang));
    }
 
    const recipientEmail = user.email;
    if (!recipientEmail) {
      throw new BadRequestException(t('userNotFound', lang));
    }
 
    this.eventEmitter.emit(
      EMAIL_EVENTS.USER_MESSAGE,
      new EmailUserMessageEvent({
        senderName: dto.name ?? '',
        senderEmail: dto.email ?? '',
        recipientEmail,
        message: dto.message,
        phone: dto.phone ?? '',
      }),
    );
 
    return {
      success: true,
      message: t('messagesendsuccessfully', lang),
    };
  }
}
 