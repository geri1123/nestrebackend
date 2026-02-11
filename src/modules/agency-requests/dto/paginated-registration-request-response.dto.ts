import { ApiProperty } from '@nestjs/swagger';
import { RegistrationRequestResponseDto } from '../../registration-request/dto/registration-request-response.dto';
export class PaginatedRegistrationRequestResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty({ type: [RegistrationRequestResponseDto] })
  requests!: RegistrationRequestResponseDto[];
}