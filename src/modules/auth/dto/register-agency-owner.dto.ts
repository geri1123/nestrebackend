import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseRegistrationDto } from './base-registration.dto';

export class RegisterAgencyOwnerDto extends BaseRegistrationDto {
  @ApiProperty({
    example: 'DreamHomes Agency',
    description: 'The official name of the real estate agency.',
  })
  @IsNotEmpty({ message: 'agencyNameRequired' })
  agency_name: string;

  @ApiProperty({
    example: 'LIC-2025-00123',
    description: 'Official license number of the agency, required for verification.',
  })
  @IsNotEmpty({ message: 'licenseRequired' })
  license_number: string;

  @ApiProperty({
    example: 'Rruga e Kavajës 120, Tirana, Albania',
    description: 'Physical business address of the agency.',
  })
  @IsNotEmpty({ message: 'addressRequired' })
  address: string;
}
