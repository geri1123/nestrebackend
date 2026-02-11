import { ApiProperty } from '@nestjs/swagger';
import { RegistrationRequestEntity } from "../domain/entities/registration-request.entity";

export class RegistrationRequestResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ nullable: true })
  agencyId: number | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  requestType: string;

  @ApiProperty()
  requestedRole: string;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ nullable: true, required: false })
  reviewedBy?: number | null;

  @ApiProperty({ nullable: true, required: false })
  reviewedNotes?: string | null;

  @ApiProperty({ nullable: true, required: false })
  reviewedAt?: Date | null;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  userStatus?: string;

  constructor(entity: RegistrationRequestEntity) {
    this.id = entity.id!;
    this.userId = entity.userId;
    this.agencyId = entity.agencyId;
    this.status = entity.status;
    this.requestType = entity.requestType;
    this.requestedRole = entity.requestedRole;
    this.createdAt = entity.createdAt;
    this.reviewedBy = entity.reviewedBy;
    this.reviewedNotes = entity.reviewedNotes;
    this.reviewedAt = entity.reviewedAt;
    this.firstName = entity.user?.firstName ?? undefined;
    this.lastName  = entity.user?.lastName ?? undefined;
    this.email = entity.user?.email;
    this.username = entity.user?.username;
    this.role = entity.user?.role;
    this.userStatus = entity.user?.status;
  }
}
