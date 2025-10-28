import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
   @ApiProperty({ example: 'John', description: 'User first name' })
  @IsOptional()
  @IsString({ message: 'firstNameMustBeString' })
  @Length(1, 50, { message: 'firstNameRequired' })
  firstName?: string;

  @ApiProperty({ description: 'User’s last name', example: 'Doe' })
  @IsOptional()
  @IsString({ message: 'lastNameMustBeString' })
  @Length(1, 50, { message: 'lastNameRequired' })
  lastName?: string;

  @ApiProperty({
    description: 'Short bio about the user',
    example: 'Passionate backend developer with a love for NestJS.',
  })
  @IsOptional()
  @IsString({ message: 'aboutMeMustBeString' })
  @Length(0, 500, { message: 'aboutMeLength' })
  aboutMe?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+355691234567',
  })
  @IsOptional()
  @IsString({ message: 'phoneMustBeString' })
  @Length(5, 20, { message: 'phoneLength' })
  phone?: string;
}
