import { Injectable, NotFoundException } from "@nestjs/common";
import { SearchProductsRepo } from "../../../repositories/product/search-product.repository";
import { SupportedLang, t } from "../../../locales";
import { ProductsRepository } from "../../../repositories/product/product.repository";
import { ProductFrontendDto } from "../dto/product-frontend.dto";
import { RequestWithUser } from "../../../common/types/request-with-user.interface";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";

@Injectable()
export class ProductService {
  constructor(private readonly productRepo:ProductsRepository , private readonly firebaseService:FirebaseService) {}

  async getProductForPermissionCheck(id: number , language:SupportedLang) {
    const product = await this.productRepo.getProductForPermissionCheck(id);
    if (!product) throw new NotFoundException(t("productNotFound" , language));
    return product;
  }
async getSingleProduct(
  id: number,
  language: SupportedLang,
  isProtectedRoute: boolean,
  req?: RequestWithUser
): Promise<ProductFrontendDto | null> {
  const product = await this.productRepo.getProductById(id, language);
  if (!product) return null;

  // Status checks
  if (product.status !== 'active') {
    if (!isProtectedRoute) return null;

    const isOwner = req?.userId === product.userId;
    const isAgencyOwner = req?.user?.role === 'agency_owner' && req?.agencyId === product.agencyId;
    const canAgentSee = req?.user?.role === 'agent' && req?.agentPermissions?.can_view_all_posts;

    if (!isOwner && !isAgencyOwner && !canAgentSee) return null;
  }

  // Suspended user or agency
  if (product.user?.status === 'suspended' || product.agency?.status === 'suspended') {
    return null;
  }

  // Map to frontend DTO
  const dto: ProductFrontendDto = {
    id: product.id,
    title: product.title,
    price: product.price,
    city: product.city?.name || 'Unknown',
    status: product.status,
    agencyId: product.agencyId,
    userId: product.userId,
    createdAt: product.createdAt.toISOString(),
    image: product.productimage.map(img => ({
      agencyId: product.agencyId,
      imageUrl: this.firebaseService.getPublicUrl(img.imageUrl),
    })),
    categoryName: product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
    subcategoryName: product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
    listingTypeName: product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
    user: product.user,
    agency: product.agency,
  };

  return dto;
}
//  async getSingleProduct(
//   id: number,
//   language: SupportedLang,
//   isProtectedRoute: boolean,
//   req?: RequestWithUser
// ) {
//   const product = await this.productRepo.getProductById(id, language);
//   if (!product) return null;

  
//   if (product.status !== 'active') {
//     if (!isProtectedRoute) return null;

//     const isOwner = req?.userId === product.userId;
//     const isAgencyOwner = req?.user?.role === 'agency_owner' && req?.agencyId === product.agencyId;
//     const canAgentSee = req?.user?.role === 'agent' && req?.agentPermissions?.can_view_all_posts;

//     if (!isOwner && !isAgencyOwner && !canAgentSee) return null;
//   }
//  if (product.user?.status === 'suspended' || product.agency?.status === 'suspended') {
//     return null;
//   }
//   return product;
// }
}