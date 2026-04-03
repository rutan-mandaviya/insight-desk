import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { buildResponse } from '../common/utils/response.util';
import { TimeAggregationDto, DateRangeDto } from './dto/analytics-filters.dto';
import {
  SwaggerGetOverview,
  SwaggerGetRevenue,
  SwaggerGetRetention,
  SwaggerGetTopEvents,
  SwaggerGetSubscriptionBreakdown,
  SwaggerGetUserGrowth,
  SwaggerGetUsersByCountry,
} from './decorators/analytics.swagger';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @SwaggerGetOverview()
  async getOverview() {
    const data = await this.analyticsService.getOverview();
    return buildResponse(HttpStatus.OK, 'Overview data fetched', data);
  }

  @Get('revenue')
  @SwaggerGetRevenue()
  async getRevenue(@Query() filters: TimeAggregationDto) {
    const data = await this.analyticsService.getRevenueAnalytics(
      filters.groupBy,
      filters.from,
      filters.to,
    );
    return buildResponse(HttpStatus.OK, 'Revenue data fetched', data);
  }

  @Get('retention')
  @SwaggerGetRetention()
  async getRetention(@Query('month') month: string) {
    const data = await this.analyticsService.getRetention(month);
    return buildResponse(HttpStatus.OK, 'Retention data fetched', data);
  }

  @Get('events/top')
  @SwaggerGetTopEvents()
  async getTopEvents(
    @Query('limit') limit: number = 10,
    @Query() filters: DateRangeDto,
  ) {
    const data = await this.analyticsService.getTopEvents(
      limit,
      filters.from,
      filters.to,
    );
    return buildResponse(HttpStatus.OK, 'Top events fetched', data);
  }

  @Get('subscriptions/breakdown')
  @SwaggerGetSubscriptionBreakdown()
  async getSubscriptionBreakdown() {
    const data = await this.analyticsService.getSubscriptionBreakdown();
    return buildResponse(HttpStatus.OK, 'Subscription breakdown fetched', data);
  }

  @Get('users/growth')
  @SwaggerGetUserGrowth()
  async getUserGrowth(@Query() filters: TimeAggregationDto) {
    const data = await this.analyticsService.getUserGrowth(
      filters.groupBy,
      filters.from,
      filters.to,
    );
    return buildResponse(HttpStatus.OK, 'User growth data fetched', data);
  }

  @Get('users/by-country')
  @SwaggerGetUsersByCountry()
  async getUsersByCountry() {
    const data = await this.analyticsService.getUsersByCountry();
    return buildResponse(HttpStatus.OK, 'Country stats fetched', data);
  }
}
