// import { ForbiddenException, Injectable } from "@nestjs/common";
// import { SaveProductRepository } from "../../repositories/saved-product/save-product.repository";
// import { SupportedLang, t } from "../../locales";
// import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
// import { formatDate } from "../../common/utils/date";
// import { PaginatedSavedProductsDto, SavedProductDto, SavedProductImage } from "./dto/save-product.dto";
// import { SavedProductWithRelations } from "./type/SavedProductWithRelations.type";


// @Injectable()

// export class SaveProductService{
//     constructor(
//         private readonly saveProductRepo:SaveProductRepository,
//         private readonly firebaseService:FirebaseService
//     ){}


   
//     async saveProduct(userId: number, productId: number, language: SupportedLang) {
//       const alreadySaved = await this.saveProductRepo.isSaved(userId, productId);

//   if (alreadySaved) {
//     throw new ForbiddenException(t("productAlreadySaved", language));
//   }
//     const save = await this.saveProductRepo.createSave(userId, productId);
  
//     if (!save) {
//       throw new ForbiddenException(t("saveFailed", language));
//     }

//     return save;
    
//   }


//   async unsave(userId: number, productId: number, language:SupportedLang){
//     await this.saveProductRepo.removeSave(productId , userId)
    
//   }
//   async getSavedProduct(userId:number , language:SupportedLang, page: number = 1, 
//   limit: number = 12):Promise<PaginatedSavedProductsDto>{
//      const skip = (page - 1) * limit;
//      const [count, savedProducts] = await Promise.all([
//   this.saveProductRepo.countSaved(userId),
//   this.saveProductRepo.getSavedProducts(userId, language, skip, limit),
// ]);
//  const products: SavedProductDto[] = savedProducts.map((saved: SavedProductWithRelations) => {

//   const images: SavedProductImage[] = saved.product.productimage.map((img: SavedProductImage) => ({
//     imageUrl: img.imageUrl ? this.firebaseService.getPublicUrl(img.imageUrl) : null,
//   }));

//   return {
//     id: saved.product.id,
//     title: saved.product.title,
//     price: saved.product.price,
//      categoryName: saved.product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
//     subcategoryName: saved.product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
//      listingTypeName: saved.product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
//     city: saved.product.city?.name || 'No City',
//       country: saved.product.city?.country?.name || 'No Country',
//       user: { username: saved.product.user?.username || 'Unknown' },

//     images,
//     savedAt: formatDate( saved.saved_at),
//   };

 
// });
//  return{
//       products,
//    count,
//     currentPage: page,  
//     totalPages: Math.ceil(count / limit), 
    
//  };
//   }
// }