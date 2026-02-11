import { ApiProperty } from '@nestjs/swagger';


export class NavbarProfileResponse {
  @ApiProperty({ example: 'oturoo1' })
  username!: string;

  @ApiProperty({ example: 'mbnbDSDFwqedwDAa@AllFreeMail.net' })
  email!: string;

   @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://res.cloudinary.com/.../profile-images/120/image.png',
  })
  profileImgUrl!: string | null;

  @ApiProperty({
    example: 'Dec 15, 2025, 21:17',
    nullable: true,
  })
  lastLogin!: string | null;
@ApiProperty({example:"Dec 15, 2025, 21:17"})
createdAt!:string;
  @ApiProperty({ example: 'agency_owner' })
  role!: string;

  
  
}