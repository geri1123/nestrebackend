import { ApiProperty } from '@nestjs/swagger';
import { RegistrationRequestEntity } from "../domain/entities/registration-request.entity";
import { 
  registrationrequest_status, 
  registrationrequest_requested_role,
  registrationrequest_request_type,
  user_role,
  user_status 
} from '@prisma/client';

export class RegistrationRequestResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  userId: number;

  @ApiProperty({ nullable: true, example: 1 })
  agencyId: number | null;

  @ApiProperty({ 
    enum: registrationrequest_status,
    example: registrationrequest_status.pending,
    description: 'Current status of the registration request'
  })
  status: registrationrequest_status;

  @ApiProperty({ 
    enum: registrationrequest_request_type,
    example: registrationrequest_request_type.agent_license_verification,
    description: 'Type of registration request'
  })
  requestType: registrationrequest_request_type;

  @ApiProperty({ 
    enum: registrationrequest_requested_role,
    example: registrationrequest_requested_role.senior_agent,
    description: 'The role being requested by the user',
    nullable: true
  })
  requestedRole: registrationrequest_requested_role | null;

  @ApiProperty({ required: false, example: '2026-02-11T20:26:10.794Z' })
  createdAt?: Date;

  @ApiProperty({ nullable: true, required: false, example: 2 })
  reviewedBy?: number | null;

  @ApiProperty({ nullable: true, required: false, example: 'Approved after review' })
  reviewedNotes?: string | null;

  @ApiProperty({ nullable: true, required: false, example: '2026-02-12T16:17:45.464Z' })
  reviewedAt?: Date | null;

  // ✅ Requester (user) info
  @ApiProperty({ required: false, example: 'John' })
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  lastName?: string;

  @ApiProperty({ required: false, example: 'john@example.com' })
  email?: string;

  @ApiProperty({ required: false, example: 'johndoe' })
  username?: string;

  @ApiProperty({ 
    enum: user_role,
    required: false,
    example: user_role.user,
    description: 'Current role of the user'
  })
  role?: user_role;

  @ApiProperty({ 
    enum: user_status,
    required: false,
    example: user_status.active,
    description: 'Current status of the user account'
  })
  userStatus?: user_status;

  @ApiProperty({ required: false, example: 'jane@example.com' })
  reviewerEmail?: string;

  @ApiProperty({ required: false, example: 'janesmith' })
  reviewerUsername?: string;

  @ApiProperty({ 
    enum: user_role,
    required: false,
    example: user_role.agency_owner,
    description: 'Role of the person who reviewed the request'
  })
  reviewerRole?: user_role;

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
    
    // Requester info
    this.firstName = entity.user?.firstName;
    this.lastName = entity.user?.lastName;
    this.email = entity.user?.email;
    this.username = entity.user?.username;
    this.role = entity.user?.role;
    this.userStatus = entity.user?.status;

    this.reviewerEmail = entity.reviewedByUser?.email;
    this.reviewerUsername = entity.reviewedByUser?.username;
    this.reviewerRole = entity.reviewedByUser?.role;
  }
}