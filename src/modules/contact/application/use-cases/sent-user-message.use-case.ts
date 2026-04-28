// send-message-to-user.use-case.ts
import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import { EmailQueueService } from "../../../../infrastructure/queue/services/email-queue.service";
import { SendMessageToUserDto } from "../../dto/contact.dto";
import { IUserDomainRepository, USER_REPO } from "../../../users/domain/repositories/user.repository.interface";

@Injectable()
export class SendMessageToUserUseCase {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository
  ) {}

  async execute(dto: SendMessageToUserDto, lang: SupportedLang) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new BadRequestException(t("userNotFound", lang));
    }

    const recipientEmail = user.email;
    if (!recipientEmail) {
      throw new BadRequestException(t("userNotFound", lang));
    }

    await this.emailQueueService.sendMessageToUser({
      senderName: dto.name ?? "",
      senderEmail: dto.email ?? "",
      recipientEmail,
      message: dto.message,
      phone: dto.phone ?? "",
    });

    return {
      success: true,
      message: t("messagesendsuccessfully", lang),
    };
  }
}