import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';
import { Transaction } from '../database/models/transaction.model';
import { Event } from '../database/models/event.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Subscription, Transaction, Event]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
