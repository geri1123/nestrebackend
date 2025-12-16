import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumberString,
  Length,
  IsUrl
} from "class-validator";

export class UpdateAgencyDto {
  @ApiPropertyOptional({
    example: 'DreamHomes Agency',
    description: 'Agency name'
  })
  @IsOptional()
  @IsString({message:"emailMustBeString"})
  @IsNotEmpty({message:"agencyNameRequired"})
  agencyName?: string;

  @ApiPropertyOptional({
    example: 'info@dreamhomes.al',
    description: 'Agency email'
  })
  @IsOptional()
  @IsEmail({}, { message: 'emailInvalid' })
  agencyEmail?: string;

  @ApiPropertyOptional({
    example: '+355691234567',
    description: 'Phone number'
  })
  @IsOptional()
  @IsNumberString({}, { message: 'phoneMustBeDigits' })
  @Length(5, 20, { message: 'phoneLength' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Rruga e Kavajës 120, Tirana',
    description: 'Agency address'
  })
  @IsOptional()
  @IsString({message:"addressRequired"})
  @IsNotEmpty({message:"addressRequired"})
  address?: string;

  @ApiPropertyOptional({
    example: 'https://dreamhomes.al',
    description: 'Website URL'
  })
  @IsOptional()
  @IsUrl()
  website?: string;
}
