import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString({ message: 'emailMustBeString' })
  @IsEmail({}, { message: 'emailInvalid' })
  @IsNotEmpty({ message: 'emailRequired' })
  email!: string;
}
