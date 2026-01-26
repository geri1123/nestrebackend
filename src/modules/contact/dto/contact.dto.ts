import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";

export class CreateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ required: true })
  @IsNumber()
  productId: number;

  @ApiProperty({ required: false, description: 'Full name of the sender (required only for guests)' })

  @IsNotEmpty({ message: "Full Name is required" })
  name?: string;

  @ApiProperty({ required: false, description: 'Email of the sender (required only for guests)' })
 
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @ApiProperty({ required: true, description: 'Message content' })
  @IsNotEmpty({ message: "Message is required" })
  message: string;
}
