import { IsOptional, IsInt, IsIn, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { WalletTransactionType } from "@prisma/client";
 
export class TransactionPaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;
 
  @IsOptional()
  @IsIn(["date", "amount"])
  sortBy?: "date" | "amount" = "date";
 
  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "desc";
   @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;
}
 