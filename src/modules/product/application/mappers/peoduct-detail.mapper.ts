import { ProductDetailDto, ProductDetailImageDto, ProductAttributeDto } from "../../dto/product-frontend/product-detail.dto";

export class ProductDetailMapper {
  static toDto(product: any, totalClicks: number = 0): ProductDetailDto {
    const images: ProductDetailImageDto[] = product.productimage.map((img: any) => ({
      imageUrl: img.imageUrl ?? null,
    }));

    const activeAd = product.advertisements?.find(
      (ad: any) =>
        ad.status === 'active' &&
        ad.endDate &&
        new Date(ad.endDate) > new Date()
    );

    const attributes: ProductAttributeDto[] = product.productattributevalue?.map((attr: any) => {
      const translatedValue = attr.attribute_values?.attributeValueTranslations?.[0]?.name;
      const valueCode = attr.attribute_values?.value_code;
      
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
        product.subcategory?.category?.categorytranslation?.[0]?.name ?? 'No Category',
      subcategoryName:
        product.subcategory?.subcategorytranslation?.[0]?.name ?? 'No Subcategory',
      listingTypeName:
        product.listing_type?.listing_type_translation?.[0]?.name ?? 'No Listing Type',
      userId: product.userId,
      agencyId: product.agencyId ?? null,
      user: product.user
        ? {
            username: product.user.username,
            email: product.user.email ?? null,
            first_name: product.user.first_name ?? null,
            last_name: product.user.last_name ?? null,
            phone: product.user.phone ?? null,
            role: product.user.role,
            status: product.user.status,
          }
        : null,
      agency: product.agency
        ? {
            agency_name: product.agency.agency_name,
            logo: product.agency.logo ?? null,
            address: product.agency.address ?? null,
            status: product.agency.status ?? null,
            public_code:product.agency.public_code ?? null,
            phone: product.agency.phone ?? null,
            created_at: product.agency.created_at,
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