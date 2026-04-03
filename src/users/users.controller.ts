import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

import { ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with dynamic filters and pagination',
  })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  async getUsers(@Query() filters: GetUsersFilterDto) {
    return this.usersService.getUsers(filters);
  }
}
