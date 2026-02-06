import { IsInt, IsEnum, IsOptional } from "class-validator";
import { advertisement_type } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AdvertiseDto {
  @ApiProperty({
    example: 123,
    description: 'ID of the product to advertise',
  })
  @IsInt()
  productId!: number;

  @ApiPropertyOptional({
    enum: advertisement_type,
    example: advertisement_type.normal,
    description: 'Advertisement type (default: normal)',
  })
  @IsEnum(advertisement_type)
  @IsOptional()
  adType?: advertisement_type = advertisement_type.normal;
}