import { ApiProperty } from '@nestjs/swagger';
import { formatDate } from '../../../common/utils/date';
import { NavbarUser } from '../domain/value-objects/navbar-user.vo';

export class NavbarProfileResponse {
  @ApiProperty({ example: 'oturoo1' })
  username: string;

  @ApiProperty({ example: 'mbnbDSDFwqedwDAa@AllFreeMail.net' })
  email: string;

   @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://res.cloudinary.com/.../profile-images/120/image.png',
  })
  profileImgUrl: string | null;

  @ApiProperty({
    example: 'Dec 15, 2025, 21:17',
    nullable: true,
  })
  lastLogin: string | null;

  @ApiProperty({ example: 'agency_owner' })
  role: string;

  static fromDomain(user: NavbarUser): NavbarProfileResponse {
    return {
      username: user.username,
      email: user.email,
      profileImgUrl: user.profileImg,
      lastLogin: user.lastLogin ? formatDate(user.lastLogin) : null,
      role: user.role,
    };
  }
}