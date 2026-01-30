import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateIf } from "class-validator";

export class CreateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ required: true })
  @IsNumber()
  productId: number;

@ApiProperty({ required: false, description: 'Phone number with country code (e.g., +355691234567)', example: '+355691234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,4}\d{6,14}$/, { 
    message: 'Phone number must be in international format (e.g., +355691234567)' 
  })
  phone?: string;
  
  @ApiProperty({ required: false, description: 'Full name of the sender ' })

  @IsNotEmpty({ message: "Full Name is required" })
  name?: string;

  @ApiProperty({ required: false, description: 'Email of the sender ' })
 
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @ApiProperty({ required: true, description: 'Message content' })
  @IsNotEmpty({ message: "Message is required" })
  message: string;
}
