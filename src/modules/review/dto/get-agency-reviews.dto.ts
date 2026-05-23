import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetAgencyReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Numri i faqes (1, 2, 3...). Madhësia e faqes është fikse 10.',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}