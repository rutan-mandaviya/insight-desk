import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Subscription } from './subscription.model';
import { Transaction } from './transaction.model';
import { Event } from './event.model';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING })
  country: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @HasMany(() => Subscription)
  subscriptions: Subscription[];

  @HasMany(() => Transaction)
  transactions: Transaction[];

  @HasMany(() => Event)
  events: Event[];
}
