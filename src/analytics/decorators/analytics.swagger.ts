import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SwaggerGetOverview() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get high-level dashboard metrics (Users, Revenue, Churn)',
    }),
    ApiResponse({
      status: 200,
      description: 'Overview data fetched successfully',
    }),
  );
}

export function SwaggerGetRevenue() {
  return applyDecorators(
    ApiOperation({ summary: 'Get revenue aggregation over time' }),
    ApiResponse({
      status: 200,
      description: 'Revenue data fetched successfully',
    }),
  );
}

export function SwaggerGetRetention() {
  return applyDecorators(
    ApiOperation({ summary: 'Get cohort retention rate for a specific month' }),
    ApiQuery({ name: 'month', required: true, description: 'Format: YYYY-MM' }),
    ApiResponse({
      status: 200,
      description: 'Retention data fetched successfully',
    }),
  );
}

export function SwaggerGetTopEvents() {
  return applyDecorators(
    ApiOperation({ summary: 'Get the most frequently triggered user events' }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of events to return',
    }),
    ApiResponse({
      status: 200,
      description: 'Top events fetched successfully',
    }),
  );
}

export function SwaggerGetSubscriptionBreakdown() {
  return applyDecorators(
    ApiOperation({ summary: 'Get percentage share of each subscription plan' }),
    ApiResponse({
      status: 200,
      description: 'Subscription breakdown fetched successfully',
    }),
  );
}

export function SwaggerGetUserGrowth() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user signup growth over time' }),
    ApiResponse({
      status: 200,
      description: 'User growth data fetched successfully',
    }),
  );
}

export function SwaggerGetUsersByCountry() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user count and total revenue grouped by country',
    }),
    ApiResponse({
      status: 200,
      description: 'Country statistics fetched successfully',
    }),
  );
}
