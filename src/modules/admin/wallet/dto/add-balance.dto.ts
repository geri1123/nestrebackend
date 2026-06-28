import { IsNumber, IsPositive, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class AddBalanceDto {
  @IsInt()
  @Type(() => Number)
  userId!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}