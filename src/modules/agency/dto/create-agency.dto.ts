import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateAgencyDto {

  @ApiProperty({ example: 'DreamHomes Agency' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'agencyNameRequired' })
  @IsNotEmpty({ message: 'agencyNameRequired' })
  @Matches(/\S/, { message: 'agencyNameRequired' })
  agency_name: string;

  @ApiProperty({ example: 'LIC-2025-00123' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'licenseRequired' })
  @IsNotEmpty({ message: 'licenseRequired' })
  @Matches(/\S/, { message: 'licenseRequired' })
  license_number: string;

  @ApiProperty({ example: 'Rruga e Kavajës 120, Tirana, Albania' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'addressRequired' })
  @IsNotEmpty({ message: 'addressRequired' })
  @Matches(/\S/, { message: 'addressRequired' })
  address: string;
}