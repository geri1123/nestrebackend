import { ProductFrontendDto, ProductImageDto } from '../../dto/product-frontend.dto';

export class ProductFrontendMapper {
  static toDto(product: any): ProductFrontendDto {
    const images: ProductImageDto[] = product.productimage.map((img:any) => ({
      imageUrl: img.imageUrl ?? null,
    }));

    const hasActiveAd = product.advertisements?.length > 0;

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      city: product.city?.name ?? 'Unknown',
      createdAt: product.createdAt.toISOString(),
      image: images,
      userId: product.userId,
      status: product.status,
      categoryName:
        product.subcategory?.category?.categorytranslation?.[0]?.name ?? 'No Category',
      subcategoryName:
        product.subcategory?.subcategorytranslation?.[0]?.name ?? 'No Subcategory',
      listingTypeName:
        product.listing_type?.listing_type_translation?.[0]?.name ?? 'No Listing Type',
      user: { username: product.user?.username ?? 'Unknown' },
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
      totalClicks: product.clickCount,
    };
  }
}