import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateContactDto } from "../../dto/contact.dto";
import { GetProductByIdUseCase } from "../../../product/application/use-cases/get-product-by-id.use-case";
import { SupportedLang, t } from "../../../../locales";
import { EmailQueueService } from "../../../../infrastructure/queue/services/email-queue.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EMAIL_EVENTS, EmailContactMessageEvent } from "../../../../infrastructure/events/email/email.events";

@Injectable()
export class SendContactMessageUseCase {
  constructor(
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    // private readonly emailQueueService: EmailQueueService,
    private readonly eventEmitter:EventEmitter2,
  ) {}

  async execute(dto: CreateContactDto, lang: SupportedLang) {
    const data = await this.getProductByIdUseCase.execute(dto.productId, lang, false);
    if (!data || !data.product) {
      throw new BadRequestException(t('productNotFound', lang));
    }

    const product = data.product;

    const recipientEmail = product.user?.email;
    if (!recipientEmail) {
      throw new BadRequestException(t('productOwnerNotFound', lang));
    }
  this.eventEmitter.emit(
      EMAIL_EVENTS.CONTACT_MESSAGE,
      new EmailContactMessageEvent({
        senderName: dto.name ?? '',
        senderEmail: dto.email ?? '',
        recipientEmail,
        message: dto.message,
        phone: dto.phone ?? '',
        productName: product.title,
        productPrice: product.price,
        productCategory: product.categoryName,
        productListingType: product.listingTypeName,
        productImage: product.image?.[0]?.imageUrl ?? '',
      }),
    );
    // await this.emailQueueService.sendContactMessageEmail({
    //   senderName: dto.name ?? '',
    //   senderEmail: dto.email ?? '',
    //   recipientEmail,
    //   message: dto.message,
    //   phone: dto.phone ?? '',
    //   productName: product.title,
    //   productPrice: product.price,
    //   productCategory: product.categoryName,
    //   productListingType: product.listingTypeName,
    //   productImage: product.image?.[0]?.imageUrl ?? '',
    // });

    return {
      success: true,
      message: t('messagesendsuccessfully', lang),
    };
  }
}