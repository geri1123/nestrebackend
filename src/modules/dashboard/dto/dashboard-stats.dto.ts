import { ApiProperty } from '@nestjs/swagger';

export class ClickPerDayDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format (UTC)',
    example: '2026-05-10',
  })
  date!: string;

  @ApiProperty({
    description: 'Number of clicks recorded on this day',
    example: 47,
  })
  clicks!: number;
}

export class DashboardStatsResponseDto {
  @ApiProperty({
    description: 'Number of properties currently active',
    example: 12,
  })
  activeProperties!: number;

  @ApiProperty({
    description: 'Total clicks across all properties (lifetime)',
    example: 1247,
  })
  totalClicks!: number;

  @ApiProperty({
    description:
      "How many times the user's properties were saved by other users",
    example: 38,
  })
  totalSaves!: number;

  @ApiProperty({
    description: 'Total number of properties (any status)',
    example: 18,
  })
  totalProperties!: number;

  @ApiProperty({
    description: 'Clicks per day for the last 7 days (oldest first)',
    type: [ClickPerDayDto],
  })
  clicksLast7Days!: ClickPerDayDto[];
}