import { IsInt, IsEnum, IsOptional } from "class-validator";
import { AdvertisementType } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AdvertiseDto {
  @ApiProperty({
    example: 123,
    description: 'ID of the product to advertise',
  })
  @IsInt()
  productId!: number;

  @ApiPropertyOptional({
    enum: AdvertisementType,
    example: AdvertisementType.normal,
    description: 'Advertisement type (default: normal)',
  })
  @IsEnum(AdvertisementType)
  @IsOptional()
  adType?: AdvertisementType = AdvertisementType.normal;
}