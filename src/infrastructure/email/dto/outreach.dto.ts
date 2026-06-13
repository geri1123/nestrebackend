import { IsEmail, IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class OutreachAgencyDto {
  @ApiProperty({ example: 'Agjencia Beni' })
  @IsString()
  @IsNotEmpty()
  agencyName!: string;
 
  @ApiProperty({ example: 'info@agenciabeni.al' })
  @IsEmail()
  email!: string;
}
 
export class SendOutreachDto {
  @ApiProperty({ type: [OutreachAgencyDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OutreachAgencyDto)
  agencies!: OutreachAgencyDto[];
}
 