import { advertisement_type } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from "class-validator";

export class CreatePricingDto {
  @IsEnum(advertisement_type)
  adType: advertisement_type;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}