import { ApiProperty } from '@nestjs/swagger';
import { agency_status } from '@prisma/client';

export class AgencyDetailResponse {
  @ApiProperty({ example: 1, description: 'Agency ID' })
  id: number;

  @ApiProperty({ example: 'DreamHomes Agency', description: 'Agency name' })
  agencyName: string;

  @ApiProperty({
    example: 'LIC-2025-00123',
    description: 'License number',
    required: false,
  })
  licenseNumber: string;

  @ApiProperty({
    example: 'Rruga e Kavajës 120, Tirana',
    description: 'Agency address',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    example: 'active',
    enum: agency_status,
    description: 'Agency status',
  })
  status: agency_status;

  @ApiProperty({
    example: 'AG-2025-001',
    description: 'Public agency code',
    nullable: true,
  })
  publicCode: string | null;

  @ApiProperty({
    example: 'info@dreamhomes.al',
    description: 'Agency email',
    nullable: true,
  })
  agencyEmail: string | null;

  @ApiProperty({
    example: '+355691234567',
    description: 'Phone number',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    example: 'https://dreamhomes.al',
    description: 'Website URL',
    nullable: true,
  })
  website: string | null;

  @ApiProperty({
    example: 'https://bucket.s3.amazonaws.com/logo.jpg',
    description: 'Logo URL',
    nullable: true,
  })
  logo: string | null;

  @ApiProperty({
    example: 42,
    description: 'Owner user ID',
  })
  ownerUserId: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Owner full name',
    required: false,
  })
  ownerName?: string;

  @ApiProperty({
    example: 'john@dreamhomes.al',
    description: 'Owner email',
    required: false,
  })
  ownerEmail?: string;

  @ApiProperty({
    example: '2025-11-03T10:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}
