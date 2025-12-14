import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang, t } from '../../../../locales';
import { ProductFrontendDto } from '../../dto/product-frontend.dto';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly firebaseService: FirebaseService,
    private readonly productClicksService: ProductClicksService
  ) {}

  async execute(
    id: number,
    language: SupportedLang,
    isProtectedRoute: boolean,
    req?: RequestWithUser
  ): Promise<ProductFrontendDto | null> {
    const product = await this.productRepository.findByIdWithDetails(id, language);
    if (!product) return null;

    const productclicks = await this.productClicksService.getClicksByProduct(`${id}`);
    const totalClicks = productclicks.reduce((sum, c) => sum + c.count, 0);

    if (product.status !== 'active') {
      if (!isProtectedRoute) return null;

      const isOwner = req?.userId === product.userId;
      const isAgencyOwner = req?.user?.role === 'agency_owner' && req?.agencyId === product.agencyId;
      const canAgentSee = req?.user?.role === 'agent' && req?.agentPermissions?.canViewAllPosts;

      if (!isOwner && !isAgencyOwner && !canAgentSee) return null;
    }

    if (product.user?.status === 'suspended' || product.agency?.status === 'suspended') {
      return null;
    }

    const activeAd = product.advertisements?.find(
      (ad) => ad.status === 'active' && ad.endDate && new Date(ad.endDate) > new Date()
    );

    const dto: ProductFrontendDto = {
      id: product.id,
      title: product.title,
      price: product.price,
      city: product.city?.name || 'Unknown',
      status: product.status,
      agencyId: product.agencyId,
      userId: product.userId,
      createdAt: product.createdAt.toISOString(),
      totalClicks,
      image: product.productimage.map((img) => ({
        imageUrl: img.imageUrl,
      })),
      categoryName: product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
      subcategoryName: product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
      listingTypeName: product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
      user: product.user,
      agency: product.agency,
      
      
      isAdvertised: !!activeAd,
      advertisement: activeAd
        ? {
            id: activeAd.id,
            adType: activeAd.adType,
            status: activeAd.status,
            startDate: activeAd.startDate.toISOString(),
            endDate: activeAd.endDate?.toISOString() || null,
          }
        : null,
    };

    return dto;
  }
}
