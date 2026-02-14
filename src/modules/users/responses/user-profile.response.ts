import { ApiProperty } from '@nestjs/swagger';
import { formatDate } from '../../../common/utils/date';
import { UserProfileData } from '../application/use-cases/get-user-profile.use-case';
import { AgentPermissionKey, AgentPermissions } from '../../../common/types/permision.type';
import { AgentPermissionsResponse } from './types/agent-permissions.response.type';
import { mapPermissionsToResponse } from './agent-permissions.response.mapper';

export class UserProfileResponse {
  @ApiProperty({ example: 120 })
  id!: number;

  @ApiProperty({ example: 'gerise222' })
  username!: string;

  @ApiProperty({ example: 'user@email.com' })
  email!: string;

  @ApiProperty({ example: 'John', nullable: true })
  firstName!: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName!: string | null;

  @ApiProperty({ example: 'About me...', nullable: true })
  aboutMe!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://res.cloudinary.com/.../profile-images/120/image.png',
  })
  profileImgUrl!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'profile-images/120/image',
  })
  profileImgPublicId!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '+355691234567',
  })
  phone!: string | null;

  @ApiProperty({ example: 'agent' }) // or 'agency_owner', 'user'
  role!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: true })
  emailVerified!: boolean;

  @ApiProperty({ example: 'Dec 04, 2025, 18:18' })
  createdAt!: String;

  @ApiProperty({ example: 'Dec 15, 2025, 21:54', nullable: true })
  updatedAt!: String | null;

  @ApiProperty({ example: 'Dec 15, 2025, 21:17', nullable: true })
  lastLogin!: String| null;

  // Agent-specific data (only present if role is 'agent')
  @ApiProperty({
    required: false,
    example: {
      agencyAgentId: 1,
      roleInAgency: 'agent',
      status: 'active',
      commissionRate: 10,
      startDate: '2025-12-17T17:28:49.846Z',
      updatedAt: '2025-12-17T17:28:49.846Z',
      permissions: {
        canEditOwnPost: true,
        canEditOthersPost: false,
      },
      agency: {
        id: 1,
        name: 'Best Agency',
        email: 'agency@example.com',
        logo: 'https://...',
        website: 'https://...',
        status: 'active',
      },
    },
  })
  agentProfile?: {
    agencyAgentId: number;
    roleInAgency: string;
    status: string;
    commissionRate: number | null;
    startDate: Date | null;
    updatedAt: Date | null;
    permissions:  AgentPermissionsResponse ;
    agency: {
      id: number;
      name: string;
      email: string | null;
      logo: string | null;
      website: string | null;
      status: string;
    };
  };

  // Agency owner-specific data (only present if role is 'agency_owner')
  @ApiProperty({
    required: false,
    example: {
      id: 1,
      name: 'Best Agency',
      email: 'agency@example.com',
      logo: 'https://...',
      status: 'active',
      address: '123 Main St',
      phone: '+355691234567',
      website: 'https://...',
      licenseNumber: 'LIC123456',
      publicCode: 'ABC123',
    },
  })
  agency?: {
    id: number;
    name: string;
    email: string | null;
    logo: string | null;
    status: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    licenseNumber: string;
    publicCode: string | null;
  };

  static fromDomain(data: UserProfileData) {
    return {
      ...data,
      agentProfile: data.agentProfile
        ? {
            ...data.agentProfile,
            permissions: mapPermissionsToResponse(
              data.agentProfile.permissions,
            ),
          }
        : undefined,
    };
  }
}
// import { ApiProperty } from '@nestjs/swagger';
// import { formatDate } from '../../../common/utils/date';
// import { User } from '../domain/entities/user.entity';



// export class UserProfileResponse {
//   @ApiProperty({ example: 120 })
//   id!: number;

//   @ApiProperty({ example: 'gerise222' })
//   username!: string;

//   @ApiProperty({ example: 'user@email.com' })
//   email!: string;

//   @ApiProperty({ example: 'John', nullable: true })
//   firstName!: string | null;

//   @ApiProperty({ example: 'Doe', nullable: true })
//   lastName!: string | null;

//   @ApiProperty({ example: 'About me...', nullable: true })
//   aboutMe!: string | null;

//   @ApiProperty({
//     type: String,
//     nullable: true,
//     example:
//       'https://res.cloudinary.com/.../profile-images/120/image.png',
//   })
//   profileImgUrl!: string | null;

//   @ApiProperty({
//     type: String,
//     nullable: true,
//     example: 'profile-images/120/image',
//   })
//   profileImgPublicId!: string | null;

//   @ApiProperty({
//     type: String,
//     nullable: true,
//     example: '+355691234567',
//   })
//   phone!: string | null;

//   @ApiProperty({ example: 'agency_owner' })
//   role!: string;

//   @ApiProperty({ example: 'active' })
//   status!: string;

//   @ApiProperty({ example: true })
//   emailVerified!: boolean;

//   @ApiProperty({ example: 'Dec 04, 2025, 18:18' })
//   createdAt!: string;

//   @ApiProperty({ example: 'Dec 15, 2025, 21:54', nullable: true })
//   updatedAt!: string | null;

//   @ApiProperty({ example: 'Dec 15, 2025, 21:17', nullable: true })
//   lastLogin!: string | null;


//   static fromDomain(user: User): UserProfileResponse {
//     return {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       aboutMe: user.aboutMe,
//       profileImgUrl: user.profileImgUrl,
//       profileImgPublicId: user.profileImgPublicId,
//       phone: user.phone,
//       role: user.role,
//       status: user.status,
//       emailVerified: user.emailVerified,
//       createdAt: formatDate(user.createdAt)!,
//       updatedAt: formatDate(user.updatedAt),
//       lastLogin: formatDate(user.lastLogin),
//     };
//   }
// }
