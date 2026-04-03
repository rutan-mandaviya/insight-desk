import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { buildResponse } from 'src/common/utils/response.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User) private userModel: typeof User) {}

  private buildWhereClause(filters: GetUsersFilterDto): WhereOptions<User> {
    const { country, is_active, created_after, created_before } = filters;
    const where: WhereOptions<User> = {};

    country && (where.country = country);

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (created_after || created_before) {
      where.createdAt = {
        ...(created_after && { [Op.gte]: new Date(created_after) }),
        ...(created_before && { [Op.lte]: new Date(created_before) }),
      };
    }

    return where;
  }

  async getUsers(filters: GetUsersFilterDto) {
    this.logger.log(`Fetching users with filters: ${JSON.stringify(filters)}`);

    const page = filters.page ? parseInt(filters.page, 10) : 1;
    const limit = filters.limit ? parseInt(filters.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const whereClause = this.buildWhereClause(filters);

    const includeObject: any = {
      model: Subscription,
      attributes: ['plan', 'status'],
    };

    if (filters.plan) {
      includeObject.where = { plan: filters.plan };
      includeObject.required = true;
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where: whereClause,
      include: [includeObject],
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return buildResponse(HttpStatus.OK, 'Users retrieved successfully', rows, {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    });
  }
}
