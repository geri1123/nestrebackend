import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateContactDto } from "../../dto/contact.dto";
import { GetProductByIdUseCase } from "../../../product/application/use-cases/get-product-by-id.use-case";
import { SupportedLang, t } from "../../../../locales";
import { EmailService } from "../../../../infrastructure/email/email.service";

@Injectable()
export class SendContactMessageUseCase {
  constructor(
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly emailService: EmailService
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

    const productTitle = product.title;
    const productCategory = product.categoryName;
    const productListingType = product.listingTypeName;
    const productPrice = product.price;
const productImage = product.image?.[0]?.imageUrl ?? '';

    const contactMessage = {
      senderName: dto.name,
      senderEmail: dto.email,
      message: dto.message,
      productId: dto.productId,
      productName: productTitle,
      productPrice,
      productCategory,
      productListingType,
      createdAt: new Date(),
    };
    console.log(contactMessage);

    const emailSent = await this.emailService.sendContactMessageEmail({
      senderName:  dto.name ?? '',
      senderEmail: dto.email ?? '',
      recipientEmail: recipientEmail,
      message: dto.message,
      productName: productTitle,
      productPrice,
      productCategory,
      productListingType,
      productImage,
    });

    if (!emailSent) {
      throw new BadRequestException(t('emailSendFailed', lang));
    }

    return {
      success: true,
      message: t('messagesendsuccessfully', lang),
    };
  }
}