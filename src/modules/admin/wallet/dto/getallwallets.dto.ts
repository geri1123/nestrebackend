import { IsOptional, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class GetAllWalletsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;
}