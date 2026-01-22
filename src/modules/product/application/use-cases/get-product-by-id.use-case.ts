
// import { Inject, Injectable } from '@nestjs/common';
// import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
// import { SupportedLang, t } from '../../../../locales';
// import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
// import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
// import { ProductDetailDto } from '../../dto/product-frontend/product-detail.dto';

// export interface ProductWithRelatedData {
//   product: ProductDetailDto | null;
//   relatedData?: {
//     subcategoryId: number;
//     categoryId: number;
//   };
// }

// @Injectable()
// export class GetProductByIdUseCase {
//   constructor(
//     @Inject(PRODUCT_REPO)
//     private readonly productRepository: IProductRepository,
//     private readonly productClicksService: ProductClicksService
//   ) {}

//   async execute(
//     id: number,
//     language: SupportedLang,
//     isProtectedRoute: boolean,
//     req?: RequestWithUser
//   ): Promise<ProductWithRelatedData> {
//     const product = await this.productRepository.findByIdWithDetails(id, language);
    
//     if (!product) {
//       return { product: null };
//     }

//     const productclicks = await this.productClicksService.getClicksByProduct(`${id}`);
//     const totalClicks = productclicks.reduce((sum, c) => sum + c.count, 0);

//     if (product.status !== 'active') {
//       if (!isProtectedRoute) return { product: null };

//       const isOwner = req?.userId === product.userId;
//       const isAgencyOwner = req?.user?.role === 'agency_owner' && req?.agencyId === product.agencyId;
//       const canAgentSee = req?.user?.role === 'agent' && req?.agentPermissions?.canViewAllPosts;

//       if (!isOwner && !isAgencyOwner && !canAgentSee) return { product: null };
//     }

//     if (product.user?.status === 'suspended' || product.agency?.status === 'suspended') {
//       return { product: null };
//     }

//     const activeAd = product.advertisements?.find(
//       (ad:any) => ad.status === 'active' && ad.endDate && new Date(ad.endDate) > new Date()
//     );

//     const dto: ProductDetailDto = {
//       id: product.id,
//       title: product.title,
//       price: product.price,
//       city: product.city?.name || 'Unknown',
//       status: product.status,
//       agencyId: product.agencyId,
//       userId: product.userId,
//       createdAt: product.createdAt.toISOString(),
//       description: product.description,
//       streetAddress: product.streetAddress,
//       buildYear: product.buildYear,
//       area: product.area,
//       updatedAt: product.updatedAt.toISOString(),
//       totalClicks,
//       image: product.productimage.map((img) => ({
//         imageUrl: img.imageUrl,
//       })),
//       categoryName: product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
//       subcategoryName: product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
//       listingTypeName: product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
//       user: product.user,
//       agency: product.agency,
//       isAdvertised: !!activeAd,
//       advertisement: activeAd
//         ? {
//             id: activeAd.id,
//             adType: activeAd.adType,
//             status: activeAd.status,
//             startDate: activeAd.startDate.toISOString(),
//             endDate: activeAd.endDate?.toISOString() || null,
//           }
//         : null,
//     };
//  const subcategoryId = product.subcategory?.id;
//   const categoryId = product.subcategory?.category?.id;

//   console.log(' Related data extraction:', {
//     productId: product.id,
//     subcategoryId,
//     categoryId,
//     hasSubcategory: !!product.subcategory,
//     hasCategory: !!product.subcategory?.category
//   });
//     return {
//       product: dto,
//      relatedData: subcategoryId && categoryId 
//       ? { subcategoryId, categoryId }
//       : undefined, 
  
//     };
//   }
// }

// import { Inject, Injectable } from '@nestjs/common';
// import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
// import { SupportedLang } from '../../../../locales';

// import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
// import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
// import { ProductDetailResponseDto } from '../../dto/product-frontend/product-detail.dto';
// import { ProductDetailMapper } from '../mappers/peoduct-detail.mapper';

// @Injectable()
// export class GetProductByIdUseCase {
//   constructor(
//     @Inject(PRODUCT_REPO)
//     private readonly productRepository: IProductRepository,
//     private readonly productClicksService: ProductClicksService
//   ) {}

//   async execute(
//     id: number,
//     language: SupportedLang,
//     isProtectedRoute: boolean,
//     req?: RequestWithUser
//   ): Promise<ProductDetailResponseDto> {
//     const product = await this.productRepository.findByIdWithDetails(id, language);

//     if (!product) {
//       return { product: null };
//     }

//     // Get click count
//     const productClicks = await this.productClicksService.getClicksByProduct(`${id}`);
//     const totalClicks = productClicks.reduce((sum, c) => sum + c.count, 0);

//     // Check status and permissions
//     if (product.status !== 'active') {
//       if (!isProtectedRoute) {
//         return { product: null };
//       }

//       const isOwner = req?.userId === product.userId;
//       const isAgencyOwner = 
//         req?.user?.role === 'agency_owner' && 
//         req?.agencyId === product.agencyId;
//       const canAgentSee = 
//         req?.user?.role === 'agent' && 
//         req?.agentPermissions?.canViewAllPosts;

//       if (!isOwner && !isAgencyOwner && !canAgentSee) {
//         return { product: null };
//       }
//     }

//     if (
//       product.user?.status === 'suspended' || 
//       product.agency?.status === 'suspended'
//     ) {
//       return { product: null };
//     }

//     // Map to DTO
//     const dto = ProductDetailMapper.toDto(product, totalClicks);

//     const subcategoryId = product.subcategory?.id;
//     const categoryId = product.subcategory?.category?.id;

//     console.log(' Related data extraction:', {
//       productId: product.id,
//       subcategoryId,
//       categoryId,
//       hasSubcategory: !!product.subcategory,
//       hasCategory: !!product.subcategory?.category
//     });

//     return {
//       product: dto,
//       relatedData: subcategoryId && categoryId
//         ? { subcategoryId, categoryId }
//         : undefined,
//     };
//   }
// }


import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang } from '../../../../locales';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
import { ProductDetailResponseDto } from '../../dto/product-frontend/product-detail.dto';
import { ProductDetailMapper } from '../mappers/peoduct-detail.mapper';

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
    if (product.status !== 'active') {
      if (!isProtectedRoute) {
        return { product: null };
      }

      const isOwner = req?.userId === product.userId;
      const isAgencyOwner = 
        req?.user?.role === 'agency_owner' && 
        req?.agencyId === product.agencyId;
      const canAgentSee = 
        req?.user?.role === 'agent' && 
        req?.agentPermissions?.canViewAllPosts;

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