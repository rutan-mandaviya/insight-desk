import { ApiPropertyOptional } from '@nestjs/swagger';
export class TimeAggregationDto {
  @ApiPropertyOptional({
    enum: ['day', 'week', 'month'],
    default: 'day',
    description: 'Grouping period (e.g., day, week, month)',
  })
  groupBy?: 'day' | 'week' | 'month' = 'day';

  @ApiPropertyOptional({ description: 'Start date in YYYY-MM-DD format' })
  from?: string;

  @ApiPropertyOptional({ description: 'End date in YYYY-MM-DD format' })
  to?: string;
}
export class DateRangeDto {
  @ApiPropertyOptional({ description: 'Start date in YYYY-MM-DD format' })
  from?: string;

  @ApiPropertyOptional({ description: 'End date in YYYY-MM-DD format' })
  to?: string;
}
