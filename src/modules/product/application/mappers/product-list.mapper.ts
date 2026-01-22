import { ProductListItemDto  ,ProductListImageDto} from "../../dto/product-frontend/product-list.dto";
export class ProductListMapper {
  
  static toDto(product: any): ProductListItemDto {
    const images: ProductListImageDto[] = product.productimage.map((img: any) => ({
      imageUrl: img.imageUrl ?? null,
    }));

    const hasActiveAd = product.advertisements?.length > 0;

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      city: product.city?.name ?? 'Unknown',
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      image: images,
      categoryName:
        product.subcategory?.category?.categorytranslation?.[0]?.name ?? 'No Category',
      subcategoryName:
        product.subcategory?.subcategorytranslation?.[0]?.name ?? 'No Subcategory',
      listingTypeName:
        product.listing_type?.listing_type_translation?.[0]?.name ?? 'No Listing Type',
      area: product.area ?? null,
      userId: product.userId,
      agencyId: product.agencyId ?? null,
      user: {
        username: product.user?.username ?? 'Unknown',
      },
      agency: product.agency
        ? {
            agency_name: product.agency.agency_name,
            logo: product.agency.logo ?? null,
          }
        : null,
      isAdvertised: hasActiveAd,
      advertisement: hasActiveAd
        ? {
            id: product.advertisements[0].id,
            status: product.advertisements[0].status,
          }
        : null,
      totalClicks: product.clickCount ?? 0,
    };
  }

  /**
   * Convert an array of database products to list item DTOs
   */
  static toDtoArray(products: any[]): ProductListItemDto[] {
    return products.map((product) => this.toDto(product));
  }
}