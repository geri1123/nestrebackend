import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute-value.repository.interface';
@Injectable()
export class DeleteProductAttributesUseCase {
constructor(
@Inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN)
private readonly attributeValueRepo: IProductAttributeValueRepository,
) {}
async execute(productId: number): Promise<number> {
return this.attributeValueRepo.deleteByProductId(productId);
}
}