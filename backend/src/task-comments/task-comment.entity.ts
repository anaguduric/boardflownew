import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('taskcomments')
export class TaskComment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  comment_id!: number;

  @Column({ name: 'task_id', type: 'int' })
  task_id!: number;

  @Column({ name: 'user_id', type: 'int' })
  user_id!: number;

  @Column({ name: 'comment_text', type: 'text' })
  comment_text!: string;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  // =========================================================
  // USER
  // =========================================================

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
  })
  user!: User;
}