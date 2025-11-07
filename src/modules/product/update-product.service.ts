
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductAttributeValueService } from './product-attribute-value.service';
import { SupportedLang, t } from '../../locales';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductsRepository } from '../../repositories/product/create-product.repository';
import { CreateProductImageService } from './create-product-images.service';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';
import { AgentsRepository } from '../../repositories/agent/agent.repository';
import { UserService } from '../users/services/users.service';
import { AgentService } from '../agent/agent.service';
@Injectable()
export class UpdateProductService {
  constructor(
    private readonly createProductRepo: CreateProductsRepository,
    private readonly productAttributeValueService: ProductAttributeValueService,
    private readonly productImageService: CreateProductImageService,
    private readonly firebaseService: FirebaseService,
    private readonly agentservice: AgentService,
    private readonly userservice: UserService,
  ) {}

  async updateProduct(
    productId: number,
    dto: UpdateProductDto,
    userId: number,
    agencyId?:number,
    language: SupportedLang = 'al',
    images?: Express.Multer.File[],
  ) {
   
    const product = await this.createProductRepo.findProductById(productId);
    if (!product) {
      throw new NotFoundException({
        success: false,
        message: t('productNotFound', language),
        errors: { general: t('productNotFound', language) },
      });
    }

    
    const user = await this.userservice.findByIdOrFail(userId , language);
    let canEdit = false;

    if (product.userId === userId) {
      
      canEdit = true;
    }else if (user.role === 'agency_owner' && product.agencyId === agencyId) {
  canEdit = true; 
} 
  else if (user.role === 'agent' && product.agencyId) {
  
  const agentRecord = await this.agentservice.findByAgencyAndAgent(product.agencyId, userId, language);
  if (agentRecord?.role_in_agency === 'team_lead') canEdit = true;
}

    if (!canEdit) {
      throw new ForbiddenException({
        success: false,
        message: t('forbiddenProduct', language),
        errors: { general: t('forbiddenProduct', language) },
      });
    }

    // 4️⃣ Update product fields
    const updatedProduct = await this.createProductRepo.updateProductFields(productId, dto);

    // 5️⃣ Update product attributes
    if (dto.attributes && dto.attributes.length > 0) {
      await this.productAttributeValueService.deleteAttributes(productId);
      await this.productAttributeValueService.createPrAttValues(
        productId,
        product.subcategoryId,
        dto.attributes,
        language,
      );
    }

    // 6️⃣ Handle images
    let imagesResponse: { id: number; imageUrl: string }[] = [];
    if (images && images.length > 0) {
      await this.productImageService.deleteImagesByProductId(productId);
      const uploadedImages = await this.productImageService.uploadProductImages(images, productId, userId, language);

      imagesResponse = uploadedImages.images
        .map(img => ({
          id: img.id,
          imageUrl: this.firebaseService.getPublicUrl(img.imageUrl),
        }))
        .filter(img => img.imageUrl !== null) as { id: number; imageUrl: string }[];
    }

    return {
      success: true,
      message: t('productUpdated', language),
      product: {
        ...updatedProduct,
        images: imagesResponse,
      },
    };
  }
}
