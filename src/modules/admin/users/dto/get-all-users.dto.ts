import { Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { UserRole, UserStatus } from "@prisma/client";

export class GetAllUsersDto {
  @IsOptional()
  @IsIn([
  "active",
  "inactive",
  "pending",
  "suspended",
  "deleted",
  "all",
])
  status?: UserStatus | "deleted" | "all";

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["createdAt", "lastLogin"])
  sortBy?: "createdAt" | "lastLogin" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
}