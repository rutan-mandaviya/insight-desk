import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CacheService } from '../cache/cache.service';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';
import { Transaction } from '../database/models/transaction.model';
import { Event } from '../database/models/event.model';
import { Op } from 'sequelize';
import { buildResponse } from 'src/common/utils/response.util';
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Subscription) private subscriptionModel: typeof Subscription,
    @InjectModel(Transaction) private transactionModel: typeof Transaction,
    @InjectModel(Event) private eventModel: typeof Event,
    private readonly cacheService: CacheService,
  ) {}

  async getUserActivity(userId: number) {
    const cacheKey = `reports:user-activity:${userId}`;

    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Returning activity for User ${userId} from Cache ⚡`);
      return cachedData;
    }

    this.logger.log(`Fetching activity for User ${userId} from DB 🐢`);

    const userActivity = await this.userModel.findByPk(userId, {
      include: [
        { model: Subscription },
        {
          model: Transaction,
          limit: 5,
          order: [['createdAt', 'DESC']],
          separate: true,
        },
        {
          model: Event,
          limit: 10,
          order: [['createdAt', 'DESC']],
          separate: true,
        },
      ],
    });

    if (!userActivity) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.cacheService.set(cacheKey, userActivity, 3600);

    return buildResponse(
      200,
      `Activity for User ${userId} fetched successfully`,
      userActivity,
    );
  }

  async getRevenueSummary(from?: string, to?: string) {
    const cacheKey = `reports:revenue-summary:${from || 'all'}:${to || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const dateFilter: any = {};
    let sqlDateFilter = '';
    const replacements: any = {};

    if (from || to) {
      dateFilter.createdAt = {};
      if (from) {
        dateFilter.createdAt[Op.gte] = new Date(from);
        sqlDateFilter += ' AND t.createdAt >= :from';
        replacements.from = from;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt[Op.lte] = toDate;

        sqlDateFilter += ' AND t.createdAt <= :to';
        replacements.to = `${to} 23:59:59`;
      }
    }

    const topUsersQuery = `
      SELECT 
        u.id as userId, 
        u.email, 
        SUM(t.amount) as totalSpent
      FROM transactions t
      INNER JOIN users u ON t.userId = u.id
      WHERE t.type = 'payment' ${sqlDateFilter}
      GROUP BY u.id, u.email
      ORDER BY totalSpent DESC
      LIMIT 5;
    `;

    const [totalPayments, totalRefunds, topUsers] = await Promise.all([
      this.transactionModel.sum('amount', {
        where: { type: 'payment', ...dateFilter },
      }),
      this.transactionModel.sum('amount', {
        where: { type: 'refund', ...dateFilter },
      }),
      this.transactionModel.sequelize.query(topUsersQuery, {
        replacements,
        type: 'SELECT' as any,
      }),
    ]);

    const revenue = totalPayments || 0;
    const refunds = totalRefunds || 0;

    const summary = {
      totalRevenue: revenue,
      totalRefunds: refunds,
      netRevenue: revenue - refunds,
      topPayingUsers: topUsers,
    };

    await this.cacheService.set(cacheKey, summary, 3600);
    return buildResponse(HttpStatus.OK, 'Revenue summary fetched', summary);
  }

  async getChurnReport(month: string) {
    const cacheKey = `reports:churn:${month}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT 
        u.id AS userId,
       
        u.email,
        s.plan,
        s.createdAt AS subscribeDate,
        s.updatedAt AS cancelDate,
        DATEDIFF(s.updatedAt, s.createdAt) AS daysSubscribed,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE userId = u.id AND type = 'payment'), 0) AS lifetimeValueLost
      FROM subscriptions s
      INNER JOIN users u ON s.userId = u.id
      WHERE s.status = 'cancelled' 
        AND DATE_FORMAT(s.updatedAt, '%Y-%m') = :month
      ORDER BY lifetimeValueLost DESC;
    `;

    const [churnedUsers = []] = await this.subscriptionModel.sequelize.query(
      query,
      {
        replacements: { month },
        type: 'SELECT' as any,
      },
    );

    const report = {
      cancellationMonth: month,
      totalChurnedUsers: churnedUsers.length,
      data: churnedUsers,
    };

    await this.cacheService.set(cacheKey, report, 3600);
    return buildResponse(HttpStatus.OK, 'Churn report fetched', report);
  }
}
