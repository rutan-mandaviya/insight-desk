import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'subscriptions', timestamps: true })
export class Subscription extends Model<Subscription> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({
    type: DataType.ENUM('basic', 'pro', 'enterprise'),
    allowNull: false,
  })
  plan: string;

  @Column({
    type: DataType.ENUM('active', 'cancelled', 'past_due'),
    defaultValue: 'active',
  })
  status: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: Date;

  @BelongsTo(() => User)
  user: User;
}
