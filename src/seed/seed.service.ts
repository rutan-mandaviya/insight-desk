import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { faker } from '@faker-js/faker';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';
import { Transaction } from '../database/models/transaction.model';
import { Event } from '../database/models/event.model';
import { CacheService } from '../cache/cache.service';
import { buildResponse } from 'src/common/utils/response.util';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Subscription) private subscriptionModel: typeof Subscription,
    @InjectModel(Transaction) private transactionModel: typeof Transaction,
    @InjectModel(Event) private eventModel: typeof Event,
    private readonly cacheService: CacheService,
  ) {}

  async seedDatabase() {
    this.logger.log('Starting database seed...');

    await this.eventModel.destroy({ where: {} });
    await this.transactionModel.destroy({ where: {} });
    await this.subscriptionModel.destroy({ where: {} });
    await this.userModel.destroy({ where: {} });

    const usersData = Array.from({ length: 500 }).map(() => ({
      email: faker.internet.email(),
      country: faker.location.countryCode(),
      is_active: faker.datatype.boolean(0.8),
      createdAt: faker.date.recent({ days: 60 }),
    }));
    const users = await this.userModel.bulkCreate(usersData);
    this.logger.log(`Created ${users.length} users.`);

    const plans = ['basic', 'pro', 'enterprise'];
    const statuses = ['active', 'cancelled', 'past_due'];

    const subscriptionsData = [];
    const transactionsData = [];

    for (const user of users) {
      if (faker.datatype.boolean(0.7)) {
        const plan = faker.helpers.arrayElement(plans);
        const amount = plan === 'basic' ? 9.99 : plan === 'pro' ? 29.99 : 99.99;
        const startDate = faker.date.recent({ days: 30 });

        subscriptionsData.push({
          userId: user.id,
          plan,
          status: faker.helpers.arrayElement(statuses),
          amount,
          startDate,
        });

        transactionsData.push({
          userId: user.id,
          amount,
          type: 'payment',
          createdAt: startDate,
        });
      }
    }

    await this.subscriptionModel.bulkCreate(subscriptionsData);
    await this.transactionModel.bulkCreate(transactionsData);
    this.logger.log(
      `Created ${subscriptionsData.length} subscriptions and transactions.`,
    );

    const eventTypes = [
      'page_view',
      'button_click',
      'login',
      'logout',
      'feature_used',
    ];
    const eventsData = [];

    for (const user of users) {
      const eventCount = faker.number.int({ min: 1, max: 20 });
      for (let i = 0; i < eventCount; i++) {
        eventsData.push({
          userId: user.id,
          eventType: faker.helpers.arrayElement(eventTypes),
          metadata: {
            browser: faker.internet.userAgent(),
            ip: faker.internet.ipv4(),
          },
          createdAt: faker.date.recent({ days: 30 }),
        });
      }
    }

    await this.eventModel.bulkCreate(eventsData);
    this.logger.log(`Created ${eventsData.length} events.`);

    this.logger.log('Clearing old analytics and reports cache...');
    await this.cacheService.delByPattern('analytics:*');
    await this.cacheService.delByPattern('reports:*');

    return buildResponse(HttpStatus.OK, 'Database seeded successfully', {
      users: users.length,
      subscriptions: subscriptionsData.length,
      transactions: transactionsData.length,
      events: eventsData.length,
    });
  }
}
