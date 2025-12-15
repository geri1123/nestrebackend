import { ApiProperty } from '@nestjs/swagger';
import { formatDate } from '../../../common/utils/date';
import { User } from '../domain/entities/user.entity';



export class UserProfileResponse {
  @ApiProperty({ example: 120 })
  id: number;

  @ApiProperty({ example: 'gerise222' })
  username: string;

  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty({ example: 'John', nullable: true })
  firstName: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName: string | null;

  @ApiProperty({ example: 'About me...', nullable: true })
  aboutMe: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://res.cloudinary.com/.../profile-images/120/image.png',
  })
  profileImgUrl: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'profile-images/120/image',
  })
  profileImgPublicId: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '+355691234567',
  })
  phone: string | null;

  @ApiProperty({ example: 'agency_owner' })
  role: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: 'Dec 04, 2025, 18:18' })
  createdAt: string;

  @ApiProperty({ example: 'Dec 15, 2025, 21:54', nullable: true })
  updatedAt: string | null;

  @ApiProperty({ example: 'Dec 15, 2025, 21:17', nullable: true })
  lastLogin: string | null;


  static fromDomain(user: User): UserProfileResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      aboutMe: user.aboutMe,
      profileImgUrl: user.profileImgUrl,
      profileImgPublicId: user.profileImgPublicId,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: formatDate(user.createdAt)!,
      updatedAt: formatDate(user.updatedAt),
      lastLogin: formatDate(user.lastLogin),
    };
  }
}
