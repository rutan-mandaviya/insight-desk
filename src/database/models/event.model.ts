import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'events', timestamps: true })
export class Event extends Model<Event> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  eventType: string; // e.g., 'page_view', 'button_click', 'login'

  @Column({ type: DataType.JSON })
  metadata: any; // Flexible payload

  @BelongsTo(() => User)
  user: User;
}
