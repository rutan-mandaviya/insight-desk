import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user plan',
    enum: ['basic', 'pro', 'enterprise'],
  })
  plan?: string;

  @ApiPropertyOptional({ description: 'Filter by country code (e.g., IN, US)' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter users created after this date (ISO format)',
    example: '2023-01-01T00:00:00Z',
  })
  created_after?: string;

  @ApiPropertyOptional({
    description: 'Filter users created before this date (ISO format)',
    example: '2023-12-31T23:59:59Z',
  })
  created_before?: string;

  @ApiPropertyOptional({ description: 'Filter active users', type: Boolean })
  is_active?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  limit?: string;
}
