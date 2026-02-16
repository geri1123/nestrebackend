import { ProductListItemDto, ProductListImageDto } from "../../dto/product-frontend/product-list.dto";

export class ProductListMapper {
  
  static toDto(product: any): ProductListItemDto {
    const images: ProductListImageDto[] = product.productImage.map((img: any) => ({
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
        product.subcategory?.category?.categoryTranslation?.[0]?.name ?? 'No Category',
      subcategoryName:
        product.subcategory?.subcategoryTranslation?.[0]?.name ?? 'No Subcategory',
      listingTypeName:
        product.listingType?.listingTypeTranslation?.[0]?.name ?? 'No Listing Type',
      area: product.area ?? null,
      userId: product.userId,
      agencyId: product.agencyId ?? null,
      user: {
        username: product.user?.username ?? 'Unknown',
      },
      agency: product.agency
        ? {
            agencyName: product.agency.agencyName,
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

  static toDtoArray(products: any[]): ProductListItemDto[] {
    return products.map((product) => this.toDto(product));
  }
}