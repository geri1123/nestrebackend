import { ApiProperty } from '@nestjs/swagger';

export class NavbarProfileDto {
  @ApiProperty({ example: 'oturoo1' })
  username: string;

  @ApiProperty({ example: 'mbnbDSDFwqedwDAa@AllFreeMail.net' })
  email: string;

  @ApiProperty({ example: null, nullable: true })
  profile_img: string | null;

  @ApiProperty({ example: '2025-11-20T15:18:06.901Z' })
  last_login: string;

  @ApiProperty({ example: 'agency_owner' })
  role: string;
}

export class NavbarResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: NavbarProfileDto })
  profile: NavbarProfileDto;
}