import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'transactions', timestamps: true })
export class Transaction extends Model<Transaction> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataType.ENUM('payment', 'refund'), allowNull: false })
  type: string;

  @BelongsTo(() => User)
  user: User;
}
