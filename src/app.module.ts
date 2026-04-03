import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeedModule } from './seed/seed.module';
import { CacheModule } from './cache/cache.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),

    SeedModule,

    CacheModule,

    AnalyticsModule,

    ReportsModule,

    UsersModule,
  ],
})
export class AppModule {}
