import { ApiProperty } from '@nestjs/swagger';
import { ProductListItemDto } from './product-list.dto';

export class MostClickedProductsResponseDto {
  @ApiProperty({ type: () => [ProductListItemDto] })
  products: ProductListItemDto[];
}