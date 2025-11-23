import { IsInt, IsEnum, IsOptional } from "class-validator";
import { advertisement_type } from "@prisma/client";

export class AdvertiseDto {
  @IsInt()
  productId: number;

  @IsEnum(advertisement_type)
  @IsOptional()
  adType?: advertisement_type = "normal"; 
}