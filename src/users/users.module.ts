import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../database/models/user.model';
import { Subscription } from '../database/models/subscription.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Subscription])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
