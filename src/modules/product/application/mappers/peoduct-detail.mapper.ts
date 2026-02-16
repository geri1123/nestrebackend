import { ProductDetailDto, ProductDetailImageDto, ProductAttributeDto } from "../../dto/product-frontend/product-detail.dto";

export class ProductDetailMapper {
  static toDto(product: any, totalClicks: number = 0): ProductDetailDto {
    const images: ProductDetailImageDto[] = product.productImage.map((img: any) => ({
      imageUrl: img.imageUrl ?? null,
    }));

    const activeAd = product.advertisements?.find(
      (ad: any) =>
        ad.status === 'active' &&
        ad.endDate &&
        new Date(ad.endDate) > new Date()
    );

    const attributes: ProductAttributeDto[] = product.productAttributeValue?.map((attr: any) => {
      const translatedValue = attr.attributeValues?.attributeValueTranslations?.[0]?.name;
      const valueCode = attr.attributeValues?.valueCode;
      
      return {
        attributeId: attr.attributeId,
        attributeName: attr.attributes?.attributeTranslation?.[0]?.name ?? 'Unknown Attribute',
        inputType: attr.attributes?.inputType ?? 'text', 
        attributeValueId: attr.attributeValueId,
        attributeValue: translatedValue ?? valueCode ?? 'Unknown Value', 
        valueCode: valueCode ?? '', 
      };
    }) || [];

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      city: product.city?.name ?? 'Unknown',
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      description: product.description ?? null,
      streetAddress: product.streetAddress ?? null,
      buildYear: product.buildYear ?? null,
      area: product.area ?? null,
      image: images,
      categoryName:
        product.subcategory?.category?.categoryTranslation?.[0]?.name ?? 'No Category',
      subcategoryName:
        product.subcategory?.subcategoryTranslation?.[0]?.name ?? 'No Subcategory',
      listingTypeName:
        product.listingType?.listingTypeTranslation?.[0]?.name ?? 'No Listing Type',
      userId: product.userId,
      agencyId: product.agencyId ?? null,
      user: product.user
        ? {
            username: product.user.username,
            profileImgUrl:product.user.profileImgUrl,
            email: product.user.email ?? null,
            firstName: product.user.firstName ?? null,
            lastName: product.user.lastName ?? null,
            phone: product.user.phone ?? null,
            role: product.user.role,
            status: product.user.status,
          }
        : null,
      agency: product.agency
        ? {
            agencyName: product.agency.agencyName,
            logo: product.agency.logo ?? null,
            address: product.agency.address ?? null,
            status: product.agency.status ?? null,
            publicCode: product.agency.publicCode ?? null,
            phone: product.agency.phone ?? null,
            createdAt: product.agency.createdAt,
          }
        : null,
      isAdvertised: !!activeAd,
      advertisement: activeAd
        ? {
            id: activeAd.id,
            adType: activeAd.adType,
            status: activeAd.status,
            startDate: activeAd.startDate.toISOString(),
            endDate: activeAd.endDate?.toISOString() ?? null,
          }
        : null,
      totalClicks,
      attributes, 
    };
  }
}