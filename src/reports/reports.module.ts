import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';
import { Transaction } from '../database/models/transaction.model';
import { Event } from '../database/models/event.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Subscription, Transaction, Event]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
