
import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang } from '../../../../locales';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
import { ProductDetailResponseDto } from '../../dto/product-frontend/product-detail.dto';
import { ProductDetailMapper } from '../mappers/peoduct-detail.mapper';
import { product_status, user_role } from '@prisma/client';

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
    req?: RequestWithUser
  ): Promise<ProductDetailResponseDto> {
    const product = await this.productRepository.findByIdWithDetails(id, language);

    if (!product) {
      return { product: null };
    }

    // Get click count
    const productClicks = await this.productClicksService.getClicksByProduct(`${id}`);
    const totalClicks = productClicks.reduce((sum, c) => sum + c.count, 0);

    // Check status and permissions
    if (product.status !== product_status.active) {
      if (!isProtectedRoute) {
        return { product: null };
      }

      const isOwner = req?.userId === product.userId;
      const isAgencyOwner = 
        req?.user?.role === user_role.agency_owner && 
        req?.agencyId === product.agencyId;
      const canAgentSee = 
        req?.user?.role === user_role.agent && 
        req?.agentPermissions?.can_view_all_posts;

      if (!isOwner && !isAgencyOwner && !canAgentSee) {
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