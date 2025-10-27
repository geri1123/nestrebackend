// src/users/dto/update-profile.dto.ts
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  aboutMe?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;
}
