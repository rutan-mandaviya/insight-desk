import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class RevenueSummaryFilterDto {
  @ApiPropertyOptional({ description: 'Start date in YYYY-MM-DD format' })
  from?: string;

  @ApiPropertyOptional({ description: 'End date in YYYY-MM-DD format' })
  to?: string;
}

export class ChurnFilterDto {
  @ApiProperty({
    description: 'Month of cancellation in YYYY-MM format',
    example: '2026-03',
  })
  month: string;
}
