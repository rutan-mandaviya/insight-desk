import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { buildResponse } from '../common/utils/response.util';
import {
  SwaggerGetChurnReport,
  SwaggerGetRevenueSummary,
  SwaggerGetUserActivity,
} from './decorators/reports.swagger';
import { ChurnFilterDto, RevenueSummaryFilterDto } from './dto/reports.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('user-activity/:userId')
  @SwaggerGetUserActivity()
  async getUserActivity(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.reportsService.getUserActivity(userId);

    return buildResponse(
      HttpStatus.OK,
      'User activity fetched successfully',
      data,
    );
  }

  @Get('revenue-summary')
  @SwaggerGetRevenueSummary()
  async getRevenueSummary(@Query() filters: RevenueSummaryFilterDto) {
    const data = await this.reportsService.getRevenueSummary(
      filters.from,
      filters.to,
    );
    return buildResponse(HttpStatus.OK, 'Revenue summary fetched', data);
  }

  @Get('churn')
  @SwaggerGetChurnReport()
  async getChurnReport(@Query() filters: ChurnFilterDto) {
    const data = await this.reportsService.getChurnReport(filters.month);
    return buildResponse(HttpStatus.OK, 'Churn report fetched', data);
  }
}
