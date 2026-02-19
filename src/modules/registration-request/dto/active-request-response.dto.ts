import { ApiProperty } from "@nestjs/swagger";

export class ActiveRequestResponseDto {
  @ApiProperty({ example: 16 })
  id!: number;

  @ApiProperty({ example: 11 })
  userId!: number;

  @ApiProperty({ example: 1 })
  agencyId!: number;

  @ApiProperty({ example: 'agent_license_verification' })
  requestType!: string;

  @ApiProperty({ example: 'under_review' })
  status!: string;

  @ApiProperty({ example: 'agent' })
  requestedRole!: string;

  @ApiProperty({ example: '2026-02-19T15:55:55.103Z' })
  createdAt!: Date;

  @ApiProperty({ required: false })
  reviewedBy!: number | null;

  @ApiProperty({ required: false })
  reviewNotes!: string | null;

  @ApiProperty({ required: false })
  reviewedAt!: Date | null;
}