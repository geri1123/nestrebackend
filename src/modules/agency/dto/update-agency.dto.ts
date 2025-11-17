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
  @IsOptional()
  @IsString({ message: "agencyNameRequired" })
  @IsNotEmpty({ message: "agencyNameRequired" })
  agency_name?: string;

  @IsOptional()
  @IsEmail({}, { message: "emailInvalid" })
  agency_email?: string;

  @IsOptional()
  @IsNumberString({}, { message: "phoneMustBeDigits" })
  @Length(5, 20, { message: "phoneLength" })
  phone?: string;  

  @IsOptional()
  @IsString({ message: "addressInvalid" })
  @IsNotEmpty({ message: "addressRequired" })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: "websiteInvalid" })
  website?: string;
}
