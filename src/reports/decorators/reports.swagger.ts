import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function SwaggerGetUserActivity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get complete activity timeline and history for a specific user',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: 'The unique ID of the user',
    }),
    ApiResponse({
      status: 200,
      description: 'User activity fetched successfully',
    }),
    ApiResponse({ status: 404, description: 'User not found in the system' }),
  );
}

export function SwaggerGetRevenueSummary() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get total revenue, refunds, net revenue, and top paying users',
    }),
    ApiResponse({
      status: 200,
      description: 'Revenue summary generated successfully',
    }),
  );
}

export function SwaggerGetChurnReport() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Get list of cancelled users, their plans, duration, and revenue lost',
    }),
    ApiResponse({
      status: 200,
      description: 'Churn report generated successfully',
    }),
    ApiResponse({ status: 400, description: 'Invalid month format provided' }),
  );
}
