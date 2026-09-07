import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('google_calendar_tokens')
export class GoogleCalendarToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'user_id',
  })
  user_id!: number;

  @Column({
    name: 'access_token',
    type: 'text',
  })
  access_token!: string;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
  })
  refresh_token!: string | null;

  @Column({
    name: 'expiry_date',
    type: 'bigint',
    nullable: true,
  })
  expiry_date!: number | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;
}