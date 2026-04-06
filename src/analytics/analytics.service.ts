import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CacheService } from '../cache/cache.service';
import { User } from '../database/models/user.model';
import { Transaction } from '../database/models/transaction.model';
import { Op } from 'sequelize';
import { col, fn, literal } from 'sequelize';
import { Event } from '../database/models/event.model';
import { Subscription } from '../database/models/subscription.model';
import { buildResponse } from 'src/common/utils/response.util';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Transaction) private transactionModel: typeof Transaction,
    private readonly cacheService: CacheService,
    @InjectModel(Event) private eventModel: typeof Event,
    @InjectModel(Subscription) private subscriptionModel: typeof Subscription,
  ) {}

  async getRevenueAnalytics(
    groupBy: 'day' | 'week' | 'month' = 'day',
    from?: string,
    to?: string,
  ) {
    const cacheKey = `analytics/revenue/${groupBy}/${from || 'x'}/${to || 'x'}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;
    const whereClause: any = {
      type: 'payment',
    };
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    let dateFormat = '%d-%m-%Y';
    if (groupBy === 'month') dateFormat = '%m-%Y';
    if (groupBy === 'week') dateFormat = '%X-%V';

    const revenueData = await this.transactionModel.findAll({
      where: whereClause,
      attributes: [
        [literal(`DATE_FORMAT(createdAt,'${dateFormat}')`), 'period'],
        [fn('SUM', col('amount')), 'totalRevenue'],
      ],
      group: ['period'],
      order: [[literal('period'), 'ASC']],
      raw: true,
    });

    await this.cacheService.set(cacheKey, revenueData, 600);

    return buildResponse(
      HttpStatus.OK,
      'Revenue analytics fetched',
      revenueData,
    );
  }

  async getOverview() {
    const cacheKey = 'analytics/overview';

    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalRevenue,
      mrrData,
      subscriptionStats,
    ] = await Promise.all([
      this.userModel.count(),
      this.userModel.count({ where: { is_active: true } }),
      this.userModel.count({
        where: { createdAt: { [Op.gte]: startOfMonth } },
      }),
      this.transactionModel.sum('amount', { where: { type: 'payment' } }),
      this.subscriptionModel.sum('amount', { where: { status: 'active' } }),
      this.subscriptionModel.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
    ]);

    const stats = subscriptionStats as any[];
    const totalSubs = stats.reduce((sum, s) => sum + Number(s.count), 0);
    const cancelledSubs =
      stats.find((s) => s.status === 'cancelled')?.count || 0;
    const churnRate =
      totalSubs > 0 ? (Number(cancelledSubs) / totalSubs) * 100 : 0;

    const overviewData = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalRevenue: totalRevenue || 0,
      mrr: mrrData || 0,
      churnRate: parseFloat(churnRate.toFixed(2)) + '%',
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, overviewData, 300);
    return buildResponse(HttpStatus.OK, 'Overview data fetched', overviewData);
  }

  async getRetention(month: string) {
    const cacheKey = `analytics:retention:${month}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const query = `
    SELECT 
      COUNT(DISTINCT u.id) as totalSignups,
      COUNT(DISTINCT e.userId) as retainedUsers,
      (COUNT(DISTINCT e.userId) / COUNT(DISTINCT u.id)) * 100 as retentionRate
    FROM users u
    LEFT JOIN events e ON u.id = e.userId AND DATE_FORMAT(e.createdAt, '%Y-%m') > :month
    WHERE DATE_FORMAT(u.createdAt, '%Y-%m') = :month;
  `;

    const [result] = await this.userModel.sequelize.query(query, {
      replacements: { month },
      type: 'SELECT' as any,
    });

    await this.cacheService.set(cacheKey, result, 3600);
    return buildResponse(HttpStatus.OK, 'Retention data fetched', result);
  }

  async getTopEvents(limit: number = 10, from?: string, to?: string) {
    const cacheKey = `analytics:events:top:${limit}:${from || 'all'}:${to || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      this.logger.log('Returning top events from Cache ⚡');
      return cached;
    }

    const whereClause: any = {};
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    const topEvents = await this.eventModel.findAll({
      where: whereClause,
      attributes: ['eventType', [fn('COUNT', col('id')), 'count']],
      group: ['eventType'],
      order: [[literal('count'), 'DESC']],
      limit: Number(limit),
      raw: true,
    });

    await this.cacheService.set(cacheKey, topEvents, 300);
    return buildResponse(HttpStatus.OK, 'Top events fetched', topEvents);
  }

  async getUserGrowth(
    groupBy: 'day' | 'week' | 'month' = 'day',
    from?: string,
    to?: string,
  ) {
    const cacheKey = `analytics:users:growth:${groupBy}:${from || 'all'}:${to || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      this.logger.log('Returning user growth from Cache ⚡');
      return cached;
    }

    const whereClause: any = {};
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') dateFormat = '%Y-%m';
    if (groupBy === 'week') dateFormat = '%X-%V';

    const growthData = await this.userModel.findAll({
      where: whereClause,
      attributes: [
        [literal(`DATE_FORMAT(createdAt, '${dateFormat}')`), 'period'],
        [fn('COUNT', col('id')), 'newUsers'],
      ],
      group: ['period'],
      order: [[literal('period'), 'ASC']],
      raw: true,
    });

    await this.cacheService.set(cacheKey, growthData, 600);
    return buildResponse(HttpStatus.OK, 'User growth data fetched', growthData);
  }

  async getUsersByCountry() {
    const cacheKey = `analytics:users:by-country`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      this.logger.log('Returning country stats from Cache ⚡');
      return cached;
    }

    const query = `
      SELECT 
        u.country, 
        COUNT(DISTINCT u.id) as totalUsers, 
        COALESCE(SUM(t.amount), 0) as totalRevenue
      FROM users u
      LEFT JOIN transactions t ON u.id = t.userId AND t.type = 'payment'
      GROUP BY u.country
      ORDER BY totalRevenue DESC
      LIMIT 10;
    `;

    const [countryStats] = await this.userModel.sequelize.query(query, {
      type: 'SELECT' as any,
    });

    await this.cacheService.set(cacheKey, countryStats, 3600);
    return buildResponse(HttpStatus.OK, 'Country stats fetched', countryStats);
  }

  async getSubscriptionBreakdown() {
    const cacheKey = `analytics:subscriptions:breakdown`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      this.logger.log('Returning subscription breakdown from Cache ⚡');
      return cached;
    }

    const breakdown: any[] = await this.subscriptionModel.findAll({
      where: { status: 'active' },
      attributes: ['plan', [fn('COUNT', col('id')), 'count']],
      group: ['plan'],
      raw: true,
    });

    const totalSubscriptions = breakdown.reduce(
      (sum, item) => sum + Number(item.count),
      0,
    );

    const result = breakdown.map((item) => ({
      plan: item.plan,
      count: Number(item.count),
      percentage:
        totalSubscriptions > 0
          ? parseFloat(
              ((Number(item.count) / totalSubscriptions) * 100).toFixed(2),
            )
          : 0,
    }));

    await this.cacheService.set(cacheKey, result, 3600);
    return buildResponse(
      HttpStatus.OK,
      'Subscription breakdown fetched',
      result,
    );
  }
}
