

import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang } from '../../../../locales';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
import { ProductDetailResponseDto } from '../../dto/product-frontend/product-detail.dto';
import { ProductDetailMapper } from '../mappers/peoduct-detail.mapper';
import { ProductStatus, UserRole } from '@prisma/client';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly productClicksService: ProductClicksService,
  ) {}

  async execute(
    id: number,
    language: SupportedLang,
    isProtectedRoute: boolean,
    req?: RequestWithUser,
  ): Promise<ProductDetailResponseDto> {
    const product = await this.productRepository.findByIdWithDetails(id, language);

    if (!product) {
      return { product: null };
    }

    // Get click count
    const productClicks = await this.productClicksService.getClicksByProduct(`${id}`);
    const totalClicks = productClicks.reduce((sum, c) => sum + c.count, 0);

    // Check status and permissions
  if (isProtectedRoute) {
  const isOwner =
    req?.userId === product.userId &&
    (!product.agencyId || req?.agencyId === product.agencyId);

  const isAgencyOwner =
    req?.user?.role === UserRole.agency_owner &&
    req?.agencyId === product.agencyId;

 const canAgentView =
  req?.user?.role === UserRole.agent &&
  req?.agencyId === product.agencyId &&
  (
    req?.userId === product.userId ||           
    req?.agentPermissions?.can_view_all_posts || 
    product.status === ProductStatus.active      
  );

const canAgentEdit =
  req?.user?.role === UserRole.agent &&
  req?.agencyId === product.agencyId &&
  req?.agentPermissions?.can_edit_others_post &&
  (
    req?.userId === product.userId ||           
    req?.agentPermissions?.can_view_all_posts || 
    product.status === ProductStatus.active      
  );


  if (!isOwner && !isAgencyOwner && !canAgentView && !canAgentEdit) {
    return { product: null };
  }
}else {
  if (product.status !== ProductStatus.active) {
    return { product: null };
  }
}
   
    if (
      product.user?.status === 'suspended' ||
      product.agency?.status === 'suspended'
    ) {
      return { product: null };
    }

    const dto = ProductDetailMapper.toDto(product, totalClicks);

    const subcategoryId = product.subcategory?.id;
    const categoryId = product.subcategory?.category?.id;

    return {
      product: dto,
      relatedData: subcategoryId && categoryId
        ? { subcategoryId, categoryId }
        : undefined,
    };
  }
}